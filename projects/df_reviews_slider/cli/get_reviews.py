#!/usr/bin/env python3
"""
DanForge get-reviews — сбор отзывов inSales + Яндекс, генерация Liquid-сниппета.

Автор: DanForge · https://danforge.ru
"""
from __future__ import annotations

import argparse
import base64
import json
import random
import re
import sys
import textwrap
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Callable
from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

import requests

from clients_manager import PARSER_VERSION, write_run_log

SNIPPET_INNER_NAME = "danforge_reviews_yandex.liquid"
SNIPPET_LEGACY_NAME = "danforge_reviews_slides.liquid"
SNIPPET_KEY = f"snippets/{SNIPPET_INNER_NAME}"
USER_AGENT = f"DanForge-get-reviews/{PARSER_VERSION} (+https://danforge.ru)"


@dataclass
class Review:
    author: str
    content: str
    rating: int
    source: str  # insales | yandex
    avatar_url: str | None = None
    created_at: str | None = None
    photo_urls: list[str] = field(default_factory=list)


@dataclass
class Config:
    shop: str
    api_key: str
    password: str
    theme_id: int | None = None
    yandex_org_url: str | None = None
    yandex_reviews_file: str | None = None
    sample_count: int = 20
    yandex_limit: int = 0
    insales_ratio: float = 0.5
    min_text_length: int = 10
    output_dir: str = "output"
    upload_avatars: bool = False
    client_name: str | None = None
    min_rating: int = 1
    source_mode: str = "yandex"
    prefer_with_avatar: bool = False
    client_mode: str = "api"  # api | manual
    upload_to_theme: bool = True
    dry_run: bool = False
    use_playwright: bool = False


def load_config(path: Path) -> Config:
    data = json.loads(path.read_text(encoding="utf-8"))
    cfg_dir = path.parent.resolve()
    output_dir = data.get("output_dir", "output")
    if not Path(output_dir).is_absolute():
        output_dir = str((cfg_dir / output_dir).resolve())
    return Config(
        shop=data["shop"].replace("https://", "").replace("http://", "").strip("/"),
        api_key=data["api_key"],
        password=data["password"],
        theme_id=normalize_theme_id(data.get("theme_id")),
        yandex_org_url=data.get("yandex_org_url"),
        yandex_reviews_file=data.get("yandex_reviews_file"),
        sample_count=int(data.get("sample_count", 20)),
        yandex_limit=int(data.get("yandex_limit", data.get("sample_count", 0))),
        insales_ratio=float(data.get("insales_ratio", 0.5)),
        min_text_length=int(data.get("min_text_length", 10)),
        output_dir=output_dir,
        upload_avatars=bool(data.get("upload_avatars", False)),
        client_name=data.get("client_name"),
        min_rating=int(data.get("min_rating", 1)),
        source_mode=str(data.get("source_mode", "yandex")),
        prefer_with_avatar=bool(data.get("prefer_with_avatar", False)),
        client_mode=str(data.get("client_mode", "api")),
        upload_to_theme=bool(data.get("upload_to_theme", True)),
        dry_run=bool(data.get("dry_run", False)),
        use_playwright=bool(data.get("use_playwright", False)),
    )


PLACEHOLDER_MARKERS = (
    "your-shop",
    "YOUR_API",
    "your-company",
    "example.com",
)


def validate_config(cfg: Config, config_path: Path) -> None:
    """Проверяет, что config.json заполнен реальными данными."""
    problems: list[str] = []

    if any(m.lower() in cfg.shop.lower() for m in ("your-shop", "example")):
        problems.append(f'shop: укажите реальный адрес магазина (например "mystore.myinsales.ru")')

    if not cfg.api_key or "YOUR_API" in cfg.api_key or len(cfg.api_key) < 8:
        problems.append("api_key: укажите ключ из админки → Приложения → Разработчикам")

    if not cfg.password or "YOUR_API" in cfg.password or len(cfg.password) < 8:
        problems.append("password: укажите пароль API-ключа (не пароль от админки)")

    if problems:
        msg = (
            f"config.json ({config_path}) не заполнен:\n"
            + "\n".join(f"  • {p}" for p in problems)
            + "\n\nВажно: команда copy config.example.json config.json ПЕРЕЗАПИСЫВАЕТ файл."
            + "\nСначала copy, потом редактируйте config.json."
        )
        raise SystemExit(msg)


def validate_manual_config(cfg: Config, config_path: Path) -> None:
    """Минимальная проверка для ручного режима (без API inSales)."""
    problems: list[str] = []

    if not (cfg.yandex_org_url or "").strip() and not (cfg.yandex_reviews_file or "").strip():
        problems.append(
            "yandex_org_url или yandex_reviews_file: укажите источник отзывов Яндекса"
        )

    yandex_file = (cfg.yandex_reviews_file or "").strip()
    if yandex_file and not Path(yandex_file).exists():
        problems.append(f"yandex_reviews_file: файл не найден — {yandex_file}")

    if problems:
        msg = (
            f"Ручной режим ({config_path}):\n"
            + "\n".join(f"  • {p}" for p in problems)
        )
        raise SystemExit(msg)


def is_manual_client(cfg: Config) -> bool:
    """Клиент без API inSales — только генерация файла и ручная вставка сниппета."""
    if (cfg.client_mode or "").lower() == "manual":
        return True
    if (cfg.api_key or "").strip() == "manual-no-api":
        return True
    shop = (cfg.shop or "").strip().lower()
    return shop.endswith(".manual.local")


def validate_client_config(cfg: Config, config_path: Path) -> None:
    if is_manual_client(cfg):
        validate_manual_config(cfg, config_path)
    else:
        validate_config(cfg, config_path)


def normalize_theme_id(value: Any) -> int | None:
    """Приводит theme_id из config/UI к int или None."""
    if value is None or value == "":
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def theme_is_published(theme: dict) -> bool:
    return bool(theme.get("isPublished") or theme.get("is_published"))


def theme_label(theme: dict) -> str:
    theme_id = theme.get("id", "?")
    title = theme.get("title") or theme.get("name") or "—"
    status = "опубликована" if theme_is_published(theme) else "черновик"
    return f"{theme_id}: {title} ({status})"


def check_api_connection(cfg: Config) -> None:
    """Проверка доступа к API магазина."""
    base, auth = insales_session(cfg)
    resp = requests.get(
        f"{base}/admin/account.json",
        auth=auth,
        headers={"User-Agent": USER_AGENT},
        timeout=30,
    )
    if resp.status_code == 401:
        raise SystemExit(
            "Ошибка 401: неверный api_key или password.\n"
            "Создайте ключ: Настройки → Приложения → Разработчикам → Создать ключ доступа."
        )
    if resp.status_code == 404:
        raise SystemExit(
            f"Ошибка 404: магазин не найден — https://{cfg.shop}\n"
            "Проверьте поле shop: только домен, без https://\n"
            'Пример: "myshop.myinsales.ru" или ваш кастомный домен.'
        )
    resp.raise_for_status()
    account = resp.json()
    title = account.get("title") or account.get("subdomain") or cfg.shop
    print(f"Подключение OK: {title}")


