# -*- coding: utf-8 -*-
"""Probe bimbobooks currency + lang on products_by_id / shop-config."""
from __future__ import print_function
import json, re, urllib.request, http.cookiejar

BASE = "https://bimbobooks.ru"
UA = "DanForge-QS-currency-probe/1.0"

def jar_opener():
    jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
    return opener, jar

def fetch(opener, url, data=None, headers=None):
    h = {"User-Agent": UA, "Accept": "*/*"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=data, headers=h)
    with opener.open(req, timeout=30) as resp:
        return resp.status, resp.read(), resp.headers

def parse_shop_config(html):
    m = re.search(r'<meta[^>]*name=["\']shop-config["\'][^>]*>', html, re.I)
    if not m:
        return None
    tag = m.group(0)
    cm = re.search(r'(?:content|data-config)=["\'](.*?)["\']', tag, re.I | re.S)
    if not cm:
        return None
    raw = cm.group(1).replace("&quot;", '"').replace("&amp;", "&")
    try:
        return json.loads(raw)
    except Exception as e:
        return {"_err": str(e), "_head": raw[:300]}

def summarize_cfg(cfg):
    if not cfg:
        return None
    money = cfg.get("money_with_currency_format")
    return {
        "locale": cfg.get("locale"),
        "currency_code": cfg.get("currency_code"),
        "currency_iso_code": cfg.get("currency_iso_code"),
        "money_type": type(money).__name__,
        "money": money if not isinstance(money, dict) else {
            "format": money.get("format"),
            "unit": money.get("unit"),
            "delimiter": money.get("delimiter"),
            "separator": money.get("separator"),
            "show_price_without_cents": money.get("show_price_without_cents"),
        },
        "default_currency_unit": (cfg.get("default_currency") or {}).get("unit"),
        "default_currency_code": (cfg.get("default_currency") or {}).get("code"),
    }

def product_titles(payload):
    products = payload.get("products") if isinstance(payload, dict) else payload
    if not isinstance(products, list):
        return []
    out = []
    for p in products[:3]:
        if not isinstance(p, dict):
            continue
        out.append({
            "id": p.get("id"),
            "title": p.get("title"),
            "price_min": p.get("price_min") or p.get("price"),
            "variants0_price": (p.get("variants") or [{}])[0].get("price") if p.get("variants") else None,
        })
    return out

def main():
    opener, jar = jar_opener()
    # EN page
    st, raw, _ = fetch(opener, BASE + "/?lang=en")
    html = raw.decode("utf-8", "replace")
    cfg = parse_shop_config(html)
    print("EN page shop-config:", json.dumps(summarize_cfg(cfg), ensure_ascii=False, indent=2))
    print("cookies after EN:", [(c.name, c.value[:40]) for c in jar])

    ids = "490265387,490265398"
    for extra in ("", "?lang=en", "?lang=en&currency=USD", "?lang=en&currency_code=USD"):
        url = BASE + "/products_by_id/" + ids + ".json" + extra
        st, raw, _ = fetch(opener, url, headers={"Accept": "application/json", "X-Requested-With": "XMLHttpRequest"})
        try:
            data = json.loads(raw.decode("utf-8", "replace"))
        except Exception:
            data = {"_raw": raw[:200]}
        print("\nproducts_by_id", extra or "(none)", "->", json.dumps(product_titles(data), ensure_ascii=False, indent=2))

    # Switch currency to USD like the theme form
    body = b"site_currency_code=USD"
    st, raw, hdrs = fetch(
        opener,
        BASE + "/site_currencies/update_current",
        data=body,
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": BASE + "/?lang=en",
            "Origin": BASE,
        },
    )
    print("\ncurrency switch status", st, "location", hdrs.get("Location"), "cookies", [(c.name, c.value[:60]) for c in jar])

    st, raw, _ = fetch(opener, BASE + "/?lang=en")
    html2 = raw.decode("utf-8", "replace")
    cfg2 = parse_shop_config(html2)
    print("\nAfter USD switch shop-config:", json.dumps(summarize_cfg(cfg2), ensure_ascii=False, indent=2))

    # Check cart / money helpers in page
    for pat in [r'currency_code["\']?\s*[:=]\s*["\']([A-Z]{3})', r'\$[0-9]', r'site_currency', r'money\(', r'currency["\']?\s*:\s*["\']USD']:
        ms = re.findall(pat, html2[:200000], re.I)
        print("pattern", pat, "hits", len(ms), "sample", ms[:5])

    for extra in ("", "?lang=en"):
        url = BASE + "/products_by_id/" + ids + ".json" + extra
        st, raw, _ = fetch(opener, url, headers={"Accept": "application/json", "X-Requested-With": "XMLHttpRequest"})
        data = json.loads(raw.decode("utf-8", "replace"))
        print("\nAfter USD products_by_id", extra or "(none)", json.dumps(product_titles(data), ensure_ascii=False, indent=2))

    # suggestions with locale after USD
    account = (cfg2 or cfg or {}).get("account_id") or 5760494
    url = "%s/search_suggestions?query=book&account_id=%s&locale=en&fields%%5B%%5D=price_min" % (BASE, account)
    st, raw, _ = fetch(opener, url, headers={"Accept": "application/json", "X-Requested-With": "XMLHttpRequest"})
    sug = json.loads(raw.decode("utf-8", "replace"))
    # dump first item keys
    items = sug if isinstance(sug, list) else sug.get("suggestions") or sug.get("products") or []
    if items:
        first = items[0]
        print("\nsuggestion0 keys", list(first.keys()) if isinstance(first, dict) else type(first))
        print("suggestion0 sample", json.dumps(first, ensure_ascii=False)[:800])

if __name__ == "__main__":
    main()
