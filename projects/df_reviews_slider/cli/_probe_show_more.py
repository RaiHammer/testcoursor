"""Probe Yandex Shop 'Show more' button behavior."""
import json
import re
import requests

URL = "https://reviews.yandex.ru/shop/armedf.ru"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "ru-RU,ru;q=0.9",
}

# 1) Try digest with higher limits / offsets
session = requests.Session()
session.get(URL, headers=headers, timeout=60)
base = "https://reviews.yandex.ru/ugcpub/digest"
for offset, limit in [(0, 100), (0, 87), (31, 100), (50, 50)]:
    params = {
        "objectId": "/site/YXJtZWRmLnJ1",
        "appId": "vertical-object",
        "otype": "Site",
        "offset": offset,
        "limit": limit,
        "fixTokens": "true",
        "withNpsScore": "1",
        "ignore_filter_aspects_stats_by_tag": "1",
    }
    r = session.get(base, params=params, headers=headers, timeout=60)
    data = r.json()
    views = [v for v in data.get("view", {}).get("views", []) if v.get("type") == "/ugc/review"]
    pager = data.get("pager", {})
    print(f"digest offset={offset} limit={limit} -> {len(views)} reviews, pager={pager}")

# 2) Playwright click "Показать ещё"
try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print("playwright not installed")
    raise SystemExit(0)

api_calls = []

with sync_playwright() as p:
    try:
        browser = p.chromium.launch(headless=True)
    except Exception as exc:
        print("browser launch failed:", exc)
        raise SystemExit(0)
    page = browser.new_page(locale="ru-RU")

    def on_response(resp):
        if "ugcpub" in resp.url and resp.status == 200:
            try:
                body = resp.json()
            except Exception:
                return
            if isinstance(body, dict) and ("view" in body or "reviews" in body):
                api_calls.append((resp.url, len(body.get("view", {}).get("views", []))))

    page.on("response", on_response)
    page.goto(URL, wait_until="networkidle", timeout=120000)

    def count_dom():
        return page.locator(".Review-Text, [class*='Review-Text']").count()

    print("initial dom", count_dom())
    for i in range(15):
        btn = page.locator(
            "button:has-text('Показать ещё'), button:has-text('Показать еще'), .ReviewMoreButton-Button"
        )
        if btn.count() == 0:
            print("no button at iter", i)
            break
        try:
            btn.first.click(timeout=5000)
            page.wait_for_timeout(2500)
            print(f"click {i+1} dom={count_dom()}")
        except Exception as exc:
            print("click failed", i, exc)
            break

    print("final dom", count_dom())
    print("api calls during clicks:", len(api_calls))
    for url, n in api_calls[:10]:
        print(" ", url[:100], n)

    # parse all review texts from DOM
    texts = page.locator(".Review-Text .TextCut, .Review-Text").all_text_contents()
    print("unique text blocks", len(texts))

    browser.close()