def report_themes_for_check(cfg: Config) -> None:
    """Показывает настроенную тему и список тем в магазине."""
    cfg.theme_id = normalize_theme_id(cfg.theme_id)
    if cfg.theme_id:
        selected = fetch_theme_by_id(cfg, cfg.theme_id)
        if selected:
            print(f"Тема для upload: {theme_label(selected)} ← выбрана в config")
        else:
            print(
                f"Тема для upload: id={cfg.theme_id} — НЕ НАЙДЕНА в магазине.\n"
                "  Проверьте поле «ID темы» или права API-ключа."
            )
    else:
        themes = fetch_themes(cfg)
        if themes:
            auto = themes[0]
            print(
                "Тема для upload: не указана — будет использована первая опубликованная:\n"
                f"  {theme_label(auto)}"
            )
        else:
            print("Тема для upload: не указана и опубликованные темы не найдены.")

    all_themes = fetch_all_themes(cfg)
    if not all_themes:
        print("Темы в магазине: не найдены.")
        return

    print("Темы в магазине:")
    for theme in all_themes[:10]:
        prefix = "  → " if cfg.theme_id and int(theme.get("id", 0)) == cfg.theme_id else "    "
        marker = " ← выбрана" if cfg.theme_id and int(theme.get("id", 0)) == cfg.theme_id else ""
        print(f"{prefix}{theme_label(theme)}{marker}")
    if len(all_themes) > 10:
        print(f"    … ещё {len(all_themes) - 10}")


def insales_session(cfg: Config) -> tuple[str, tuple[str, str]]:
    base = f"https://{cfg.shop}"
    return base, (cfg.api_key, cfg.password)


def fetch_insales_reviews(cfg: Config) -> list[Review]:
    base, auth = insales_session(cfg)
    reviews: list[Review] = []
    total_raw = 0
    published_raw = 0
    page = 1
    per_page = 100

    while True:
        resp = requests.get(
            f"{base}/admin/reviews.json",
            auth=auth,
            params={"page": page, "per_page": per_page},
            headers={"User-Agent": USER_AGENT},
            timeout=60,
        )
        if resp.status_code == 404:
            raise SystemExit(
                f"Ошибка 404 на /admin/reviews.json для https://{cfg.shop}\n"
                "Возможные причины:\n"
                "  1. Неверный shop в config.json\n"
                "  2. API-ключ без доступа к отзывам\n"
                "  3. Отзывы отключены в магазине\n"
                "Проверьте: python get_reviews.py --check"
            )
        if resp.status_code == 401:
            raise SystemExit("Ошибка 401: неверный api_key или password.")
        resp.raise_for_status()
        batch = resp.json()
        if not batch:
            break

        for item in batch:
            total_raw += 1
            if item.get("published"):
                published_raw += 1
            if not item.get("published"):
                continue
            content = (item.get("content") or "").strip()
            if len(content) < cfg.min_text_length:
                continue
            avatar = None
            photo_urls: list[str] = []
            img = item.get("first_image") or {}
            thumb = img.get("thumb_url") or img.get("small_url")
            if thumb and "no_image" not in thumb:
                avatar = thumb if thumb.startswith("http") else f"{base}{thumb}"

            for image in item.get("images") or []:
                url = image.get("original_url") or image.get("large_url") or image.get("url")
                if not url:
                    continue
                full = url if str(url).startswith("http") else f"{base}{url}"
                if full not in photo_urls:
                    photo_urls.append(full)

            reviews.append(
                Review(
                    author=(item.get("author") or "Покупатель").strip(),
                    content=content,
                    rating=normalize_stars(item.get("rating")),
                    source="insales",
                    avatar_url=avatar,
                    created_at=item.get("created_at"),
                    photo_urls=photo_urls,
                )
            )

        if len(batch) < per_page:
            break
        page += 1

    if total_raw == 0:
        print("  в API 0 отзывов — добавьте отзывы в админке: Товары -> Отзывы")
    elif len(reviews) == 0 and published_raw == 0:
        print(f"  в API {total_raw} отзывов, но 0 опубликованных (модерация?)")
    elif len(reviews) == 0:
        print(f"  опубликованных {published_raw}, но тексты короче {cfg.min_text_length} символов")

    return reviews


def normalize_stars(rating: Any) -> int:
    if rating is None:
        return 5
    try:
        value = float(rating)
    except (TypeError, ValueError):
        return 5
    if value > 5:
        value = round(value / 2)
    return max(1, min(5, round(value)))


def stars_html(rating: int) -> str:
    rating = max(1, min(5, rating))
    return "★" * rating + "☆" * (5 - rating)


