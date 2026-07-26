import re
import requests

url = "https://reviews.yandex.ru/shop/armedf.ru"
html = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=60).text

# big inline script chunks
scripts = re.findall(r"<script[^>]*>(.*?)</script>", html, re.S)
print("inline scripts", len(scripts))
big = sorted(scripts, key=len, reverse=True)
print("biggest lens", [len(s) for s in big[:5]])

text = big[0] if big else html
print("search in", len(text))

for pat in [
    r'["\']([^"\']*apphost[^"\']*)["\']',
    r'["\']([^"\']*ajax[^"\']*)["\']',
    r'["\']([^"\']*reviews[^"\']*fetch[^"\']*)["\']',
    r'["\']([^"\']*ugc[^"\']*reviews[^"\']*)["\']',
    r'path:\s*["\']([^"\']+)["\']',
    r'endpoint:\s*["\']([^"\']+)["\']',
    r'baseUrl:\s*["\']([^"\']+)["\']',
]:
    found = set(re.findall(pat, text, re.I))
    interesting = [f for f in found if any(x in f.lower() for x in ["review", "ugc", "app", "ajax", "fetch", "object"])]
    if interesting:
        print("\nPAT", pat[:35], len(interesting))
        for x in list(interesting)[:15]:
            print(" ", x[:160])

# find function J( - likely fetchNext implementation
for m in re.finditer(r'J=\(0,r\.useCallback\)\(\(\([^)]*\)=>{.{0,800}', text):
    snippet = m.group(0)
    if "fetch" in snippet or "ajax" in snippet or "post" in snippet or "get" in snippet:
        print("\nJ callback snippet:")
        print(snippet[:800])
        break

# Search for Ya.Rum or reactBus or ajax provider
for key in ["ajaxProvider", "fetchUgc", "loadUgc", "getUgc", "reviewsAjax", "requestReviews", "fetchMore"]:
    if key in text:
        idx = text.find(key)
        print("\nKEY", key, text[idx:idx+300][:300])

with open("_big_script.js", "w", encoding="utf-8") as f:
    f.write(text)
