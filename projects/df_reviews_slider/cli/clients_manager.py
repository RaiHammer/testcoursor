"""Управление профилями клиентов DanForge get-reviews."""
from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

CLI_DIR = Path(__file__).parent
CLIENTS_DIR = CLI_DIR / "clients"
LEGACY_CONFIG = CLI_DIR / "config.json"
PARSER_VERSION = "1.4.0"


def slugify(name: str) -> str:
    s = name.lower().strip()
    s = re.sub(r"https?://", "", s)
    s = re.sub(r"[^a-z0-9а-яё_-]+", "-", s, flags=re.I)
    s = re.sub(r"-+", "-", s).strip("-")
    return s[:48] or "client"


def ensure_clients_dir() -> Path:
    CLIENTS_DIR.mkdir(parents=True, exist_ok=True)
    return CLIENTS_DIR


def client_dir(slug: str) -> Path:
    return ensure_clients_dir() / slug


def client_config_path(slug: str) -> Path:
    return client_dir(slug) / "config.json"


def client_output_dir(slug: str) -> Path:
    return client_dir(slug) / "output"


def client_log_path(slug: str) -> Path:
    return client_dir(slug) / "last_run.json"


def list_clients() -> list[dict[str, Any]]:
    ensure_clients_dir()
    items: list[dict[str, Any]] = []
    for path in sorted(CLIENTS_DIR.iterdir()):
        if not path.is_dir():
            continue
        cfg_path = path / "config.json"
        if not cfg_path.exists():
            continue
        meta = read_client_meta(path.name)
        items.append(meta)
    return items


def client_mode_from_config(data: dict[str, Any]) -> str:
    if str(data.get("client_mode", "")).lower() == "manual":
        return "manual"
    if str(data.get("api_key", "")).strip() == "manual-no-api":
        return "manual"
    shop = str(data.get("shop", "")).strip().lower()
    if shop.endswith(".manual.local"):
        return "manual"
    return "api"


def delivery_status_from_log(run: dict[str, Any] | None) -> str:
    """Человекочитаемый статус доставки для списка клиентов."""
    if not run:
        return "не обработан"
    if run.get("snippet_copied_at"):
        return "скопирован"
    status = str(run.get("status", ""))
    if status == "error":
        return "ошибка"
    if status == "dry-run":
        return "dry-run"
    if status == "ok":
        if run.get("uploaded"):
            return "загружен"
        return "файл готов"
    return status or "—"


def read_client_meta(slug: str) -> dict[str, Any]:
    cfg_path = client_config_path(slug)
    shop = slug
    name = slug
    client_mode = "api"
    upload_to_theme = True
    if cfg_path.exists():
        data = json.loads(cfg_path.read_text(encoding="utf-8"))
        shop = data.get("shop", slug)
        name = data.get("client_name") or shop
        client_mode = client_mode_from_config(data)
        upload_to_theme = bool(data.get("upload_to_theme", client_mode != "manual"))

    log = client_log_path(slug)
    last_run = None
    status = "—"
    delivery = "не обработан"
    run_data: dict[str, Any] | None = None
    if log.exists():
        try:
            run_data = json.loads(log.read_text(encoding="utf-8"))
            last_run = run_data.get("finished_at")
            status = run_data.get("status", "—")
            delivery = delivery_status_from_log(run_data)
        except json.JSONDecodeError:
            status = "?"
            delivery = "?"

    mode_label = "РУЧ" if client_mode == "manual" else "API"

    return {
        "slug": slug,
        "name": name,
        "shop": shop,
        "status": status,
        "last_run": last_run,
        "config_path": str(cfg_path),
        "client_mode": client_mode,
        "mode_label": mode_label,
        "delivery": delivery,
        "upload_to_theme": upload_to_theme,
    }


def create_client(slug: str, config_data: dict[str, Any]) -> Path:
    slug = slugify(slug)
    d = client_dir(slug)
    d.mkdir(parents=True, exist_ok=True)
    (d / "output").mkdir(exist_ok=True)
    config_data = dict(config_data)
    config_data["output_dir"] = "output"
    config_data.setdefault("client_name", slug)
    path = client_config_path(slug)
    path.write_text(json.dumps(config_data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return path


def migrate_legacy_config() -> str | None:
    """Переносит cli/config.json в clients/<shop>/ если есть."""
    if not LEGACY_CONFIG.exists():
        return None
    data = json.loads(LEGACY_CONFIG.read_text(encoding="utf-8"))
    shop = data.get("shop", "client")
    slug = slugify(shop.replace(".myinsales.ru", ""))
    if client_config_path(slug).exists():
        return slug
    data["client_name"] = data.get("client_name") or shop
    data["output_dir"] = "output"
    create_client(slug, data)
    return slug


def write_run_log(
    slug: str,
    *,
    status: str,
    message: str = "",
    insales: int = 0,
    yandex: int = 0,
    picked: int = 0,
    uploaded: bool = False,
    dry_run: bool = False,
) -> None:
    d = client_dir(slug)
    d.mkdir(parents=True, exist_ok=True)
    payload = {
        "parser_version": PARSER_VERSION,
        "status": status,
        "message": message,
        "insales": insales,
        "yandex": yandex,
        "picked": picked,
        "uploaded": uploaded,
        "dry_run": dry_run,
        "finished_at": datetime.now(timezone.utc).astimezone().isoformat(timespec="seconds"),
    }
    client_log_path(slug).write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def mark_snippet_copied(slug: str) -> None:
    """Фиксирует, что сниппет скопирован вручную (для статуса в списке клиентов)."""
    log_path = client_log_path(slug)
    payload: dict[str, Any] = {}
    if log_path.exists():
        try:
            payload = json.loads(log_path.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            payload = {}
    if payload.get("status") not in ("ok", "dry-run"):
        payload.setdefault("status", "ok")
        payload.setdefault("uploaded", False)
    payload["snippet_copied_at"] = datetime.now(timezone.utc).astimezone().isoformat(
        timespec="seconds"
    )
    log_path.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def discover_config_paths() -> list[Path]:
    paths = [client_config_path(c["slug"]) for c in list_clients()]
    if LEGACY_CONFIG.exists():
        paths.insert(0, LEGACY_CONFIG)
    return paths


def config_slug(path: Path) -> str:
    if path.parent.parent == CLIENTS_DIR:
        return path.parent.name
    if path == LEGACY_CONFIG:
        data = json.loads(path.read_text(encoding="utf-8"))
        return slugify(data.get("shop", "legacy"))
    return slugify(path.stem)
