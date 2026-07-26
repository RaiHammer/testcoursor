import json
import re
import requests
from get_reviews import normalize_yandex_reviews_url

base = "https://reviews.yandex.ru/shop/armedf.ru"
headers = {"User-Agent": "Mozilla/5.0", "Accept-Language": "ru-RU,ru;q=0.9"}
html = requests.get(base, headers=headers, timeout=60).text

# external scripts
scripts = re.findall(r'<script[^>]+src="([^"]+)"', html)
print("external scripts", len(scripts))
for s in scripts[:15]:
    print(" ", s[:120])

# Try ugcpub object page - maybe has full SSR
obj_url = "https://reviews.yandex.ru/ugcpub/object/shop/armedf.ru?lr=225&pers_suggest=0&text=site%3Aarmedf.ru"
obj_html = requests.get(obj_url, headers=headers, timeout=60).text
print("obj page len", len(obj_html))
print("Review-Text", obj_html.count("Review-Text"))
print("ugcData count", re.search(r'"ugcData"\s*:\s*\{"reviews"\s*:\s*\{"count"\s*:\s*(\d+)', obj_html))

# Extract items count from ugcData on object page
start = obj_html.find('"ugcData":{"reviews"')
segment = obj_html[start:start+200000]
items_idx = segment.find('"items":[')
arr_start = segment.find('[', items_idx)
depth = 0
arr_end = None
for i, ch in enumerate(segment[arr_start:], arr_start):
    if ch == '[':
        depth += 1
    elif ch == ']':
        depth -= 1
        if depth == 0:
            arr_end = i + 1
            break
items = json.loads(segment[arr_start:arr_end])
print("object page items", len(items))

# Try POST to vertical-object endpoint guesses from Yandex patterns
object_id = "/site/YXJtZWRmLnJ1"
post_headers = {
    **headers,
    "Content-Type": "application/json",
    "Accept": "application/json",
    "Origin": "https://reviews.yandex.ru",
    "Referer": obj_url,
}
payload = {
    "objectId": object_id,
    "otype": "Site",
    "appId": "vertical-object",
    "limit": 25,
    "offset": 25,
    "ranking": "by_time",
    "requestParams": {"isSiteShop": 1},
}
for ep in [
    "https://reviews.yandex.ru/ugcpub/api/v1/reviews/fetch",
    "https://reviews.yandex.ru/ugcpub/api/v1/reviews/get",
    "https://reviews.yandex.ru/ugcpub/api/v1/reviews/load",
    "https://reviews.yandex.ru/ugcpub/api/v1/reviews/page",
    "https://reviews.yandex.ru/ugcpub/api/v1/reviews/more",
    "https://reviews.yandex.ru/ugcpub/api/v1/reviews",
    "https://reviews.yandex.ru/ugcpub/api/reviews/fetch",
    "https://reviews.yandex.ru/ugcpub/api/reviews/get",
    "https://reviews.yandex.ru/ugcpub/api/reviews/load",
    "https://reviews.yandex.ru/ugcpub/api/reviews",
    "https://reviews.yandex.ru/ugcpub/reviews/fetch",
    "https://reviews.yandex.ru/ugcpub/reviews/get",
    "https://reviews.yandex.ru/ugcpub/reviews/load",
    "https://reviews.yandex.ru/ugcpub/reviews",
]:
    r = requests.post(ep, json=payload, headers=post_headers, timeout=15)
    if r.status_code not in (404, 405):
        print("POST", ep, r.status_code, r.text[:150])

# Download one big JS and search for endpoint
for s in scripts:
    if "vendor" in s or "main" in s or "desktop" in s or "reviews" in s:
        if s.startswith("//"):
            s = "https:" + s
        elif s.startswith("/"):
            s = "https://reviews.yandex.ru" + s
        try:
            js = requests.get(s, headers=headers, timeout=30).text
            for pat in ["ugcpub/api", "reviews/fetch", "reviews/get", "fetchNext", "vertical-object"]:
                if pat in js:
                    print("found in", s[:80], pat)
                    idx = js.find(pat)
                    print(js[max(0,idx-80):idx+120][:200])
        except Exception as e:
            print("js err", s[:60], e)
