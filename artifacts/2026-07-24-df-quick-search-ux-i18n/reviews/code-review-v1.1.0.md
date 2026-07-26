# Review: Code Review — df_quick_search v1.1.0 locale + currency

**ID задачи:** `2026-07-24-df-quick-search-ux-i18n`  
**Дата:** 2026-07-24  
**Ревьюер:** Code Reviewer  
**Версия артефакта:** v1.1.0  
**Основание:** `02-fix-locale.md` (упрощённый конвейер; 04-plan отсутствует)

## Вердикт

**APPROVED**

## Чеклист

| # | Критерий | Статус | Комментарий |
|---|----------|--------|-------------|
| 1 | Соответствует `02-fix-locale.md` | ✅ | Все 6 пунктов Fix реализованы в JS/Liquid/docs |
| 2 | `products_by_id` → `lang` (не `locale`) | ✅ | `requestProductsByIdsChunk`: `data.lang` / `?lang=` (jQuery + fetch) |
| 3 | Enrich: title / price_min | ✅ | `title: product.title \|\| full.title`; `price_min` предпочитает enrich |
| 4 | `formatPrice` + Shop.config money object | ✅ | `%n`/`%u`, unit/delimiter/separator; fallback USD/EUR/RUB по `currency_code` |
| 5 | UI chrome `t()` + Liquid Search/Close | ✅ | `STRINGS.ru\|en`; Liquid panel/aria/placeholder + `data-ui-locale` |
| 6 | Suggestions всегда force `data.locale` | ✅ | После copy `AjaxSearch.data` — overwrite `detectApiLocale()` |
| 7 | Cache key locale+currency | ✅ | `buildSearchCacheKey` = query + `::` + locale + `::` + currency |
| 8 | Gen-2 critical chrome CSS не сломан | ✅ | Inline `<style>` overlay/panel/close/input/chips сохранён; правки только locale-строки / attrs |
| 9 | Sync gen-4 ↔ gen-2 JS | ✅ | Те же маркеры фикса в `widget-gen2/media/df_quick_search.js` |
| 10 | Нет критических багов / XSS / секретов | ✅ | Titles/chrome через `escapeHtml`; секретов нет |
| 11 | Тесты адекватны | ✅ | `locale.test.js` покрывает lang URL, merge, money USD, cache key |
| 12 | inSales: нет default-on show_* | ✅ | Bool/settings_form не менялись |
| 13 | Версия / CHANGELOG / README / FEATURES | ✅ | v1.1.0 + re-upload list; analysis §3 скорректирован |
| 14 | Error handling | ✅ | Enrich miss → storefront keep/filter; money fallback при отсутствии object |

## Проверка critical fixes (детально)

| # | Требование | Где | Результат |
|---|------------|-----|-----------|
| 1 | `lang` query param | `snippet.js` ~857–889 | ✅ `data.lang` / `?lang=`; **нет** `locale` на products_by_id |
| 2 | Enrich merge | ~960–967 | ✅ suggestion title first; enrich `price_min` first |
| 3 | `formatPrice` money object | ~535–583 | ✅ object path + `%n`/`%u`; USD → `$2.91`-style |
| 4 | UI chrome | STRINGS + `t()`; Liquid ~7–21, 127, 470–472 | ✅ |
| 5 | Force suggestions locale | `getSuggestionsBaseData` ~1295–1299 | ✅ всегда после AjaxSearch copy |
| 6 | Cache key | `buildSearchCacheKey` ~192–196 | ✅ |
| 7 | Gen-2 liquid CSS | `widget-gen2/snippets/df_quick_search.liquid` ~155–535 | ✅ critical block intact |

## Критические замечания (must fix)

_Нет._

## Рекомендации (should fix)

1. **`widget-gen2/docs/install.md` — checklist v1.1.0 устарел:** заголовок всё ещё «appear + hover», текст «liquid без изменений» / «js + css». Для ship v1.1.0 нужно: заливка **js + liquid** (не css-only), плюс пункты EN titles, `$`/unit, chrome Search/Close. Не блокирует код, но повышает риск неверной заливки gen-2.

2. **Liquid `df_qs_locale == 'en'`** — точное сравнение. Если витрина отдаст `en-US` / `en_US`, panel/placeholder останутся RU, пока JS (split primary) уже уйдёт в EN. На типичном inSales (`en`/`ru`) ок; при региональных кодах — брать primary как в JS (`split: '-'` / `_`).

## Предложения (nice to have)

1. `locale.test.js` дублирует хелперы вместо shared fixture — риск дрейфа с runtime (как у second-image в settings.test).
2. `formatPrice(...)` и option labels сортировки вставляются в HTML без `escapeHtml` — сейчас источники доверенные (Shop.config / STRINGS); при желании обернуть для единообразия.
3. После ship — preview на bimbobooks: `?lang=en` + USD cookie → Network `products_by_id?...&lang=en`, titles EN, цены с `$`.

## Соответствие scope (`02-fix-locale.md`)

| Пункт Fix | Статус |
|-----------|--------|
| 1. `lang` на `/products_by_id` | ✅ |
| 2. Force `locale` в suggestions | ✅ |
| 3. Enrich title/price_min | ✅ |
| 4. Cache key locale+currency | ✅ |
| 5. `formatPrice` money object | ✅ |
| 6. JS + Liquid chrome | ✅ |
| Residual limits documented | ✅ CHANGELOG + fix-note |
| Re-upload file list | ✅ gen-4 js/liquid/info; gen-2 js/liquid |

## Следующий шаг

- **APPROVED:** re-upload по CHANGELOG v1.1.0 — Gen-4: `snippet.js`, `snippet.liquid`, `info.json`; Gen-2: `media/df_quick_search.js`, `snippets/df_quick_search.liquid`. Затем preview EN+USD; желательно поправить install.md checklist до/сразу после заливки.
