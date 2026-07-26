# -*- coding: utf-8 -*-
"""Probe bimbobooks.ru locale + search/product APIs."""
from __future__ import print_function

import json
import re
import sys
import urllib.parse
import urllib.request

BASE = "https://bimbobooks.ru"
UA = {"User-Agent": "DanForge-QS-i18n-probe/1.0", "Accept": "text/html,application/json"}


def fetch(url, headers=None):
    req = urllib.request.Request(url, headers=headers or UA)
    with urllib.request.urlopen(req, timeout=30) as resp:
        raw = resp.read()
        ctype = resp.headers.get("Content-Type", "")
        return resp.status, ctype, raw


def parse_html(html):
    out = {}
    m = re.search(r"<html([^>]*)>", html, re.I)
    out["html_attrs"] = m.group(1)[:200] if m else None
    m = re.search(r'lang=["\']([^"\']+)["\']', out["html_attrs"] or "", re.I)
    out["html_lang"] = m.group(1) if m else None

    for name in ("shop-config", "default-locale"):
        m = re.search(
            r'<meta[^>]*name=["\']%s["\'][^>]*>' % re.escape(name), html, re.I
        )
        if not m:
            out[name] = None
            continue
        tag = m.group(0)
        cm = re.search(r'(?:content|data-config)=["\'](.*?)["\']', tag, re.I | re.S)
        out[name + "_tag"] = tag[:400]
        out[name] = cm.group(1) if cm else None

    m = re.search(r"AjaxSearch\s*=\s*(\{.*?\})\s*;", html, re.S)
    out["ajax_search_raw"] = m.group(1)[:1200] if m else None

    out["account_ids"] = list(
        dict.fromkeys(re.findall(r'["\']?account_id["\']?\s*[:=]\s*["\']?(\d+)', html))
    )
    out["locales"] = list(
        dict.fromkeys(re.findall(r'"locale"\s*:\s*"([^"]+)"', html))
    )[:20]
    out["product_ids"] = list(
        dict.fromkeys(
            re.findall(r'["\']product_id["\']\s*[:=]\s*["\']?(\d+)', html, re.I)
            + re.findall(r"/product/(\d+)", html)
            + re.findall(r"product-id-(\d+)", html)
            + re.findall(r'data-product-id=["\'](\d+)["\']', html)
        )
    )[:15]
    return out


def try_json(url):
    try:
        status, ctype, raw = fetch(
            url,
            {
                "User-Agent": UA["User-Agent"],
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            },
        )
        text = raw.decode("utf-8", "replace")
        try:
            data = json.loads(text)
        except Exception:
            data = {"_raw": text[:500]}
        return status, data
    except Exception as e:
        return None, {"_error": str(e)}


def titles_from_suggestions(payload):
    items = []
    if isinstance(payload, list):
        items = payload
    elif isinstance(payload, dict):
        for key in ("suggestions", "products", "items", "results"):
            if isinstance(payload.get(key), list):
                items = payload[key]
                break
        if not items and isinstance(payload.get("data"), dict):
            items = payload["data"].get("products") or []
    out = []
    for it in items[:8]:
        if not isinstance(it, dict):
            continue
        out.append(
            {
                "id": it.get("id"),
                "title": it.get("title") or it.get("value") or it.get("label"),
                "fields_title": (it.get("fields") or {}).get("title")
                if isinstance(it.get("fields"), dict)
                else None,
            }
        )
    return out


def titles_from_products(payload):
    products = []
    if isinstance(payload, dict) and isinstance(payload.get("products"), list):
        products = payload["products"]
    elif isinstance(payload, list):
        products = payload
    out = []
    for p in products[:8]:
        if isinstance(p, dict):
            out.append({"id": p.get("id"), "title": p.get("title")})
    return out


