import json
import requests

base = "https://reviews.yandex.ru/ugcpub/digest"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "ru-RU,ru;q=0.9",
    "Referer": "https://reviews.yandex.ru/shop/armedf.ru",
}
session = requests.Session()
session.get("https://reviews.yandex.ru/shop/armedf.ru", headers=headers, timeout=60)

base_params = {
    "objectId": "/site/YXJtZWRmLnJ1",
    "appId": "vertical-object",
    "otype": "Site",
    "offset": 0,
    "limit": 100,
    "fixTokens": "true",
    "withNpsScore": "1",
    "ignore_filter_aspects_stats_by_tag": "1",
}
for extra in [{}, {"ranking": "by_time"}, {"ranking": "by_rating"}, {"add_rating_stats": "1"}]:
    params = {**base_params, **extra}
    r = session.get(base, params=params, headers=headers, timeout=60)
    data = r.json()
    views = [v for v in data.get("view", {}).get("views", []) if v.get("type") == "/ugc/review"]
    print(extra or "default", "reviews", len(views), "pager", data.get("pager"))

# HTML count fields
html = session.get("https://reviews.yandex.ru/shop/armedf.ru", headers=headers, timeout=60).text
import re
for pat in [r'"reviewsCount"\s*:\s*(\d+)', r'"count"\s*:\s*(\d+)', r'"totalCount"\s*:\s*(\d+)', r'"ratingCount"\s*:\s*(\d+)']:
    print(pat, re.findall(pat, html)[:5])
