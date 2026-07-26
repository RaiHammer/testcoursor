import json
import re
import requests
from get_reviews import normalize_yandex_reviews_url

url = normalize_yandex_reviews_url("https://reviews.yandex.ru/shop/armedf.ru")
html = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=60).text

start = html.find('"ugcData":{"reviews"')
segment = html[start:start+35000]

# header before items
header_end = segment.find('"items":[')
header = segment[:header_end]
print("HEADER:", header)

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
tail = segment[arr_end:arr_end+500]
print("TAIL after items:", tail)
print("items", len(items), "last_id", items[-1]["id"])

# query param tests
last_id = items[-1]["id"]
base = url
results = []
for q in [
    f"?cursor={last_id}",
    f"?lastId={last_id}",
    f"?after={last_id}",
    f"?offset=25",
    f"?page=2&limit=25",
    f"?ranking=by_time&offset=25",
]:
    r = requests.get(base + q, headers={"User-Agent": "Mozilla/5.0"}, timeout=30)
    s = r.text.find('"ugcData":{"reviews"')
    seg = r.text[s:s+35000]
    ii = seg.find('"items":[')
    astart = seg.find('[', ii)
    depth = 0
    aend = None
    for i, ch in enumerate(seg[astart:], astart):
        if ch == '[':
            depth += 1
        elif ch == ']':
            depth -= 1
            if depth == 0:
                aend = i + 1
                break
    cnt = len(json.loads(seg[astart:aend]))
    first = json.loads(seg[astart:aend])[0]["author"]["name"]
    results.append((q, cnt, first))

print("QUERY TESTS:")
for q, cnt, first in results:
    print(q, cnt, first)

with open("_debug_shop9_out.txt", "w", encoding="utf-8") as f:
    f.write(header + "\n\nTAIL:\n" + tail + "\n\nQUERY:\n")
    for q, cnt, first in results:
        f.write(f"{q}\t{cnt}\t{first}\n")
