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

# Find pageNumber / ugcRequestParams context
for key in ["ugcRequestParams", "pageNumber", "reviewsCount", "objectId", "fetchReviews", "reviewsApi"]:
    positions = [m.start() for m in re.finditer(re.escape(key), html)]
    print(key, "occurrences", len(positions))
    for pos in positions[:2]:
        print(" ", html[pos:pos+250].replace("\n", " ")[:240])

# Try API endpoints
candidates = [
    "https://reviews.yandex.ru/ugcpub/api/v1/reviews",
    "https://reviews.yandex.ru/api/reviews",
    "https://reviews.yandex.ru/shop/armedf.ru/reviews",
    "https://reviews.yandex.ru/ugcpub/object/shop/armedf.ru/reviews",
]
for api in candidates:
    r = requests.get(api, headers=headers, timeout=30)
    print(api, r.status_code, r.headers.get("content-type", "")[:40])

# Search fetch URLs in inline scripts
fetch_urls = set(re.findall(r'fetch\(["\']([^"\']+)["\']', html))
xhr_urls = set(re.findall(r'url:\s*["\']([^"\']+)["\']', html))
print("fetch urls", list(fetch_urls)[:10])
print("xhr urls", list(xhr_urls)[:10])

# Extract JSON-LD and count reviews
from get_reviews import parse_yandex_json_ld_reviews
reviews = parse_yandex_json_ld_reviews(html)
print("jsonld reviews", len(reviews))
if reviews:
    print("sample", reviews[0])

# Parse shop HTML manually - find Review blocks
# Structure: div.Review.Review_hasReactions
pattern = re.compile(
    r'<div class="Review Review_hasReactions"[^>]*>(.*?)</div>\s*<div class="ReviewAspects',
    re.S,
)
blocks = pattern.findall(html)
print("Review blocks before aspects", len(blocks))

# Alternative: split by Review_hasReactions
parts = html.split('class="Review Review_hasReactions"')
print("split parts", len(parts) - 1)

# Look for reviews in window state - often in data-bem or similar
bem = re.findall(r'data-bem[^>]+', html)
print("data-bem", len(bem))

# pageNumber values
pages = re.findall(r'"pageNumber"\s*:\s*(\d+)', html)
limits = re.findall(r'"limit"\s*:\s*(\d+)', html)
print("pageNumbers", pages[:10], "limits", limits[:10])

# Try offset API pattern from yandex ugc
for offset in [0, 25, 50]:
    test = f"https://reviews.yandex.ru/ugcpub/object/shop/armedf.ru/reviews?limit=25&offset={offset}"
    r = requests.get(test, headers=headers, timeout=30)
    print("offset test", offset, r.status_code, len(r.text), r.text[:80])

# grep for /reviews? in html
for m in re.finditer(r'/ugcpub/[^"\']{5,120}', html):
    s = m.group(0)
    if "review" in s.lower() or "object" in s.lower():
        print("ugcpub path", s[:150])
