import json
import requests

base = "https://reviews.yandex.ru/ugcpub/digest"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "ru-RU,ru;q=0.9",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://reviews.yandex.ru/shop/armedf.ru",
    "Origin": "https://reviews.yandex.ru",
}

variants = [
    {
        "objectId": "/site/YXJtZWRmLnJ1",
        "appId": "vertical-object",
        "otype": "Site",
        "offset": 0,
        "limit": 25,
        "fixTokens": "true",
        "withNpsScore": "1",
        "ignore_filter_aspects_stats_by_tag": "1",
    },
    {
        "objectId": "/site/YXJtZWRmLnJ1",
        "appId": "vertical-object",
        "otype": "Site",
        "offset": 25,
        "limit": 25,
        "fixTokens": "true",
        "withNpsScore": "1",
        "ignore_filter_aspects_stats_by_tag": "1",
    },
    {
        "objectId": "/site/YXJtZWRmLnJ1",
        "appId": "vertical-object",
        "otype": "Site",
        "offset": 0,
        "limit": 25,
        "fixTokens": "true",
        "withNpsScore": "1",
        "ignore_filter_aspects_stats_by_tag": "1",
        "isSiteShop": "1",
    },
    {
        "objectId": "/site/YXJtZWRmLnJ1",
        "appId": "vertical-object",
        "otype": "Site",
        "offset": 0,
        "limit": 25,
        "fixTokens": "true",
        "withNpsScore": "1",
        "ignore_filter_aspects_stats_by_tag": "1",
        "ranking": "by_time",
    },
]

session = requests.Session()
# warm up cookies from shop page
session.get("https://reviews.yandex.ru/shop/armedf.ru", headers=headers, timeout=60)

for i, params in enumerate(variants, 1):
    r = session.get(base, params=params, headers=headers, timeout=60)
    print("\n=== variant", i, params.get("offset", 0), "===")
    print("status", r.status_code)
    try:
        data = r.json()
        print("top keys", list(data.keys())[:10])
        rev = data.get("reviews") or {}
        print("reviews keys", list(rev.keys())[:10])
        items = rev.get("items") or []
        print("items", len(items), "count", rev.get("count"), "total", rev.get("totalCount"))
        if items:
            print("first author", items[0].get("author", {}).get("name"))
            print("last id", items[-1].get("id"))
    except Exception as e:
        print("err", e, r.text[:300])

# print raw first variant
r = session.get(base, params=variants[0], headers=headers, timeout=60)
open("_digest_raw.json", "w", encoding="utf-8").write(r.text)
print("\nraw saved len", len(r.text))
