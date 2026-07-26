import re
import requests
from get_reviews import normalize_yandex_reviews_url

url = normalize_yandex_reviews_url("https://reviews.yandex.ru/shop/armedf.ru")
headers = {"User-Agent": "Mozilla/5.0", "Accept-Language": "ru-RU,ru;q=0.9"}
html = requests.get(url, headers=headers, timeout=60).text

needles = [
    "vertical-object",
    "fetchReviews",
    "reviews/list",
    "reviewsList",
    "getMoreReviews",
    "loadReviews",
    "ugcRequest",
    "appId",
    "initLimit",
    "hasMore",
    "nextOffset",
    "cursor",
]
for n in needles:
    print(n, html.count(n))

# extract strings containing ugcpub and reviews
strings = set(re.findall(r'["\']([^"\']{5,200})["\']', html))
interesting = [s for s in strings if ("ugcpub" in s and ("review" in s.lower() or "object" in s.lower() or "fetch" in s.lower())) or "vertical-object" in s]
for s in sorted(interesting)[:40]:
    print(s)

# Look for fetch URL template
for m in re.finditer(r'["\']([^"\']*ugcpub[^"\']*)["\']', html):
    s = m.group(1)
    if any(x in s for x in ["fetch", "list", "more", "page", "offset", "cursor"]):
        print("candidate", s)

# Search for offset/limit query builder in minified code near vertical-object
idx = html.find("vertical-object")
print("\ncontext vertical-object:")
print(html[idx-100:idx+400])

# hasMore in ugcData?
print("hasMore occurrences", html.count("hasMore"))
for m in re.finditer(r'"hasMore"\s*:\s*(true|false)', html):
    print(" hasMore", m.group(0))