def liquid_escape(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
        .replace('"', "&quot;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace("\n", " ")
        .strip()
    )


def load_yandex_from_file(path: Path) -> list[Review]:
    data = json.loads(path.read_text(encoding="utf-8"))
    items = data if isinstance(data, list) else data.get("reviews", [])
    result: list[Review] = []
    for item in items:
        content = (item.get("text") or item.get("content") or "").strip()
        if len(content) < 5:
            continue
        photos = item.get("photos") or item.get("photo_urls") or []
        if isinstance(photos, str):
            photos = [photos]
        photo_urls = [str(p) for p in photos if p]
        result.append(
            Review(
                author=(item.get("name") or item.get("author") or "Клиент").strip(),
                content=content,
                rating=normalize_stars(item.get("stars") or item.get("rating")),
                source="yandex",
                avatar_url=item.get("icon_href") or item.get("avatar_url"),
                created_at=item.get("date"),
                photo_urls=photo_urls,
            )
        )
    return result


YANDEX_MAX_PAGES = 20
YANDEX_SHOP_DIGEST_URL = "https://reviews.yandex.ru/ugcpub/digest"
YANDEX_SHOP_PAGE_LIMIT = 25
YANDEX_PAGE_HEADERS = {
    "User-Agent": USER_AGENT,
    "Accept-Language": "ru-RU,ru;q=0.9",
}


def is_yandex_shop_url(url: str) -> bool:
    parsed = urlparse(url)
    host = (parsed.netloc or "").lower()
    path = parsed.path or ""
    return "reviews.yandex.ru" in host and "/shop/" in path


def extract_shop_object_id(html: str, url: str) -> str | None:
    match = re.search(r'"objectId"\s*:\s*"(/site/[^"]+)"', html)
    if match:
        return match.group(1)
    parsed = urlparse(url)
    parts = [part for part in parsed.path.split("/") if part]
    if len(parts) >= 2 and parts[0] == "shop":
        domain = parts[1]
        encoded = base64.b64encode(domain.encode("utf-8")).decode("ascii")
        return f"/site/{encoded}"
    return None


def parse_yandex_shop_display_count(html: str) -> int | None:
    for pattern in (
        r'"ugcData"\s*:\s*\{"reviews"\s*:\s*\{"count"\s*:\s*(\d+)',
        r'"reviewsCount"\s*:\s*(\d+)',
        r'"totalCount"\s*:\s*(\d+)',
    ):
        match = re.search(pattern, html)
        if match:
            return int(match.group(1))
    return None


def parse_digest_view_reviews(payload: dict[str, Any]) -> list[Review]:
    views = (payload.get("view") or {}).get("views") or []
    reviews: list[Review] = []
    for item in views:
        if item.get("type") != "/ugc/review":
            continue
        author = str((item.get("author") or {}).get("name") or "").strip()
        content = str(item.get("text") or item.get("fullText") or "").strip()
        if not author or len(content) < 5:
            continue
        rating_obj = item.get("rating") or {}
        rating = normalize_stars(rating_obj.get("val") or rating_obj.get("ratingValue") or 5)
        created_at = None
        raw_time = item.get("time")
        if raw_time is not None:
            try:
                ts = int(raw_time) / 1000
                created_at = datetime.fromtimestamp(ts, tz=timezone.utc).strftime(
                    "%Y-%m-%dT%H:%M:%SZ"
                )
            except (TypeError, ValueError, OSError):
                created_at = None
        reviews.append(
            Review(
                author=author,
                content=content,
                rating=rating,
                source="yandex",
                created_at=created_at,
            )
        )
    return reviews


def fetch_yandex_shop_digest(url: str, html: str | None = None) -> tuple[list[Review], int | None, int | None]:
    """Яндекс Магазин: пагинация через /ugcpub/digest."""
    if html is None:
        html = fetch_yandex_page_html(url, page=1)
    object_id = extract_shop_object_id(html, url)
    if not object_id:
        return [], parse_yandex_shop_display_count(html), None

    display_count = parse_yandex_shop_display_count(html)
    session = requests.Session()
    session.headers.update(
        {
            **YANDEX_PAGE_HEADERS,
            "Accept": "application/json, text/plain, */*",
            "Referer": url,
        }
    )
    session.get(url, timeout=60)

    all_reviews: list[Review] = []
    offset = 0
    api_total: int | None = None
    page_num = 1
    while offset <= 500:
        params = {
            "objectId": object_id,
            "appId": "vertical-object",
            "otype": "Site",
            "offset": offset,
            "limit": YANDEX_SHOP_PAGE_LIMIT,
            "fixTokens": "true",
            "withNpsScore": "1",
            "ignore_filter_aspects_stats_by_tag": "1",
        }
        resp = session.get(YANDEX_SHOP_DIGEST_URL, params=params, timeout=60)
        resp.raise_for_status()
        data = resp.json()
        batch = parse_digest_view_reviews(data)
        pager = data.get("pager") or {}
        if api_total is None:
            api_total = pager.get("reviewCount") or pager.get("totalCount")
        if not batch:
            break
        before = len(all_reviews)
        all_reviews = dedupe_reviews(all_reviews + batch)
        added = len(all_reviews) - before
        total_label = api_total if api_total is not None else "?"
        print(
            f"  Digest {page_num}: +{added} (всего {len(all_reviews)}/{total_label})"
        )
        if added == 0:
            break
        if api_total is not None and len(all_reviews) >= api_total:
            break
        offset += len(batch)
        page_num += 1

    if display_count and api_total and display_count > api_total:
        print(
            f"  Яндекс Магазин: на странице {display_count}, "
            f"с текстом доступно {api_total}",
            file=sys.stderr,
        )
    return all_reviews, display_count, api_total


def normalize_yandex_reviews_url(url: str) -> str:
    normalized = url.rstrip("/")
    parsed = urlparse(normalized)
    host = (parsed.netloc or "").lower()
    path = parsed.path or ""
    # reviews.yandex.ru/shop/... уже ведёт на страницу с отзывами.
    if "reviews.yandex.ru" in host:
        return normalized
    # Для Яндекс Карт и прочих org-страниц добавляем /reviews/.
    if "/reviews" not in path:
        normalized = f"{normalized}/reviews/"
    return normalized


def yandex_url_with_page(url: str, page: int) -> str:
    if page <= 1:
        return url
    parsed = urlparse(url)
    query = parse_qs(parsed.query, keep_blank_values=True)
    query["page"] = [str(page)]
    return urlunparse(parsed._replace(query=urlencode(query, doseq=True)))


def parse_yandex_expected_count(html: str) -> int | None:
    match = re.search(r'itemProp="reviewCount"\s+content="(\d+)"', html)
    if match:
        return int(match.group(1))
    shop_count = parse_yandex_shop_display_count(html)
    if shop_count is not None:
        return shop_count
    return None


def dedupe_reviews(reviews: list[Review]) -> list[Review]:
    seen: set[tuple[str, str, str | None]] = set()
    unique: list[Review] = []
    for review in reviews:
        key = (review.author, review.content[:120], review.created_at)
        if key in seen:
            continue
        seen.add(key)
        unique.append(review)
    return unique


def fetch_yandex_page_html(url: str, page: int = 1) -> str:
    resp = requests.get(
        yandex_url_with_page(url, page),
        headers=YANDEX_PAGE_HEADERS,
        timeout=60,
    )
    resp.raise_for_status()
    return resp.text


def fetch_yandex_paginated(url: str) -> tuple[list[Review], int | None]:
    """Собирает отзывы со всех SSR-страниц (?page=2, ...)."""
    html = fetch_yandex_page_html(url, page=1)
    reviews = parse_yandex_html(html)
    expected = parse_yandex_expected_count(html)

    page = 2
    while expected and len(reviews) < expected and page <= YANDEX_MAX_PAGES:
        batch = parse_yandex_html(fetch_yandex_page_html(url, page=page))
        if not batch:
            break
        before = len(reviews)
        reviews = dedupe_reviews(reviews + batch)
        added = len(reviews) - before
        print(f"  Страница {page}: +{added} (всего {len(reviews)}/{expected})")
        if added == 0:
            break
        page += 1

    return reviews, expected


def fetch_yandex_playwright(
    url: str,
    target: int = 0,
    *,
    progress_callback: Callable[[str, float | None], None] | None = None,
) -> list[Review]:
    """Запасной вариант: headless-браузер со скроллом списка отзывов."""

    def _progress(message: str, fraction: float | None = None) -> None:
        if progress_callback:
            progress_callback(message, fraction)
        else:
            print(f"  {message}")

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print(
            "  Playwright не установлен. Для Яндекса: pip install playwright && playwright install chromium",
            file=sys.stderr,
        )
        return []

    scroll_target = target or 100
    _progress("Playwright: загрузка страницы…", 0.0)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(locale="ru-RU")
        page.set_extra_http_headers(
            {
                "Accept-Language": "ru-RU,ru;q=0.9",
                "User-Agent": (
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                    "AppleWebKit/537.36 (KHTML, like Gecko) "
                    "Chrome/120.0.0.0 Safari/537.36"
                ),
            }
        )
        page.goto(url, wait_until="domcontentloaded", timeout=90000)
        try:
            page.wait_for_selector('[class*="business-review-view"]', timeout=20000)
        except Exception:
            browser.close()
            return []

        scroll_selectors = (
            '[class*="scroll__container"]',
            '[class*="business-card-view__main"]',
            '[class*="sidebar-view"]',
        )
        prev_count = 0
        stable_rounds = 0
        for _ in range(40):
            count = page.locator('[class*="business-review-view"]').count()
            fraction = min(1.0, count / scroll_target) if scroll_target else None
            _progress(f"Playwright: {count} отзывов…", fraction)
            if count >= scroll_target:
                break
            if count == prev_count:
                stable_rounds += 1
                if stable_rounds >= 3:
                    break
            else:
                stable_rounds = 0
            prev_count = count

            scrolled = False
            for selector in scroll_selectors:
                container = page.locator(selector).first
                if container.count():
                    container.evaluate("el => el.scrollTop = el.scrollHeight")
                    scrolled = True
                    break
            if not scrolled:
                page.mouse.wheel(0, 2400)
            page.wait_for_timeout(800)

        reviews = parse_yandex_html(page.content())
        browser.close()

    _progress(f"Playwright: готово, {len(reviews)} отзывов", 1.0)
    return reviews


def fetch_yandex_reviews(
    cfg: Config,
    use_playwright: bool = True,
    *,
    progress_callback: Callable[[str, float | None], None] | None = None,
) -> list[Review]:
    if cfg.yandex_reviews_file:
        return load_yandex_from_file(Path(cfg.yandex_reviews_file))

    if not cfg.yandex_org_url:
        return []

    url = normalize_yandex_reviews_url(cfg.yandex_org_url)

    if is_yandex_shop_url(url):
        html = fetch_yandex_page_html(url, page=1)
        reviews, display_count, api_total = fetch_yandex_shop_digest(url, html=html)
        expected = api_total or display_count
        if not reviews:
            reviews = parse_yandex_html(html)
        if expected and len(reviews) < expected:
            print(
                f"  Digest собрал {len(reviews)} из {expected} доступных отзывов",
                file=sys.stderr,
            )
        if not reviews:
            print(
                "  Не удалось получить отзывы Яндекс Магазина.\n"
                "  Проверьте URL reviews.yandex.ru/shop/... или укажите yandex_reviews_file",
                file=sys.stderr,
            )
        return reviews

    reviews, expected = fetch_yandex_paginated(url)

    if expected and len(reviews) < expected:
        print(
            f"  SSR собрал {len(reviews)} из {expected} отзывов",
            file=sys.stderr,
        )

    need_playwright = use_playwright and (
        not reviews or (expected is not None and len(reviews) < expected)
    )
    if need_playwright:
        if not reviews:
            print("  SSR не дал отзывов — пробуем Playwright…")
        else:
            print("  SSR неполный — пробуем Playwright со скроллом…")
        playwright_reviews = fetch_yandex_playwright(
            url,
            target=expected or len(reviews) + 1,
            progress_callback=progress_callback,
        )
        if len(playwright_reviews) > len(reviews):
            reviews = playwright_reviews

    if not reviews:
        print(
            "  Не удалось получить отзывы Яндекса.\n"
            "  Варианты: pip install playwright && playwright install chromium\n"
            "  или укажите yandex_reviews_file в config.json",
            file=sys.stderr,
        )
    return reviews


def extract_yandex_review_photos(block: str) -> list[str]:
    photos = re.findall(
        r'class="business-review-media__item-img"[^>]*src="([^"]+)"',
        block,
    )
    seen: set[str] = set()
    unique: list[str] = []
    for url in photos:
        if url in seen:
            continue
        seen.add(url)
        unique.append(url)
    return unique


def yandex_photo_full(url: str) -> str:
    if re.search(r"/[A-Z]$", url):
        return re.sub(r"/[A-Z]$", "/orig", url)
    return url


def yandex_photo_preview(url: str) -> str:
    if re.search(r"/orig$", url):
        return re.sub(r"/orig$", "/L", url)
    if re.search(r"/[A-Z]$", url):
        return re.sub(r"/[A-Z]$", "/L", url)
    return url


def parse_yandex_json_ld_reviews(html: str) -> list[Review]:
    """Fallback: отзывы из JSON-LD (подходит для Яндекс Магазина)."""
    reviews: list[Review] = []
    scripts = re.findall(
        r'<script[^>]+type="application/ld\+json"[^>]*>(.*?)</script>',
        html,
        flags=re.S | re.I,
    )
    if not scripts:
        return reviews

    seen: set[tuple[str, str, str | None]] = set()
    for raw in scripts:
        try:
            payload = json.loads(raw.strip())
        except json.JSONDecodeError:
            continue
        candidates = payload if isinstance(payload, list) else [payload]
        for item in candidates:
            if not isinstance(item, dict):
                continue
            review_data = item.get("review")
            if isinstance(review_data, dict):
                review_data = [review_data]
            if not isinstance(review_data, list):
                continue
            for entry in review_data:
                if not isinstance(entry, dict):
                    continue
                author_data = entry.get("author")
                if isinstance(author_data, dict):
                    author = str(author_data.get("name") or "").strip()
                else:
                    author = str(author_data or "").strip()
                content = str(entry.get("reviewBody") or "").strip()
                if not author or len(content) < 5:
                    continue
                rating_data = entry.get("reviewRating") or {}
                rating_raw = (
                    rating_data.get("ratingValue")
                    if isinstance(rating_data, dict)
                    else rating_data
                )
                rating = normalize_stars(rating_raw)
                created_at = str(entry.get("datePublished") or "").strip() or None
                key = (author, content[:120], created_at)
                if key in seen:
                    continue
                seen.add(key)
                reviews.append(
                    Review(
                        author=author,
                        content=content,
                        rating=rating,
                        source="yandex",
                        created_at=created_at,
                    )
                )
    return reviews


def parse_yandex_html(html: str) -> list[Review]:
    """Извлекает отзывы из SSR-разметки Яндекс Карт/Магазина."""
    reviews: list[Review] = []
    blocks = re.split(r'<div class="business-review-view" itemProp="review"', html)
    if len(blocks) <= 1:
        return parse_yandex_json_ld_reviews(html)

    for block in blocks[1:]:
        author_match = re.search(r'itemProp="name"[^>]*>([^<]+)<', block)
        if not author_match:
            continue
        author = author_match.group(1).strip()

        body_match = re.search(
            r'spoiler-view__text-container[^>]*>(.*?)</span>',
            block,
            re.S,
        )
        if not body_match:
            body_match = re.search(
                r'itemProp="reviewBody"[^>]*>.*?>([^<]{10,})<',
                block,
                re.S,
            )
        if not body_match:
            continue
        content = re.sub(r"<[^>]+>", " ", body_match.group(1))
        content = re.sub(r"\s+", " ", content).strip()
        if len(content) < 5:
            continue

        rating = 5
        rating_match = re.search(
            r'itemProp="ratingValue"\s+content="([^"]+)"',
            block,
        )
        if rating_match:
            rating = normalize_stars(float(rating_match.group(1)))
        else:
            stars_match = re.search(r'aria-label="Оценка (\d)', block)
            if stars_match:
                rating = normalize_stars(int(stars_match.group(1)))

        avatar_url = None
        avatar_match = re.search(
            r'itemProp="image"\s+content="([^"]+)"',
            block,
        )
        if avatar_match:
            avatar_url = avatar_match.group(1)
        else:
            bg_match = re.search(r"background-image:url\(([^)]+)\)", block)
            if bg_match:
                avatar_url = bg_match.group(1)

        date_match = re.search(r'itemProp="datePublished"\s+content="([^"]+)"', block)
        created_at = date_match.group(1) if date_match else None
        photo_urls = extract_yandex_review_photos(block)

        reviews.append(
            Review(
                author=author,
                content=content,
                rating=rating,
                source="yandex",
                avatar_url=avatar_url,
                created_at=created_at,
                photo_urls=photo_urls,
            )
        )

    if not reviews:
        return parse_yandex_json_ld_reviews(html)
    return reviews


def filter_reviews_by_config(reviews: list[Review], cfg: Config) -> list[Review]:
    min_rating = max(1, min(5, cfg.min_rating))
    return [r for r in reviews if r.rating >= min_rating]


def effective_insales_ratio(cfg: Config) -> float:
    mode = (cfg.source_mode or "mix").lower()
    if mode == "insales":
        return 1.0
    if mode == "yandex":
        return 0.0
    return cfg.insales_ratio


def weighted_sample(pool: list[Review], count: int, prefer_avatar: bool) -> list[Review]:
    if count <= 0 or not pool:
        return []
    if not prefer_avatar or count >= len(pool):
        return random.sample(pool, min(count, len(pool)))

    with_avatar = [r for r in pool if r.avatar_url]
    without = [r for r in pool if not r.avatar_url]
    picked: list[Review] = []
    if with_avatar:
        n = min(count, len(with_avatar))
        picked.extend(random.sample(with_avatar, n))
    remaining = count - len(picked)
    if remaining > 0 and without:
        picked.extend(random.sample(without, min(remaining, len(without))))
    if len(picked) < count:
        rest = [r for r in pool if r not in picked]
        if rest:
            picked.extend(random.sample(rest, min(count - len(picked), len(rest))))
    return picked


def review_sort_ts(review: Review) -> int:
    if not review.created_at:
        return 0
    try:
        normalized = review.created_at.replace("Z", "+00:00")
        return int(datetime.fromisoformat(normalized).timestamp())
    except ValueError:
        return 0


def sample_yandex_reviews(yandex: list[Review], cfg: Config) -> list[Review]:
    """Выборка только Яндекс-отзывов, сортировка created_at DESC (без shuffle)."""
    filtered = filter_reviews_by_config(yandex, cfg)
    sorted_reviews = sorted(
        filtered,
        key=lambda r: r.created_at or "",
        reverse=True,
    )
    limit = cfg.yandex_limit
    if limit is None or limit <= 0:
        limit = cfg.sample_count
    if limit is None or limit <= 0:
        return sorted_reviews
    return sorted_reviews[: max(1, limit)]


def sample_reviews(
    insales: list[Review], yandex: list[Review], cfg: Config
) -> list[Review]:
    """Legacy mix API — deprecated; standard run uses sample_yandex_reviews."""
    mode = (cfg.source_mode or "yandex").lower()
    if mode == "yandex":
        return sample_yandex_reviews(yandex, cfg)
    insales = filter_reviews_by_config(insales, cfg)
    yandex = filter_reviews_by_config(yandex, cfg)
    if mode == "insales":
        yandex = []
    count = cfg.sample_count
    ratio = effective_insales_ratio(cfg)
    insales_n = min(len(insales), round(count * ratio))
    yandex_n = min(len(yandex), count - insales_n)
    if insales_n + yandex_n < count:
        insales_n = min(len(insales), count - yandex_n)
        yandex_n = min(len(yandex), count - insales_n)
    picked = weighted_sample(insales, insales_n, cfg.prefer_with_avatar)
    picked += weighted_sample(yandex, yandex_n, cfg.prefer_with_avatar)
    remaining = count - len(picked)
    pool = [r for r in insales + yandex if r not in picked]
    if remaining > 0 and pool:
        picked += weighted_sample(pool, min(remaining, len(pool)), cfg.prefer_with_avatar)
    picked.sort(key=lambda r: r.created_at or "", reverse=True)
    return picked


def format_review_date(raw: str | None) -> str | None:
    if not raw:
        return None
    try:
        normalized = raw.replace("Z", "+00:00")
        dt = datetime.fromisoformat(normalized)
        months = (
            "января",
            "февраля",
            "марта",
            "апреля",
            "мая",
            "июня",
            "июля",
            "августа",
            "сентября",
            "октября",
            "ноября",
            "декабря",
        )
        return f"{dt.day} {months[dt.month - 1]} {dt.year}"
    except ValueError:
        return raw[:10] if len(raw) >= 10 else raw


def render_photos_html(photo_urls: list[str]) -> str:
    """Фото только в попапе — в карточке не выводим."""
    return ""


def render_photo_urls_attr(photo_urls: list[str]) -> str:
    if not photo_urls:
        return ""
    previews = [yandex_photo_preview(url) for url in photo_urls]
    full_urls = [yandex_photo_full(url) for url in photo_urls]
    payload = json.dumps(full_urls, ensure_ascii=False)
    preview_payload = json.dumps(previews, ensure_ascii=False)
    return (
        f'data-photo-urls="{liquid_escape(payload)}" '
        f'data-photo-previews="{liquid_escape(preview_payload)}"'
    )


def render_slide(review: Review) -> str:
    author = liquid_escape(review.author)
    content = liquid_escape(review.content)
    stars = stars_html(review.rating)
    source_label = "InSales" if review.source == "insales" else "Яндекс"
    date_label = format_review_date(review.created_at)
    date_html = (
        f'<time class="df-reviews__date" datetime="{liquid_escape(review.created_at or "")}">'
        f"{liquid_escape(date_label)}</time>"
        if date_label
        else ""
    )

    avatar_html = ""
    if review.avatar_url:
        avatar_html = (
            f'<div class="df-reviews__avatar" itemprop="image" itemscope '
            f'itemtype="http://schema.org/ImageObject">'
            f'<img src="{liquid_escape(review.avatar_url)}" alt="" loading="lazy" '
            f'width="72" height="72" itemprop="contentUrl">'
            f"</div>"
        )
    else:
        initial = author[:1] if author else "?"
        avatar_html = f'<div class="df-reviews__avatar df-reviews__avatar--placeholder">{initial}</div>'

    photos_attr = render_photo_urls_attr(review.photo_urls)
    sort_ts = review_sort_ts(review)

    return textwrap.dedent(
        f"""
        <div class="swiper-slide df-reviews__slide" {photos_attr} data-rating="{review.rating}" data-source="{review.source}" data-sort-ts="{sort_ts}" itemprop="review" itemscope itemtype="http://schema.org/Review">
          {avatar_html}
          <div class="df-reviews__author" itemprop="author" itemscope itemtype="http://schema.org/Person"><span itemprop="name">{author}</span></div>
          {date_html}
          <div class="df-reviews__stars" aria-label="{review.rating} из 5" itemprop="reviewRating" itemscope itemtype="http://schema.org/Rating"><meta itemprop="ratingValue" content="{review.rating}"><meta itemprop="bestRating" content="5">{stars}</div>
          <p class="df-reviews__text" itemprop="reviewBody">{content}</p>
          <span class="df-reviews__source">{source_label}</span>
        </div>
        """
    ).strip()


def generate_liquid(reviews: list[Review]) -> str:
    header = textwrap.dedent(
        f"""
        {{% comment %}}
          DanForge — сгенерировано get_reviews.py v{PARSER_VERSION}
          Только отзывы Яндекс. InSales — через Liquid prefetch виджета.
          Не редактировать вручную. Перегенерируйте утилитой.
          https://danforge.ru
        {{% endcomment %}}
        """
    ).strip()

    slides = "\n".join(render_slide(r) for r in reviews)
    return f"{header}\n{slides}\n"


def config_to_dict(cfg: Config) -> dict:
    return {
        "client_name": cfg.client_name,
        "shop": cfg.shop,
        "api_key": cfg.api_key,
        "password": cfg.password,
        "theme_id": cfg.theme_id,
        "yandex_org_url": cfg.yandex_org_url,
        "yandex_reviews_file": cfg.yandex_reviews_file,
        "sample_count": cfg.sample_count,
        "yandex_limit": cfg.yandex_limit,
        "insales_ratio": cfg.insales_ratio,
        "min_text_length": cfg.min_text_length,
        "min_rating": cfg.min_rating,
        "source_mode": cfg.source_mode,
        "prefer_with_avatar": cfg.prefer_with_avatar,
        "output_dir": "output",
        "upload_avatars": cfg.upload_avatars,
        "client_mode": cfg.client_mode,
        "upload_to_theme": cfg.upload_to_theme,
        "dry_run": cfg.dry_run,
        "use_playwright": cfg.use_playwright,
    }


def save_config(cfg: Config, path: Path) -> None:
    path.write_text(
        json.dumps(config_to_dict(cfg), ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def api_headers(content_type: str = "application/json") -> dict[str, str]:
    return {"User-Agent": USER_AGENT, "Content-Type": content_type}


def parse_assets_response(data: Any) -> list[dict]:
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ("assets", "theme_assets"):
            if isinstance(data.get(key), list):
                return data[key]
    return []


def ensure_theme_id(cfg: Config) -> None:
    cfg.theme_id = normalize_theme_id(cfg.theme_id)
    if cfg.theme_id:
        theme = fetch_theme_by_id(cfg, cfg.theme_id)
        if not theme:
            raise RuntimeError(
                f"theme_id={cfg.theme_id} не найден в магазине {cfg.shop}.\n"
                "Укажите корректный ID темы в config или оставьте поле пустым "
                "для автоматического выбора опубликованной темы."
            )
        return
    themes = fetch_themes(cfg)
    if not themes:
        raise RuntimeError("theme_id не указан и темы не найдены")
    cfg.theme_id = int(themes[0]["id"])
    title = themes[0].get("title", "")
    print(f"Используется theme_id={cfg.theme_id} ({title})")


def list_theme_assets(cfg: Config) -> list[dict]:
    base, auth = insales_session(cfg)
    ensure_theme_id(cfg)
    resp = requests.get(
        f"{base}/admin/themes/{cfg.theme_id}/assets.json",
        auth=auth,
        headers=api_headers(),
        timeout=60,
    )
    resp.raise_for_status()
    return parse_assets_response(resp.json())


def find_theme_asset(cfg: Config, inner_name: str = SNIPPET_INNER_NAME) -> dict | None:
    matches: list[dict] = []
    for asset in list_theme_assets(cfg):
        if asset.get("inner_file_name") == inner_name or asset.get("name") == inner_name:
            matches.append(asset)
    if not matches:
        return None
    for asset in matches:
        if asset.get("type") == "Asset::Snippet":
            return asset
    return matches[0]


def _try_asset_request(
    method: str,
    url: str,
    auth: tuple[str, str],
    *,
    json_payload: dict | None = None,
    xml_payload: bytes | None = None,
) -> tuple[bool, str]:
    if json_payload is not None:
        resp = requests.request(
            method,
            url,
            auth=auth,
            json=json_payload,
            headers=api_headers("application/json"),
            timeout=60,
        )
    else:
        resp = requests.request(
            method,
            url,
            auth=auth,
            data=xml_payload,
            headers=api_headers("application/xml"),
            timeout=60,
        )
    if resp.status_code in (200, 201):
        return True, ""
    return False, f"{method} {resp.status_code}: {resp.text[:400]}"


def upload_snippet(cfg: Config, content: str) -> None:
    ensure_theme_id(cfg)
    base, auth = insales_session(cfg)
    existing = find_theme_asset(cfg)
    errors: list[str] = []

    if existing:
        asset_id = existing["id"]
        name = existing.get("inner_file_name", SNIPPET_INNER_NAME)
        url_json = f"{base}/admin/themes/{cfg.theme_id}/assets/{asset_id}.json"
        url_xml = f"{base}/admin/themes/{cfg.theme_id}/assets/{asset_id}.xml"
        update_payloads = [
            {"asset": {"content": content}},
            {"content": content},
            {"asset": {"source": content}},
            {"asset": {"value": content}},
        ]
        for payload in update_payloads:
            ok, err = _try_asset_request("PUT", url_json, auth, json_payload=payload)
            if ok:
                print(f"Сниппет обновлён: {name} (id={asset_id})")
                return
            errors.append(err)

        xml_body = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            f"<asset><content><![CDATA[{content}]]></content></asset>"
        ).encode("utf-8")
        ok, err = _try_asset_request("PUT", url_xml, auth, xml_payload=xml_body)
        if ok:
            print(f"Сниппет обновлён (XML): {name}")
            return
        errors.append(err)
    else:
        url_json = f"{base}/admin/themes/{cfg.theme_id}/assets.json"
        create_payloads = [
            {
                "asset": {
                    "name": SNIPPET_INNER_NAME,
                    "content": content,
                    "type": "Asset::Snippet",
                }
            },
        ]
        for payload in create_payloads:
            ok, err = _try_asset_request("POST", url_json, auth, json_payload=payload)
            if ok:
                print(f"Сниппет создан: {SNIPPET_INNER_NAME}")
                return
            errors.append(err)

        xml_body = (
            '<?xml version="1.0" encoding="UTF-8"?>'
            f"<asset><name>{SNIPPET_INNER_NAME}</name>"
            f"<type>Asset::Snippet</type>"
            f"<content><![CDATA[{content}]]></content></asset>"
        ).encode("utf-8")
        url_xml = f"{base}/admin/themes/{cfg.theme_id}/assets.xml"
        ok, err = _try_asset_request("POST", url_xml, auth, xml_payload=xml_body)
        if ok:
            print(f"Сниппет создан (XML): {SNIPPET_INNER_NAME}")
            return
        errors.append(err)

    raise RuntimeError(
        "Не удалось загрузить сниппет в тему.\n"
        + "\n".join(f"  • {e}" for e in errors[-5:])
        + "\n\nПроверьте: API-ключ должен иметь доступ к редактированию темы."
    )


def fetch_all_themes(cfg: Config) -> list[dict]:
    """Все темы магазина (опубликованные и черновики)."""
    base, auth = insales_session(cfg)
    resp = requests.get(
        f"{base}/admin/themes.json",
        auth=auth,
        headers=api_headers(),
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        theme = data.get("theme")
        if isinstance(theme, dict):
            return [theme]
        themes = data.get("themes")
        if isinstance(themes, list):
            return themes
    return []


def fetch_themes(cfg: Config) -> list[dict]:
    """Опубликованные темы; если их нет — все темы (для автовыбора)."""
    themes = fetch_all_themes(cfg)
    published = [t for t in themes if theme_is_published(t)]
    return published or themes


def fetch_theme_by_id(cfg: Config, theme_id: int) -> dict | None:
    """Возвращает тему по ID или None."""
    theme_id = int(theme_id)
    base, auth = insales_session(cfg)
    resp = requests.get(
        f"{base}/admin/themes/{theme_id}.json",
        auth=auth,
        headers=api_headers(),
        timeout=60,
    )
    if resp.status_code == 200:
        data = resp.json()
        if isinstance(data, dict):
            theme = data.get("theme", data)
            if isinstance(theme, dict) and theme.get("id") is not None:
                return theme
    for theme in fetch_all_themes(cfg):
        if int(theme.get("id", 0)) == theme_id:
            return theme
    return None


def write_outputs(cfg: Config, liquid: str, all_reviews: list[Review]) -> Path:
    out = Path(cfg.output_dir)
    out.mkdir(parents=True, exist_ok=True)

    liquid_path = out / SNIPPET_INNER_NAME
    liquid_path.write_text(liquid, encoding="utf-8")

    cache_path = out / "reviews_cache.json"
    cache_path.write_text(
        json.dumps(
            [
                {
                    "author": r.author,
                    "content": r.content,
                    "rating": r.rating,
                    "source": r.source,
                    "avatar_url": r.avatar_url,
                    "created_at": r.created_at,
                    "photo_urls": r.photo_urls,
                }
                for r in all_reviews
            ],
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"Файл: {liquid_path}")
    print(f"Кэш: {cache_path}")
    return liquid_path


def run(
    cfg: Config,
    upload: bool,
    use_playwright: bool = True,
    dry_run: bool = False,
    log_slug: str | None = None,
    fetch_insales: bool = False,
    progress_callback: Callable[[str, float | None], None] | None = None,
) -> Path | None:
    print(f"DanForge get-reviews v{PARSER_VERSION}")
    insales: list[Review] = []
    if fetch_insales:
        print("Загрузка отзывов inSales (backup)…")
        insales = fetch_insales_reviews(cfg)
        print(f"  inSales: {len(insales)} опубликованных")

    print("Загрузка отзывов Яндекс…")
    yandex = fetch_yandex_reviews(
        cfg,
        use_playwright=use_playwright,
        progress_callback=progress_callback,
    )
    print(f"  Яндекс: {len(yandex)}")

    if not yandex and not insales:
        if log_slug:
            write_run_log(log_slug, status="error", message="Нет отзывов", dry_run=dry_run)
        raise SystemExit(
            "Нет отзывов Яндекс для генерации.\n"
            "Яндекс: установите Playwright или yandex_reviews_file в config.\n"
            "InSales загружаются виджетом через Liquid prefetch."
        )

    mode = (cfg.source_mode or "yandex").lower()
    if mode == "yandex" or not fetch_insales:
        picked = sample_yandex_reviews(yandex, cfg)
    else:
        picked = sample_reviews(insales, yandex, cfg)
    print(f"В сниппет: {len(picked)} отзывов Яндекс (мин. рейтинг: {cfg.min_rating})")

    if dry_run:
        print("Dry-run: файлы не записаны, upload пропущен.")
        if log_slug:
            write_run_log(
                log_slug,
                status="dry-run",
                insales=len(insales),
                yandex=len(yandex),
                picked=len(picked),
                dry_run=True,
            )
        return None

    liquid = generate_liquid(picked)
    liquid_path = write_outputs(cfg, liquid, picked)

    if upload and is_manual_client(cfg):
        print(
            "Ручной режим (без API): загрузка в тему пропущена. "
            "Файл в output/ — «Копировать сниппет» или вставьте в тему вручную."
        )
        upload = False

    if upload:
        upload_snippet(cfg, liquid)
        if log_slug:
            write_run_log(
                log_slug,
                status="ok",
                insales=len(insales),
                yandex=len(yandex),
                picked=len(picked),
                uploaded=True,
            )
    elif log_slug:
        write_run_log(
            log_slug,
            status="ok",
            insales=len(insales),
            yandex=len(yandex),
            picked=len(picked),
            uploaded=False,
        )

    return liquid_path


def test_yandex_fetch(
    cfg: Config,
    use_playwright: bool = False,
    *,
    progress_callback: Callable[[str, float | None], None] | None = None,
) -> int:
    print(f"Тест Яндекс-парсера v{PARSER_VERSION}")
    if not cfg.yandex_org_url:
        print("URL Яндекса не задан в config.json")
        return 0

    url = normalize_yandex_reviews_url(cfg.yandex_org_url)
    html = fetch_yandex_page_html(url, page=1)
    expected = parse_yandex_expected_count(html)
    shop_url = is_yandex_shop_url(url)
    if expected is not None:
        label = "Яндекс Магазин" if shop_url else "Яндекс"
        print(f"На странице указано отзывов: {expected} ({label})")

    reviews = fetch_yandex_reviews(
        cfg,
        use_playwright=use_playwright and not shop_url,
        progress_callback=progress_callback,
    )
    print(f"Найдено отзывов: {len(reviews)}")
    if shop_url and expected is not None and len(reviews) < expected:
        print(
            f"  Примечание: на витрине {expected}, но API Магазина отдаёт только "
            f"отзывы с текстом ({len(reviews)}). Это ограничение источника.",
            file=sys.stderr,
        )
    elif expected is not None and len(reviews) < expected:
        print(
            f"  Внимание: собрано меньше, чем указано на странице ({len(reviews)}/{expected})",
            file=sys.stderr,
        )
    for review in reviews[:3]:
        print(f"  • {review.author} ({review.rating}*): {review.content[:80]}…")
    return len(reviews)


def run_batch(
    use_playwright: bool = False,
    dry_run: bool = False,
) -> None:
    """Пакетный запуск: upload берётся из config.json каждого клиента (upload_to_theme)."""
    from clients_manager import list_clients

    clients = list_clients()
    if not clients:
        raise SystemExit("Нет клиентов в папке clients/. Добавьте через GUI.")

    print(f"Пакетный запуск: {len(clients)} клиент(ов)")
    for meta in clients:
        slug = meta["slug"]
        path = Path(meta["config_path"])
        print(f"\n=== {meta['name']} ({slug}) ===")
        try:
            cfg = load_config(path)
            validate_client_config(cfg, path)
            manual = is_manual_client(cfg)
            effective_upload = bool(cfg.upload_to_theme) and not manual and not dry_run
            if manual:
                print("  Ручной режим: только файл (upload пропущен)")
            elif cfg.upload_to_theme and not dry_run:
                print("  Upload в тему: да (из настроек клиента)")
            else:
                print("  Upload в тему: нет (настройка клиента или dry-run)")
            run(
                cfg,
                upload=effective_upload,
                use_playwright=use_playwright or cfg.use_playwright,
                dry_run=dry_run,
                log_slug=slug,
            )
        except Exception as exc:
            print(f"Ошибка: {exc}")
            write_run_log(slug, status="error", message=str(exc), dry_run=dry_run)


def build_demo_output(cfg: Config) -> None:
    demo = [
        Review(
            "Михаил",
            "Отличный сервис и консультация перед покупкой.",
            5,
            "yandex",
            created_at="2025-06-01T12:00:00Z",
        ),
        Review(
            "Елена",
            "Качество на высоте, упаковка аккуратная.",
            4,
            "yandex",
            created_at="2025-05-15T10:00:00Z",
        ),
        Review(
            "Анна",
            "Быстрая доставка, всё понравилось.",
            5,
            "yandex",
            created_at="2025-04-01T08:00:00Z",
        ),
    ]
    demo.sort(key=lambda r: r.created_at or "", reverse=True)
    liquid = generate_liquid(demo)
    write_outputs(cfg, liquid, demo)
    print("Демо-файлы созданы (без API).")


def main() -> None:
    parser = argparse.ArgumentParser(description="DanForge get-reviews")
    parser.add_argument(
        "-c",
        "--config",
        type=Path,
        default=Path(__file__).parent / "config.json",
        help="Путь к config.json",
    )
    parser.add_argument(
        "-u",
        "--upload",
        action="store_true",
        help="Загрузить сниппет в тему inSales",
    )
    parser.add_argument(
        "--check",
        action="store_true",
        help="Проверить config.json и подключение к API",
    )
    parser.add_argument(
        "--no-playwright",
        action="store_true",
        help="Не использовать Playwright для Яндекса (только HTML/JSON)",
    )
    parser.add_argument(
        "--demo",
        action="store_true",
        help="Сгенерировать демо-слайды без API",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Только статистика, без записи файлов и upload",
    )
    parser.add_argument(
        "--batch-all",
        action="store_true",
        help="Обработать всех клиентов из cli/clients/",
    )
    parser.add_argument(
        "--test-yandex",
        action="store_true",
        help="Проверить только парсер Яндекса",
    )
    parser.add_argument(
        "--gui",
        action="store_true",
        help="Запустить графический интерфейс",
    )
    parser.add_argument(
        "--insales-backup",
        action="store_true",
        help="Дополнительно загрузить inSales через API (диагностика, не для upload)",
    )
    args = parser.parse_args()

    if args.gui:
        try:
            from gui_ctk import run_gui
        except ImportError:
            from gui import run_gui

        run_gui()
        return

    if args.batch_all:
        run_batch(
            use_playwright=not args.no_playwright,
            dry_run=args.dry_run,
        )
        return

    if args.demo:
        cfg = Config(
            shop="demo.myinsales.ru",
            api_key="",
            password="",
            output_dir=str(Path(__file__).parent.parent / "output"),
        )
        build_demo_output(cfg)
        return

    if not args.config.exists():
        example = Path(__file__).parent / "config.example.json"
        raise SystemExit(
            f"Создайте {args.config} на основе {example.name}\n"
            "Или запустите: python get_reviews.py --demo"
        )

    cfg = load_config(args.config)
    validate_config(cfg, args.config)

    from clients_manager import config_slug

    slug = config_slug(args.config)

    if args.check:
        check_api_connection(cfg)
        if not is_manual_client(cfg):
            report_themes_for_check(cfg)
        return

    if args.test_yandex:
        test_yandex_fetch(cfg, use_playwright=not args.no_playwright)
        return

    run(
        cfg,
        upload=args.upload,
        use_playwright=not args.no_playwright,
        dry_run=args.dry_run,
        log_slug=slug,
        fetch_insales=args.insales_backup,
    )


if __name__ == "__main__":
    main()
