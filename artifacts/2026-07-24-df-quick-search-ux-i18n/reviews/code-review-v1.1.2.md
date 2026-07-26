# Code review (light) — df_quick_search v1.1.2

**Date:** 2026-07-24  
**Scope:** currency `formatPrice` fix + locale docs  
**Verdict:** APPROVED (light pass, programmer self-check)

## Checks

| Item | Status |
|------|--------|
| Root cause addressed (whole-config as money / skip currency fallback) | ✅ `isPlausibleShopConfigValue` + preset by `detectCurrencyCode` |
| DOM fallback `.header-currency select` | ✅ |
| Amount path unchanged (enrich still preferred) | ✅ |
| `normalizeLocaleString` / locale=[object Object] not regressed | ✅ untouched |
| Gen-2 JS synced from gen-4 snippet.js | ✅ |
| Tests `locale.test.js` USD / incomplete / whole-config | ✅ green with other suites |
| Secrets / scope creep | ✅ none |

## Nits (non-blocking)

1. `Shop.money.format` tried first — good; stale-₽ rejection only for USD/EUR.
2. When currency unknown, default remains `₽` (shop base) — expected.
3. Full formal Code Reviewer gate optional before client upload.
