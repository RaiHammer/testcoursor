---
name: pipeline-handoff
description: Handoff checklist between AI team pipeline stages. Use when Jarvis transitions between Analyst, Spec Reviewer, Architect, Planner, Programmer, or Code Reviewer, or when validating artifacts before the next stage.
---

# Pipeline Handoff

Jarvis проверяет handoff **перед** запуском следующего subagent.

## Обязательные файлы по этапу

| От → К | Файл-вход | Файл-выход | Gate-файл |
|--------|-----------|------------|-----------|
| Start → Analyst | запрос владельца | `01-analysis.md` | — |
| Analyst → Spec Reviewer | `01-analysis.md` | `02-spec.md` | `reviews/spec-review.md` APPROVED |
| Spec → Architect | `02-spec.md` APPROVED | `03-architecture.md` | `reviews/arch-review.md` APPROVED |
| Architect → Planner | `03-architecture.md` APPROVED | `04-plan.md` | — |
| Planner → Plan Reviewer | `04-plan.md` | — | `reviews/plan-review.md` APPROVED |
| Plan → Programmer | `04-plan.md` APPROVED | код в `projects/` | — |
| Programmer → Code Reviewer | diff + план | — | `reviews/code-review.md` APPROVED |
| Code → Jarvis | APPROVED | чеклист / dist | — |

## Упрощённые маршруты

### inSales-виджет (обязательный)

```
Analyst (01-analysis + матрица настроек)
  → Planner (04-plan + тест-план ON/OFF)
  → Plan Reviewer APPROVED
  → Programmer
  → Code Reviewer APPROVED
  → Jarvis (insales-widget-checklist + HTML-проба)
```

Spec/Architect — если задача > 8 ч или новая архитектура (gen-переход, CLI+widget).

### Код < 1 ч

```
Analyst (краткий) → Planner → Programmer → Code Reviewer
```

### Tilda / SEO

```
Analyst → SEO и/или Designer → артефакт с инструкциями (без Programmer)
```

## Чеклист Jarvis перед handoff

```
- [ ] task-id: artifacts/YYYY-MM-DD-slug/
- [ ] Предыдущий артефакт существует и полон
- [ ] Review gate APPROVED (если требуется этапом)
- [ ] Нет открытого owner-diff без артефакта 01-owner-changes.md
- [ ] Не запущены 2 Programmer на один projects/* путь
```

## Блокеры (не передавать дальше)

- `NEEDS_REVISION` без повторного review
- Нет `02-spec.md` для задач > 4 ч (кроме явного skip владельца)
- Нет тест-плана в `04-plan.md` для кода
- Owner edit в админке без `01-owner-changes.md`

## Skip gates (только владелец)

Владелец пишет явно: **«пропустить gate: {этап}»** — Jarvis фиксирует в `artifacts/{task-id}/00-owner-decisions.md` и продолжает.

Без явной фразы — gates обязательны.
