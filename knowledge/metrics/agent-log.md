# Лог эффективности ИИ-команды

> Jarvis добавляет строку после закрытия задачи с review gates или ретро.

## Формат строки

| Дата | task-id | Тип | Gates | Bugfix итерации | Ретро | Итог |
|------|---------|-----|-------|-----------------|-------|------|

**Тип:** виджет | seo | packaging | retro | strategy  
**Gates:** все APPROVED | частично | skip (owner)  
**Итог:** shipped | blocked | cancelled

---

## Записи

| Дата | task-id | Тип | Gates | Bugfix итерации | Ретро | Итог |
|------|---------|-----|-------|-----------------|-------|------|
| 2026-07-09 | 2026-07-09-reviews-slider | виджет | skip | 5+ | 2026-07-10 | shipped (болезненно) |
| 2026-07-23 | 2026-07-23-df-quick-search-gen2 | виджет | plan+code APPROVED | 0 | — | shipped |
| 2026-07-24 | 2026-07-24-df-quick-search-packaging-pages | packaging | n/a | 0 | — | live (цены pending) |
| 2026-07-27 | 2026-07-27-ai-team-audit | retro | n/a | — | audit | process upgrade |

## KPI gates (цель Q3 2026)

| Метрика | Текущее | Цель |
|---------|---------|------|
| % виджетов с plan+code APPROVED | ~50% | 100% |
| Средние bugfix-итерации на виджет | 3+ (reviews) | ≤1 |
| Задачи с spec-review | 0% | 100% для >4 ч |
