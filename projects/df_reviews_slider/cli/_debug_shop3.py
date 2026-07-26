import json
import re
import requests
from get_reviews import normalize_yandex_reviews_url

url = normalize_yandex_reviews_url("https://reviews.yandex.ru/shop/armedf.ru")
headers = {"User-Agent": "Mozilla/5.0", "Accept-Language": "ru-RU,ru;q=0.9"}
html = requests.get(url, headers=headers, timeout=60).text

# Author patterns
for pat in [
    r'ReviewAuthor[^>]*>([^<]{2,40})<',
    r'class="ReviewAuthor[^"]*"[^>]*>.*?<[^>]+>([^<]+)<',
    r'"author"\s*:\s*"([^"]+)"',
    r'"userName"\s*:\s*"([^"]+)"',
    r'"name"\s*:\s*"([^"]+)"',
]:
    found = re.findall(pat, html, re.S)
    print(pat[:50], len(found), found[:3])

# Rating patterns
for pat in [
    r'Review-RatingStar_view_full',
    r'"rating"\s*:\s*(\d+)',
    r'"grade"\s*:\s*(\d+)',
    r'ratingValue[^0-9]*(\d)',
]:
    print(pat[:40], len(re.findall(pat, html)))

# Date patterns
dates = re.findall(r'class="Review-Date"[^>]*>([^<]+)<', html)
print("Review-Date", len(dates), dates[:3])

# Try ugcpub API
api_urls = re.findall(r'https://reviews\.yandex\.ru/ugcpub/[^"\']+', html)
print("ugcpub urls", api_urls[:3])

# Fetch ugcpub endpoint
if api_urls:
    api = api_urls[0].replace("&amp;", "&").split("&quot;")[0].split('"')[0]
    print("trying", api)
    r = requests.get(api, headers=headers, timeout=60)
    print("status", r.status_code, "content-type", r.headers.get("content-type"))
    print(r.text[:500])

# Search for embedded state with reviews list
idx = html.find('"reviews"')
while idx != -1 and idx < len(html):
    snippet = html[max(0, idx - 20): idx + 200]
    if "reviewBody" in snippet or "Review" in snippet:
        print("snippet@", idx, snippet[:180].replace("\n", " "))
    idx = html.find('"reviews"', idx + 1)

# Look for pagination button / more reviews
for pat in [r'ReviewMoreButton', r'loadMore', r'nextPage', r'pageSize', r'pageNumber', r'"limit"\s*:\s*(\d+)']:
    m = re.findall(pat, html, re.I)
    print(pat, m[:5] if m else 0)

# Extract one review block manually
start = html.find('class="Review-Text"')
print("\ncontext around first Review-Text:")
print(html[max(0, start - 800): start + 400].replace("\n", " ")[:1200])
