# Fix note: df_quick_search v1.1.0 — locale + currency

**Task-id:** `2026-07-24-df-quick-search-ux-i18n`  
**Date:** 2026-07-24  
**Version:** v1.1.0

## Root cause

### Why categories were English but product titles Russian
| Source | Locale behavior |
|--------|-----------------|
| Categories (Liquid collections JSON) | SSR with page `language.locale` after `?lang=en` reload → EN ✓ |
| Articles index | Liquid cache key includes `language.locale` → EN ✓ |
| `/search_suggestions?locale=en` | Returns EN titles ✓ (verified on bimbobooks account `5760494`) |
| `/products_by_id/{ids}.json` **without** `lang` | Returns **RU** (shop default) ✗ |
| `/products_by_id/{ids}.json?lang=en` | Returns EN titles ✓ |
| `/products_by_id/?locale=en` | **Ignored** — still RU |
| Enrich merge | `title: full.title \|\| product.title` overwrote EN suggestion titles with RU enrich ✗ |

Earlier analysis claiming “product titles already respect locale / API locale ok” was **wrong for the enrich path**.

### Why prices stayed ₽ with site on USD
| Source | Currency behavior |
|--------|-------------------|
| Theme after `/site_currencies/update_current` (USD) | `Shop.config.currency_code=USD`, `money_with_currency_format.unit=$`, format `%u%n` |
| `/products_by_id` with USD session cookie | Prices converted (`227` → `2.9056` ≈ `$2.91`) ✓ |
| `/search_suggestions` `fields.price_min` | Stays in **base RUR** even after USD cookie ✗ |
| Enrich merge | Preferred suggestion `price_min` when > 0 → kept RUR amounts ✗ |
| `formatPrice` | Hardcoded `toLocaleString('ru-RU') + ' ₽'` ✗ |

## Fix (v1.1.0)

1. Pass `lang` (not `locale`) to `/products_by_id`.
2. Always force `locale` into suggestions base data (also when copying `AjaxSearch.data`).
3. Enrich: `title: product.title || full.title`; `price_min` from enrich first.
4. Search cache key includes locale + currency code.
5. `formatPrice` uses `money_with_currency_format` object (`%n`/`%u`, unit, delimiter, separator).
6. JS RU/EN chrome dictionaries + `t()`; Liquid panel/aria/default placeholder + `data-ui-locale`.

## Residual limits

- Admin `placeholder` / `popular_queries`: single string (merchant chooses language).
- Unknown UI locale → RU strings.
- Currency change without page reload: Shop.config on page may be stale until reload (typical inSales theme submits form → reload).
- If a shop’s API ignores `lang` on `products_by_id`, titles may stay default-locale; document honestly — bimbobooks verifies `lang` works.
- Suggestions prices ignored after enrich; if enrich fails, fallback suggestion prices may still be base currency.

## Re-upload

**Gen-4:** `snippet.js`, `snippet.liquid`, `info.json`  
**Gen-2:** `media/df_quick_search.js`, `snippets/df_quick_search.liquid`

## Tests

`node widget/tests/*.test.js` — all green including new `locale.test.js`.

## Correction to 01-analysis.md §3

Claims that search API already passed locale correctly for product titles, and that products_by_id was only an edge case, are superseded by this note.
