import json
import requests

base = "https://reviews.yandex.ru/ugcpub/digest"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "ru-RU,ru;q=0.9",
    "Accept": "application/json, text/plain, */*",
    "Referer": "https://reviews.yandex.ru/shop/armedf.ru",
}

session = requests.Session()
session.get("https://reviews.yandex.ru/shop/armedf.ru", headers=headers, timeout=60)

params_base = {
    "objectId": "/site/YXJtZWRmLnJ1",
    "appId": "vertical-object",
    "otype": "Site",
    "limit": 25,
    "fixTokens": "true",
    "withNpsScore": "1",
    "ignore_filter_aspects_stats_by_tag": "1",
}

all_reviews = []
for offset in [0, 25, 50, 75, 100]:
    params = {**params_base, "offset": offset}
    r = session.get(base, params=params, headers=headers, timeout=60)
    data = r.json()
    views = data.get("view", {}).get("views", [])
    reviews = [v for v in views if v.get("type") == "/ugc/review"]
    pager = data.get("pager", {})
    print(
        "offset",
        offset,
        "reviews",
        len(reviews),
        "pager",
        pager,
        "first",
        reviews[0]["author"]["name"] if reviews else "-",
    )
    all_reviews.extend(reviews)

print("TOTAL unique", len({r["id"] for r in all_reviews}))
