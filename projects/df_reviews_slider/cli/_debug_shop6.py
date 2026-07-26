import json
import re
import requests
from get_reviews import normalize_yandex_reviews_url

url = normalize_yandex_reviews_url("https://reviews.yandex.ru/shop/armedf.ru")
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "ru-RU,ru;q=0.9",
}
html = requests.get(url, headers=headers, timeout=60).text

# Search API-like paths
paths = set(re.findall(r'["\'](/ugcpub/[^"\']{3,120})["\']', html))
for p in sorted(paths):
    print(p)

# csrf token
csrf = re.findall(r'"csrfToken"\s*:\s*"([^"]+)"', html)
print("csrf", csrf[:1])

# objectId base64
obj = re.findall(r'"objectId"\s*:\s*"([^"]+)"', html)
print("objectIds", set(obj))

# Try common review fetch endpoints with POST
object_id = "/site/YXJtZWRmLnJ1"
csrf_token = csrf[0] if csrf else ""

post_headers = {
    **headers,
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Origin": "https://reviews.yandex.ru",
    "Referer": url,
}
if csrf_token:
    post_headers["X-CSRF-Token"] = csrf_token

payloads = [
    {"objectId": object_id, "limit": 25, "offset": 25, "otype": "Site"},
    {"objectId": object_id, "limit": 25, "page": 2, "otype": "Site"},
    {"objectId": object_id, "limit": 25, "offset": 25, "appId": "vertical-object"},
]

endpoints = [
    "https://reviews.yandex.ru/ugcpub/api/reviews",
    "https://reviews.yandex.ru/ugcpub/reviews",
    "https://reviews.yandex.ru/ugcpub/api/v1/reviews/list",
    "https://reviews.yandex.ru/ugcpub/api/v1/object/reviews",
    "https://reviews.yandex.ru/ugcpub/api/v1/reviews",
]

for ep in endpoints:
    for payload in payloads[:1]:
        for method in ["GET", "POST"]:
            try:
                if method == "GET":
                    r = requests.get(ep, params=payload, headers=headers, timeout=20)
                else:
                    r = requests.post(ep, json=payload, headers=post_headers, timeout=20)
                ct = r.headers.get("content-type", "")
                if r.status_code != 404:
                    print(method, ep, r.status_code, ct[:30], r.text[:120].replace("\n", " "))
            except Exception as e:
                print("err", ep, e)

# Search for endpoint string near fetchNext in source
for m in re.finditer(r'.{0,80}fetchNext.{0,120}', html):
    s = m.group(0)
    if "ugcpub" in s or "api" in s or "reviews" in s:
        print("ctx", s[:200])

# Try GET with query params on object page variants
for q in [
    "?offset=25&limit=25",
    "?page=2&limit=25",
    "?cursor=25&limit=25",
]:
    test = f"https://reviews.yandex.ru/ugcpub/object/shop/armedf.ru/reviews{q}"
    r = requests.get(test, headers=headers, timeout=20)
    print("GET", test, r.status_code, len(r.text))
