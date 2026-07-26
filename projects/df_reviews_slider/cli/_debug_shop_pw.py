from playwright.sync_api import sync_playwright
import json
import re

url = "https://reviews.yandex.ru/shop/armedf.ru"
api_calls = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page(locale="ru-RU")

    def on_response(resp):
        u = resp.url
        if "ugcpub" in u and resp.status == 200:
            ct = resp.headers.get("content-type", "")
            if "json" in ct or "reviews" in u.lower():
                try:
                    body = resp.text()
                except Exception:
                    body = ""
                api_calls.append((u, ct, body[:300]))

    page.on("response", on_response)
    page.goto(url, wait_until="networkidle", timeout=120000)

    # count reviews in DOM
    def count_reviews():
        return page.locator(".Review-Text").count()

    print("initial", count_reviews())

    # click load more if exists
    for i in range(10):
        btn = page.locator(".ReviewMoreButton-Button, button:has-text('Показать ещё'), button:has-text('ещё')")
        if btn.count() == 0:
            print("no more button at iter", i)
            break
        try:
            btn.first.click(timeout=5000)
            page.wait_for_timeout(2000)
            print(f"after click {i+1}", count_reviews())
        except Exception as e:
            print("click fail", i, e)
            break

    html = page.content()
    print("final dom reviews", count_reviews())
    print("api calls", len(api_calls))
    for u, ct, body in api_calls[:10]:
        print("API", u[:120])
        print(" ", ct, body[:150].replace("\n", " "))

    browser.close()
