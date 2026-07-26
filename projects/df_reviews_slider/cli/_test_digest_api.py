import json
import requests

base = "https://reviews.yandex.ru/ugcpub/digest"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "ru-RU,ru;q=0.9",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://reviews.yandex.ru/shop/armedf.ru",
}

all_items = []
offset = 0
limit = 25
expected = None

while offset <= 200:
    params = {
        "objectId": "/site/YXJtZWRmLnJ1",
        "appId": "vertical-object",
        "otype": "Site",
        "offset": offset,
        "limit": limit,
        "fixTokens": "true",
        "withNpsScore": "1",
        "ignore_filter_aspects_stats_by_tag": "1",
        "requestParams": '{"isSiteShop":1}',
    }
    r = requests.get(base, params=params, headers=headers, timeout=60)
    print("offset", offset, "status", r.status_code, "ct", r.headers.get("content-type", "")[:40])
    if r.status_code != 200:
        print(r.text[:200])
        break
    try:
        data = r.json()
    except Exception:
        print("not json", r.text[:200])
        break
    reviews = data.get("reviews") or {}
    items = reviews.get("items") or []
    count = reviews.get("count")
    total = reviews.get("totalCount")
    expected = count or total or expected
    print("  items", len(items), "count", count, "total", total, "first", items[0]["author"]["name"] if items else "-")
    if not items:
        break
    all_items.extend(items)
    if len(all_items) >= (expected or 999):
        break
    offset += len(items)

print("TOTAL", len(all_items), "expected", expected)

with open("_digest_result.json", "w", encoding="utf-8") as f:
    json.dump(all_items, f, ensure_ascii=False, indent=2)
