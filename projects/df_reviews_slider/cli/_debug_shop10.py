import re
import requests
from get_reviews import normalize_yandex_reviews_url

url = normalize_yandex_reviews_url("https://reviews.yandex.ru/shop/armedf.ru")
html = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=60).text

# Search around fetchedReviewsCount
for m in re.finditer(r'.{0,120}fetchedReviewsCount.{0,200}', html):
    s = m.group(0)
    if "fetch" in s.lower() or "api" in s.lower() or "ugc" in s.lower():
        print("CTX:", s[:300])
        print("---")

# Search for POST paths in inline scripts
for pat in [
    r'fetch\(["\']([^"\']+)["\']',
    r'fetch\(`([^`]+)`',
    r'\.post\(["\']([^"\']+)["\']',
    r'url:\s*["\'](/ugcpub[^"\']+)["\']',
    r'["\'](/ugcpub/api[^"\']+)["\']',
    r'["\'](https://reviews\.yandex\.ru/ugcpub[^"\']+)["\']',
]:
    found = set(re.findall(pat, html))
    if found:
        print("PAT", pat[:40], len(found))
        for x in list(found)[:10]:
            print(" ", x[:150])

# Look for chunk imports / dynamic import URLs
imports = set(re.findall(r'"(/static/chunks/[^"]+\.js)"', html))
print("chunks", len(imports))
for c in sorted(imports)[:20]:
    print(c)

# Search all .js references
all_js = set(re.findall(r'//yastatic\.net[^"\']+\.js', html))
print("all js refs", len(all_js))
for j in all_js:
    print(j)
