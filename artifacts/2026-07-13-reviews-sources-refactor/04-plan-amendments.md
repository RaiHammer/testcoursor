# Amendments к 04-plan.md (post-review + owner decisions)

**Дата:** 2026-07-13

## Owner decisions (см. 00-owner-decisions.md)

- Вкладка «Все» **снята** → задача 4: только `switchSourceTab('insales'|'yandex')`, без `mergeAllSourcesByDate`
- Любая страница → spike + `insales-ajax-url` (default `/product/shop-reviews`)
- Phase 1 hotfix пропущен

## Закрытие замечаний Plan Reviewer (NEEDS_REVISION)

| # | Замечание | Решение |
|---|-----------|---------|
| 1 | `lazy_yandex` scope | **Phase 3** — amend `02-spec.md` §6.1; не блокирует Phase 2 |
| 2 | Checklist задача 7 | Добавить строки: `insales-prefetch-limit`, `insales-ajax-url`, dual-source tabs, `danforge_reviews_yandex.liquid` |
| 3 | NFR-1 FCP | Lighthouse smoke в DoD задачи 7 (не блокер MVP) |
| 4 | AJAX + tab «Все» | **N/A** — вкладки «Все» нет; тест: AJAX на вкладке InSales |

**Статус gate:** условный **APPROVED для Phase 2** с amendments; повторный formal gate опционален.

## Programmer

Старт с owner overrides: [Implement Phase 2](0b54b469-3ef3-484f-8d32-c9aa0de8cab4).
