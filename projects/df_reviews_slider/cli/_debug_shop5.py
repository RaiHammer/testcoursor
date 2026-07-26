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

# Find ugcData block
idx = html.find('"ugcData"')
print("ugcData at", idx)
chunk = html[idx:idx+5000]
print(chunk[:800])

# Try to extract reviews array from embedded JSON
# Pattern: "ugcData":{"reviews":{"count":...,"items":[...]}}
m = re.search(r'"ugcData"\s*:\s*(\{"reviews"\s*:\s*\{.*?"items"\s*:\s*\[)', html)
print("regex m", bool(m))

# Find items array start
start = html.find('"ugcData":{"reviews"')
if start == -1:
    start = html.find('"ugcData":')
print("start", start)
segment = html[start:start+200000]

# Brute force: find "items":[ and parse JSON array
items_idx = segment.find('"items":[')
print("items_idx", items_idx)
if items_idx >= 0:
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
    if arr_end:
        arr_text = segment[arr_start:arr_end]
        print("array len chars", len(arr_text))
        try:
            items = json.loads(arr_text)
            print("items parsed", len(items))
            if items:
                print("keys", items[0].keys())
                print("sample", json.dumps(items[0], ensure_ascii=False)[:400])
        except json.JSONDecodeError as e:
            print("json error", e)
            print(arr_text[:200])

# Also check count field
count_m = re.search(r'"ugcData"\s*:\s*\{"reviews"\s*:\s*\{"count"\s*:\s*(\d+)', html)
print("count from ugcData", count_m.group(1) if count_m else None)

# fetchNext function hint - look for API path in bundle
for pat in [r'fetchNext[^}]{0,200}', r'/ugcpub/[^"\']*review[^"\']*', r'getReviews[^"\']{0,100}']:
    found = re.findall(pat, html, re.I)
    print(pat[:30], len(found))
    for x in found[:3]:
        print(" ", x[:150])
