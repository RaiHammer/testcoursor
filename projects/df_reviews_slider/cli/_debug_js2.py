import re
import requests

scripts = [
    "https://yastatic.net/s3/reefstatic/_/v2/modifiable-main.5ec6f530af000af6b.js",
    "https://yastatic.net/s3/reefstatic/_/v2/static/chunks/main-vanilla@desktop.3dd186dbc156b52ff.js",
]

for u in scripts:
    js = requests.get(u, timeout=60).text
    print("\n===", u.split("/")[-1], "len", len(js), "===")
    for pat in ["ugcpub", "fetchNext", "vertical-object", "reviews/fetch", "reviews/get", "reviews/load", "loadMore", "hasMore"]:
        c = js.count(pat)
        if c:
            print(pat, c)
    for m in re.finditer(r'["\']([^"\']*ugcpub[^"\']*)["\']', js):
        s = m.group(1)
        if any(x in s for x in ["review", "fetch", "object", "api"]):
            print("path", s[:200])
