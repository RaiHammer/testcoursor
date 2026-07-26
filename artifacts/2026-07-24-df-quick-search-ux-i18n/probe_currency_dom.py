# -*- coding: utf-8 -*-
"""Probe header currency DOM + Shop.config keys after USD switch."""
from __future__ import print_function
import json, re, urllib.request, http.cookiejar

BASE = "https://bimbobooks.ru"
UA = "DanForge-QS-currency-probe/1.1"

jar = http.cookiejar.CookieJar()
opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))


def fetch(url, data=None, headers=None):
    h = {"User-Agent": UA, "Accept": "*/*"}
    if headers:
        h.update(headers)
    req = urllib.request.Request(url, data=data, headers=h)
    with opener.open(req, timeout=30) as resp:
        return resp.status, resp.read(), resp.headers


def main():
    fetch(
        BASE + "/site_currencies/update_current",
        data=b"site_currency_code=USD",
        headers={
            "Content-Type": "application/x-www-form-urlencoded",
            "Referer": BASE + "/?lang=en",
            "Origin": BASE,
        },
    )
    st, raw, _ = fetch(BASE + "/?lang=en")
    html = raw.decode("utf-8", "replace")
    out = []
    out.append("status %s len %s" % (st, len(html)))
    out.append("cookies: %s" % [(c.name, c.value[:60]) for c in jar])

    # currency select
    for pat in [
        r'name=["\']site_currency_code["\'][\s\S]{0,1500}?</select>',
        r'header-currency[\s\S]{0,2000}?</select>',
        r'class=["\'][^"\']*currency[^"\']*["\'][^>]{0,200}',
        r'<option[^>]*selected[^>]*>[\s\S]{0,80}</option>',
    ]:
        ms = re.findall(pat, html, re.I)
        out.append("PAT %s hits=%s" % (pat[:50], len(ms)))
        for x in ms[:3]:
            out.append("  SAMPLE: %s" % x[:500].replace("\n", " "))

    m = re.search(r'<meta[^>]*name=["\']shop-config["\'][^>]*>', html, re.I)
    if m:
        tag = m.group(0)
        cm = re.search(r'(?:content|data-config)=["\'](.*?)["\']', tag, re.I | re.S)
        if cm:
            rawcfg = cm.group(1).replace("&quot;", '"').replace("&amp;", "&")
            cfg = json.loads(rawcfg)
            money_keys = [k for k in cfg if "money" in k.lower() or "curr" in k.lower()]
            out.append("CFG keys: %s" % money_keys)
            for k in money_keys:
                v = cfg[k]
                if isinstance(v, dict):
                    out.append("%s = %s" % (k, json.dumps(v, ensure_ascii=False)[:400]))
                else:
                    out.append("%s = %r" % (k, v))

    # Look for money_format string variants
    for key in ["money_format", "money_with_currency_format", "currency"]:
        ms = re.findall(r'"%s"\s*:\s*(\{.*?\}|"[^"]*")' % key, html[:500000])
        out.append("json key %s hits %s sample %s" % (key, len(ms), ms[:2]))

    path = r"D:\Важное\Личный джарвис\artifacts\2026-07-24-df-quick-search-ux-i18n\probe_currency_dom_out.txt"
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(out))
    print("wrote", path, "lines", len(out))


if __name__ == "__main__":
    main()
