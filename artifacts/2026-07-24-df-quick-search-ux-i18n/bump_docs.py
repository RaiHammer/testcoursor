# -*- coding: utf-8 -*-
from pathlib import Path
import re

root = Path(r"D:\Важное\Личный джарвис\projects\df_quick_search")

entry = """# CHANGELOG — df_quick_search

## v1.1.0 — multi-lang titles + UI chrome + currency (2026-07-24)

- **Root cause (titles):** `/search_suggestions?locale=en` отдаёт EN titles, но enrich `/products_by_id` **без** `lang` возвращал RU (default) и `title: full.title || product.title` затирал EN. Категории ок — Liquid SSR по locale страницы.
- **Root cause (currency):** suggestions `price_min` всегда в базовой RUR; после USD cookie `products_by_id` отдаёт конвертированные цены, но merge предпочитал suggestion → виджет оставался в ₽. `formatPrice` хардкодил `₽`.
- **Fix API:** `products_by_id?lang=…`; всегда форсировать `locale` в suggestions; enrich: `title: product.title || full.title`, `price_min` из enrich; cache key = query+locale+currency.
- **Fix UI:** словари RU/EN (`t()`); Liquid panel/aria/default placeholder + `data-ui-locale`.
- **Fix money:** `formatPrice` читает `Shop.config.money_with_currency_format` (object: format/unit/delimiter) → `$2.91` при USD.
- **Тесты:** `widget/tests/locale.test.js` — green с остальными suites.
- **Re-upload:**
  - **Gen-4:** `snippet.js`, `snippet.liquid`, `info.json`
  - **Gen-2:** `media/df_quick_search.js`, `snippets/df_quick_search.liquid`
- **Артефакт:** `artifacts/2026-07-24-df-quick-search-ux-i18n/02-fix-locale.md`
- **Лимиты:** admin placeholder/popular_queries — один язык; неизвестный locale UI → RU; смена валюты без reload Shop.config не подхватывается (тема обычно reload).

"""

cl = root / "CHANGELOG.md"
text = cl.read_text(encoding="utf-8")
if "## v1.1.0" not in text:
    if text.startswith("# CHANGELOG — df_quick_search"):
        body = text.split("\n", 1)[1].lstrip("\n")
    else:
        body = text
    cl.write_text(entry + body, encoding="utf-8")
    print("changelog: added v1.1.0")
else:
    print("changelog: already has v1.1.0")

readme = root / "README.md"
rt = readme.read_text(encoding="utf-8")
rt2 = rt.replace("**Версия:** v1.0.10", "**Версия:** v1.1.0")
rt2 = rt2.replace(
    "| **v1.0.10** | Appear-анимация выдачи; desktop hover → 2-е фото; i18n анализ (код → v1.1) |",
    "| **v1.1.0** | Multi-lang titles/chrome + currency-aware prices |\n| **v1.0.10** | Appear-анимация выдачи; desktop hover → 2-е фото; i18n анализ (код → v1.1) |",
)
rt2 = rt2.replace("- [ ] Версия **v1.0.10**", "- [ ] Версия **v1.1.0**")
readme.write_text(rt2, encoding="utf-8")
print("readme updated", rt != rt2)

feat = root / "FEATURES.md"
ft = feat.read_text(encoding="utf-8")
ft2 = ft
ft2 = re.sub(r"(Версия[^\n]*v)1\.0\.10", r"\g<1>1.1.0", ft2, count=1)
if "v1.1.0" not in ft2:
    ft2 = ft.replace("**v1.0.10**", "**v1.1.0**", 1)
    ft2 = ft2.replace("v1.0.10", "v1.1.0", 1)
feat.write_text(ft2, encoding="utf-8")
print("features updated")

install = root / "widget-gen2" / "docs" / "install.md"
if install.exists():
    it = install.read_text(encoding="utf-8")
    it2 = it.replace("v1.0.10", "v1.1.0")
    install.write_text(it2, encoding="utf-8")
    print("install.md updated", it != it2)

print("done")