def main():
    print("=== FETCH /?lang=en ===")
    status, ctype, raw = fetch(BASE + "/?lang=en")
    html = raw.decode("utf-8", "replace")
    print("status", status, "ctype", ctype, "len", len(html))
    info = parse_html(html)
    print("html_lang", info["html_lang"])
    print("locales", info["locales"])
    print("default-locale", info.get("default-locale"))
    print("account_ids", info["account_ids"])
    print("product_ids", info["product_ids"])
    if info.get("shop-config"):
        sc = info["shop-config"]
        # may be HTML-escaped JSON
        sc_unescaped = (
            sc.replace("&quot;", '"')
            .replace("&#39;", "'")
            .replace("&amp;", "&")
        )
        print("shop-config head", sc_unescaped[:500])
        try:
            cfg = json.loads(sc_unescaped)
            print(
                "shop-config locale/account",
                cfg.get("locale"),
                cfg.get("account_id"),
                cfg.get("currency"),
            )
            if not info["account_ids"] and cfg.get("account_id"):
                info["account_ids"] = [str(cfg["account_id"])]
        except Exception as e:
            print("shop-config parse err", e)
    print("AjaxSearch", info["ajax_search_raw"])

    account_id = info["account_ids"][0] if info["account_ids"] else None
    query = "book"
    # also try a Cyrillic query common for kids books
    queries = ["book", "сказ", "азбук"]

    if account_id:
        for q in queries:
            for loc in ("en", "ru"):
                params = urllib.parse.urlencode(
                    {
                        "query": q,
                        "account_id": account_id,
                        "locale": loc,
                        "fields[]": "price_min",
                    },
                    doseq=True,
                )
                # urlencode with fields[] needs special handling
                url = (
                    "%s/search_suggestions?query=%s&account_id=%s&locale=%s&fields%%5B%%5D=price_min"
                    % (BASE, urllib.parse.quote(q), account_id, loc)
                )
                st, data = try_json(url)
                titles = titles_from_suggestions(data)
                print("\n=== suggestions q=%r locale=%s status=%s ===" % (q, loc, st))
                print(json.dumps(titles, ensure_ascii=False, indent=2)[:1200])
                if titles and any(t.get("id") for t in titles):
                    # keep first hit ids for products_by_id
                    ids = [str(t["id"]) for t in titles if t.get("id")][:3]
                    info["_probe_ids"] = ids
                    info["_probe_q"] = q
                    info["_probe_loc"] = loc
                    if loc == "en" and titles:
                        break
            if info.get("_probe_ids"):
                break

    ids = info.get("_probe_ids") or info["product_ids"][:3]
    if ids:
        path = "/products_by_id/%s.json" % ",".join(ids)
        for extra in ("", "?lang=en", "?locale=en", "?lang=en&locale=en"):
            url = BASE + path + extra
            st, data = try_json(url)
            print("\n=== products_by_id %s status=%s ===" % (extra or "(none)", st))
            print(json.dumps(titles_from_products(data), ensure_ascii=False, indent=2)[:800])

        # search.json
        for loc in ("en", "ru"):
            url = "%s/search.json?q=%s&lang=%s" % (
                BASE,
                urllib.parse.quote(info.get("_probe_q") or "book"),
                loc,
            )
            st, data = try_json(url)
            products = []
            if isinstance(data, dict):
                products = data.get("products") or data.get("items") or []
            elif isinstance(data, list):
                products = data
            sample = [
                {"id": p.get("id"), "title": p.get("title")}
                for p in products[:5]
                if isinstance(p, dict)
            ]
            print("\n=== search.json lang=%s status=%s ===" % (loc, st))
            print(json.dumps(sample, ensure_ascii=False, indent=2)[:800])

    # Also fetch RU homepage for comparison of shop-config
    print("\n=== FETCH /?lang=ru shop-config ===")
    st, _, raw_ru = fetch(BASE + "/?lang=ru")
    info_ru = parse_html(raw_ru.decode("utf-8", "replace"))
    print("html_lang", info_ru["html_lang"], "locales", info_ru["locales"][:5])
    if info_ru.get("shop-config"):
        sc = info_ru["shop-config"].replace("&quot;", '"')
        try:
            cfg = json.loads(sc)
            print("ru shop locale", cfg.get("locale"), "account", cfg.get("account_id"))
        except Exception as e:
            print("ru parse", e, sc[:200])


if __name__ == "__main__":
    main()
