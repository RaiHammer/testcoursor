import re
import requests

u = "https://yastatic.net/s3/reefstatic/_/v2/main-chunk.7ce46f95d3dbc454f.js"
js = requests.get(u, timeout=60).text
print("len", len(js))
for pat in [
    "ugcpub",
    "/reviews",
    "fetchNext",
    "vertical-object",
    "objectId",
    "offset",
    "cursor",
    "loadMore",
    "getReviews",
    "reviews/fetch",
    "reviews/get",
    "reviews/load",
]:
    c = js.count(pat)
    if c:
        print(pat, c)

for m in re.finditer(r'["\']([^"\']*ugcpub[^"\']*)["\']', js):
    s = m.group(1)
    if "review" in s.lower() or "fetch" in s.lower() or "object" in s.lower():
        print("path", s[:180])

for m in re.finditer(r'fetchNext[^;]{0,300}', js):
    print("fetchNext ctx", m.group(0)[:250])
    break

for m in re.finditer(r'.{0,60}vertical-object.{0,120}', js):
    print("vertical ctx", m.group(0)[:200])
    break
