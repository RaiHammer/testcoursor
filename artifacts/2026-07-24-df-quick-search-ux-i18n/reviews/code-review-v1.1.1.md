# Review: Code Review — df_quick_search v1.1.1 locale=[object Object]

**ID задачи:** `2026-07-24-df-quick-search-ux-i18n`  
**Дата:** 2026-07-24  
**Ревьюер:** Code Reviewer  
**Версия артефакта:** v1.1.1  
**Основание:** urgent bugfix (locale object → HTTP 500); constraints: не ломать v1.1.0, minimal diff

## Вердикт

**APPROVED**

## Чеклист

| # | Критерий | Статус | Комментарий |
|---|----------|--------|-------------|
| 1 | Баг `locale=[object Object]` закрыт | ✅ | `normalizeLocaleString` + force string на всех fetch-путях |
| 2 | `search_suggestions` всегда string locale | ✅ | `getSuggestionsBaseData`: `data.locale = detectApiLocale() \|\| 'ru'` |
| 3 | `products_by_id` / `search.json` string lang | ✅ | `lang: detectApiLocale() \|\| 'ru'` (jQuery + fetch) |
| 4 | v1.1.0 title/currency не сломаны | ✅ | Enrich `title: product.title \|\| full.title`; enrich `price_min`; `formatPrice` money object intact |
| 5 | Sync gen-4 ↔ gen-2 | ✅ | Те же `normalizeLocaleString` / detect* / force-locale в `widget-gen2/media/df_quick_search.js` |
| 6 | Минимальный diff / нет лишнего рефакторинга | ✅ | Точечная coercion + тесты + version bump |
| 7 | Тесты адекватны | ✅ | object→string, `[object Object]`→'', fallback `ru`, cache/merge regressions |
| 8 | Безопасность / секреты | ✅ | Нет XSS-регрессий; locale только в query params |
| 9 | Версия / CHANGELOG / info.json | ✅ | v1.1.1 в CHANGELOG, info*.json, README, FEATURES |
| 10 | inSales: нет default-on show_* | ✅ | Settings/bool не менялись |

## Проверка critical paths

| Путь | Поведение | Результат |
|------|-----------|-----------|
| `Shop.config.locale` object | `normalizeLocaleString` → `.code`/`.locale`/… | ✅ |
| `String(obj)` / `'[object Object]'` | Reject empty → fallback sources / `ru` | ✅ |
| `detectApiLocale` | Primary tag; `null` → callers `\|\| 'ru'` | ✅ |
| Suggestions after `AjaxSearch.data` copy | Locale overwrite always string | ✅ |
| `products_by_id` | Still `lang=` (not `locale`) | ✅ no v1.1.0 regression |
| Enrich merge | Unchanged | ✅ |
| Gen-2 JS | Same markers | ✅ |

## Критические замечания (must fix)

_Нет._

## Рекомендации (should fix)

1. **Fallback `for…in` по любым string-полям** (`normalizeLocaleString` ~676–682): объект вида `{ title: 'English' }` без `code` даст API locale `english`. Предпочтительные ключи закрывают типичный inSales shape; при странных объектах лучше сразу `''` → `ru`, чем слать display-title. Не блокирует багfix на bimbobooks.

## Предложения (nice to have)

1. `locale.test.js` по-прежнему зеркалит хелперы вручную — риск дрейфа с `snippet.js` (уже отмечалось в v1.1.0 review).
2. После re-upload — smoke на bimbobooks: Network `/search_suggestions` → `locale=en` или `locale=ru`, не `%5Bobject%20Object%5D`.

## Следующий шаг

- **APPROVED:** re-upload по CHANGELOG v1.1.1 — Gen-4: `snippet.js`, `info.json`; Gen-2: `media/df_quick_search.js`. Preview bimbobooks на object-locale витрине.
