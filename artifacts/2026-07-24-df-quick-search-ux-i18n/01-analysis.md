# Analysis: df_quick_search UX (#1–2) + multi-language (#3)

**Task-id:** `2026-07-24-df-quick-search-ux-i18n`  
**Product:** `df_quick_search` (~v1.0.9 → v1.0.10 for shippable UX)  
**Date:** 2026-07-24  
**Mode:** operational / simplified pipeline (items 1–2 <1h each; item 3 analysis-only)

---

## 1. Appear animation (products / articles / categories)

### Feasibility
**Straightforward / safe.** Results are injected via `innerHTML` into grids/lists; CSS enter animation on `.df-quick-search__product`, `__article-item`, `__category-item` is enough.

### Approach
- CSS only: `opacity` + short `translateY` (~6px), ~280ms ease.
- Light stagger via `nth-child` delays for first ~8–12 items (optional, keep ≤80ms steps).
- `@media (prefers-reduced-motion: reduce)` → `animation: none`.
- No JS timeline; works for full render and load-more append (new nodes animate once).

### Risks
- Low: load-more may re-animate only new nodes (desired). Full re-render on sort re-animates grid (acceptable).
- Avoid animating layout/height (perf).

### Verdict
**Ship in v1.0.10.**

---

## 2. Desktop hover → second product image

### API / data (verified)
- Enrich already keeps `images: full.images || product.images` from `/products_by_id/{ids}.json`.
- Live check on bimbobooks.ru (`490534319`): `images.length` = 10; `images[0]` ≈ `first_image`; `images[1]` = distinct second photo (`large_url` present).
- Suggestions alone often lack full `images[]` — second image appears **after enrich** (same path as primary photo today).

### Approach
- Add `pickProductSecondImage(product)`: first URL with a **different** URL than primary among `images[]` (prefer index ≥1; skip duplicates of `first_image`).
- Card markup: primary `<img>` + optional `.df-quick-search__product-image--hover` absolutely stacked.
- CSS crossfade under `@media (hover: hover) and (pointer: fine)` only.
- No second image → no hover class / single img (graceful).
- Mobile / coarse pointer: second img may still preload but never shown via hover rule → no flash.
- Skeleton settle binds only primary img (ignore `--hover`).

### Risks
- Extra image download on desktop for cards with ≥2 photos (acceptable for search UX).
- If enrich fails, no second image (same as missing primary today).

### Verdict
**Ship in v1.0.10.**

---

## 3. Multi-language (`?lang=en` / `?lang=ru`) — investigation

### How language switch works (bimbobooks.ru)
- Links `?lang=en` / `?lang=ru` → **full page navigation** (not SPA).
- `meta[name=shop-config]` gets `"locale":"en"` / ru; `meta[name=default-locale]` matches.
- `body[data-multi-lang=true]`; currency is a **separate** form (`site_currency_code` submit) — not the same as language.
- Theme search placeholder becomes `"Search"` on EN (theme Liquid), while our widget chrome is independent.

### What the widget already does well
| Layer | Behavior |
|-------|----------|
| Search API | Passes `locale` into `/search_suggestions` (suggestions titles follow locale on bimbobooks) |
| Articles index | Liquid cache key includes `language.locale`; form has `name="lang" value="{{ language.locale }}"` |
| Category titles | Liquid collections JSON — follow **page** locale at SSR; OK after reload |
| Re-init on lang change | **Not needed** — page reload re-renders Liquid + reloads JS |

### Critical gaps (corrected after live probe — see `02-fix-locale.md`)
1. **`/products_by_id` ignores locale unless `?lang=`** — without it returns shop-default (RU) titles. Param `locale` does **not** work. Enrich used `title: full.title || product.title` → **overwrote EN suggestion titles with RU**.
2. **Currency:** suggestions `price_min` stay in base RUR; after USD cookie, `products_by_id` returns converted prices, but merge preferred suggestion price → widget showed RUR amounts + hardcoded `₽` in `formatPrice`.
3. **UI chrome hardcoded RU in JS** — section titles, tabs, empty/error, sort, load more, OOS badge, layout-hint, chips.
4. **Liquid chrome hardcoded RU** — panel title «Поиск», aria close.
5. **Admin `placeholder` / `popular_queries`** — single string; merchant picks one language.
6. **`localeCompare(..., 'ru')`** for category sort — minor for EN.

### Options compared

| Option | Pros | Cons | Fit |
|--------|------|------|-----|
| A. Dual RU/EN dict in JS + detect locale | Fast, no admin UX change; covers chrome | Only 2 langs; placeholder still admin | **Recommended v1.1** |
| B. Liquid locale-aware strings into `data-*` | SSR correct; works before JS | Duplicates strings; gen-2/4 liquid touch | Good companion to A for panel chrome |
| C. Full i18n (many locales + admin translations) | Complete | Heavy settings surface | Overkill now |
| D. Re-init on language click / pageshow | Useful for SPA themes | bimbobooks already full reload | Not required for typical inSales |

### Recommended approach (#3)
**Shipped in v1.1.0** (see `02-fix-locale.md`). Spec executed:

1. **Detect locale** (priority): `Shop.config.locale` → `Site.language.locale` → `html[lang]` / `meta[name=default-locale]` → `URLSearchParams(lang)` → `data-ui-locale` → `'ru'`.
2. **JS dictionaries** `STRINGS.ru` / `STRINGS.en` + `t(key)`.
3. **Liquid:** panel title / close aria + default EN placeholder + `data-ui-locale`.
4. **API:** `products_by_id?lang=`; force suggestions `locale`; enrich prefers suggestion title + enrich price.
5. **Prices:** `money_with_currency_format` object from Shop.config; prefer enrich prices (currency cookie).
6. **Do not** rely on click listeners for `?lang=` — reload is the contract.

### Out of scope for v1.0.10 / shipped in v1.1.0
v1.0.10 deferred dictionaries + money; **v1.1.0 implements them**.

---

## Implementation plan (this turn)

| # | Item | Action |
|---|------|--------|
| 1 | Appear animation | Implement CSS (+ reduced-motion) gen-4 + gen-2 |
| 2 | Hover second image | Implement JS+CSS; tests for second-image helper |
| 3 | i18n | Analysis + recommendation only (this doc) |
| — | Version | Bump **v1.0.10**; CHANGELOG; sync gen-2 |

### Re-upload (expected after implement)
- **Gen-4:** `snippet.js`, `snippet.scss`, `info.json` (+ gen2/gen4 manifests if used)
- **Gen-2:** `media/df_quick_search.js`, `media/df_quick_search.css` (from scss), liquid only if critical chrome unchanged (likely **no liquid change** for #1–2)
