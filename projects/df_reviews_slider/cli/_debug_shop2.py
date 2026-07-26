import json
import re
import requests
from get_reviews import normalize_yandex_reviews_url

url = normalize_yandex_reviews_url("https://reviews.yandex.ru/shop/armedf.ru")
headers = {"User-Agent": "Mozilla/5.0", "Accept-Language": "ru-RU,ru;q=0.9"}
html = requests.get(url, headers=headers, timeout=60).text

# Find embedded JSON payloads
for name in ["__NEXT_DATA__", "__INITIAL_STATE__", "window.__data", "reviews"]:
    if name in html:
        print("found marker:", name)

# Next.js data
m = re.search(r'<script id="__NEXT_DATA__" type="application/json">(.*?)</script>', html, re.S)
if m:
    data = json.loads(m.group(1))
    print("__NEXT_DATA__ keys", data.keys())
    props = data.get("props", {}).get("pageProps", {})
    print("pageProps keys", list(props.keys())[:20])
    # dump structure shallowly
    for k, v in props.items():
        if isinstance(v, dict):
            print(" ", k, "dict keys", list(v.keys())[:10])
        elif isinstance(v, list):
            print(" ", k, "list len", len(v))
        else:
            print(" ", k, type(v).__name__, str(v)[:80])

# Sample Review blocks
blocks = re.findall(r'<div class="Review Review_hasReactions[^"]*"[^>]*>(.*?)</div>\s*<div class="Review', html, re.S)
print("Review blocks split", len(blocks))

# Try extract one review block fully
review_divs = re.findall(r'<div class="Review Review_hasReactions"[^>]*>.*?</div>\s*</div>\s*</div>', html, re.S)
print("full review divs regex", len(review_divs))

# Look for pagination / API urls in HTML
for pat in [r'https://[^"\']+reviews[^"\']+', r'/api/[^"\']+', r'"page"\s*:\s*\d+', r'"offset"\s*:\s*\d+', r'"cursor"\s*:\s*"[^"]+"']:
    found = re.findall(pat, html)
    print(pat[:40], "count", len(found))
    for x in found[:5]:
        print(" ", x[:120])

# Extract review text samples from Review-Text
texts = re.findall(r'<div class="Review-Text"[^>]*>(.*?)</div>', html, re.S)
print("Review-Text count", len(texts))
authors = re.findall(r'class="ReviewAuthor-Link"[^>]*>([^<]+)<', html)
print("authors count", len(authors), authors[:3])

# JSON in script tags with reviews array
scripts = re.findall(r'<script[^>]*>(\{.*?"reviews".*?\})</script>', html, re.S)
print("scripts with reviews", len(scripts))

# Broader: find large JSON blobs
for script in re.findall(r'<script[^>]*type="application/json"[^>]*>(.*?)</script>', html, re.S):
    if "reviewBody" in script or "Review" in script:
        try:
            obj = json.loads(script)
            print("json script type", type(obj), "len", len(str(obj)))
        except Exception:
            pass
