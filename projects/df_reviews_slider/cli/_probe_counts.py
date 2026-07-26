"""Quick probe: shop digest vs HTML counts vs maps."""
import base64
import re
import requests

SHOP = "https://reviews.yandex.ru/shop/armedf.ru"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "ru-RU,ru;q=0.9",
}
s = requests.Session()
html = s.get(SHOP, headers=headers, timeout=60).text

for name in ("reviewsCount", "reviewCount", "ratingCount", "feedbackCount", "totalCount"):
    vals = re.findall(rf'"{name}"\s*:\s*(\d+)', html)
    if vals:
        print(f"{name}: {vals[:5]}")

domain = "armedf.ru"
oid = f"/site/{base64.b64encode(domain.encode()).decode()}"
params = {
    "objectId": oid,
    "appId": "vertical-object",
    "otype": "Site",
    "offset": 0,
    "limit": 100,
    "fixTokens": "true",
    "withNpsScore": "1",
    "ignore_filter_aspects_stats_by_tag": "1",
}
r = s.get("https://reviews.yandex.ru/ugcpub/digest", params=params, headers={**headers, "Referer": SHOP}, timeout=60)
data = r.json()
views = [v for v in data.get("view", {}).get("views", []) if v.get("type") == "/ugc/review"]
print("digest reviews:", len(views), "pager:", data.get("pager"))

# SSR review blocks in HTML
ssr = len(re.findall(r'"type"\s*:\s*"/ugc/review"', html))
print("SSR /ugc/review in HTML:", ssr)
