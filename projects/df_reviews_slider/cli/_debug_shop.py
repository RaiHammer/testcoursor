import re
import requests
from get_reviews import (
    normalize_yandex_reviews_url,
    parse_yandex_html,
    parse_yandex_expected_count,
    parse_yandex_json_ld_reviews,
    fetch_yandex_paginated,
    yandex_url_with_page,
)

url = normalize_yandex_reviews_url("https://reviews.yandex.ru/shop/armedf.ru")
print("URL:", url)
headers = {"User-Agent": "Mozilla/5.0", "Accept-Language": "ru-RU,ru;q=0.9"}
r = requests.get(url, headers=headers, timeout=60)
html = r.text
print("status", r.status_code, "len", len(html))
print("business-review-view count", html.count("business-review-view"))
print("expected reviewCount", parse_yandex_expected_count(html))

for pat in [
    r"reviewCount[^0-9]*(\d+)",
    r"(\d+)\s*отзыв",
    r'"totalCount":(\d+)',
    r'"count":(\d+)',
    r"reviewsCount[^0-9]*(\d+)",
]:
    m = re.search(pat, html, re.I)
    print("pattern", pat[:35], "->", m.group(1) if m else None)

maps = parse_yandex_html(html)
jsonld = parse_yandex_json_ld_reviews(html)
print("parse_yandex_html page1", len(maps), "jsonld", len(jsonld))

for page in [2, 3, 4]:
    u = yandex_url_with_page(url, page)
    r2 = requests.get(u, headers=headers, timeout=60)
    n = len(parse_yandex_html(r2.text))
    print(f"page {page} url={u} parse={n} len={len(r2.text)}")

reviews, expected = fetch_yandex_paginated(url)
print("fetch_yandex_paginated", len(reviews), "expected", expected)

classes = set(re.findall(r'class="([^"]*review[^"]{0,50})"', html, re.I))
print("review classes:", sorted(classes)[:30])
