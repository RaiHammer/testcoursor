# Review: Code Reviewer — gen-2 поставка df_quick_search

**ID задачи:** `2026-07-23-df-quick-search-gen2`  
**Дата:** 2026-07-23  
**Ревьюер:** Code Reviewer  
**Версия артефакта:** `projects/df_quick_search/widget-gen2/` (+ root README)

## Вердикт

**APPROVED**

## Чеклист

| # | Критерий | Статус | Комментарий |
|---|----------|--------|-------------|
| 1 | Соответствует плану / Arch | ✅ | Дерево §3; liquid-адаптер; fieldset; keys; media; patch; install; root README |
| 2 | data-* паритет с gen-4 | ✅ | Имена + `'true'`/`'false'`; доп. `articles-server-total`, `articles-cache-key`, CSS vars, JSON scripts |
| 3 | Checkbox `== '1'` / else false | ✅ | Все 10 bool в liquid явным `{% if … == '1' %}…{% else %}…{% endif %}` |
| 4 | keys.json default-ON = `"1"` | ✅ | 8 ON-ключей `"1"`; `show_articles` / `hide_zero_price` absent (OFF) |
| 5 | `| escape` на строковых data-* | ✅ | placeholder, popular, triggers, handles, blog_url, cache-key |
| 6 | JS = копия snippet.js | ✅ | SHA256 идентичен: `57757a1c…f21097` |
| 7 | CSS + critical overlay | ✅ | z-index 2147483000/3646, overlay/panel `!important`, `html.df-quick-search-open`, mobile panel; scss-стили + desktop scroll |
| 8 | 21 поле в fieldset | ✅ | 21× `name="df_qs_*"` |
| 9 | install.md полный | ✅ | 6 шагов, sync, checklist, out-of-scope, cache fallback note |
| 10 | `widget/` не тронут | ✅ | `git ls-files widget/` = 0 (весь продукт untracked); правок SSOT в scope задачи нет |
| 11 | README root корректен | ✅ | Gen-2 primary = `widget-gen2/`; SimpleWidget — запасной |
| 12 | Unit-тесты gen-4 | ✅ | settings / fetch (18) / categories — all passed |
| 13 | Безопасность (XSS / секреты) | ✅ | escape на строках; нет секретов в пакете |
| 14 | Минимальный diff / читаемость | ✅ | Только gen-2 пакет + root README |

## Критические замечания (must fix)

Нет.

## Рекомендации (should fix)

Нет блокирующих. Опционально при следующем sync:

1. Critical-блок в CSS можно держать **байт-в-байт** с gen-4 `<style>` (сейчас overlay/panel/open в шапке файла, results/spinner/desktop — в compiled-секции). Функционально покрыто; единый блок упростит diff при релизах стилей.

## Предложения (nice to have)

1. Владелец: ручной smoke S1–S6 на пилот-теме (план §5.2) — код-gate не блокирует.
2. После первого коммита продукта — добавить в CI/чеклист `fc`/`Get-FileHash` JS gen-4 ↔ gen-2.

## Что проверено (факты)

- **JS:** `widget/snippet.js` ≡ `widget-gen2/media/df_quick_search.js` (SHA256 match).
- **Tests:**
  - `node widget/tests/settings.test.js` → all checks passed
  - `node widget/tests/fetch.test.js` → all 18 checks passed
  - `node widget/tests/categories.test.js` → OK
- **Trigger default:** gen-4 + `.header_search`, form, `#header-search`, button — в liquid default и keys.json.
- **Git:** `projects/df_quick_search/` целиком `??` (не в индексе); изменений tracked `widget/` нет.

## Следующий шаг

При **APPROVED:** закрыть code gate → клиентский чеклист / установка на пилот (`templates/insales-widget-checklist.md` адаптирован в `widget-gen2/docs/install.md`). Programmer-правки не требуются.
