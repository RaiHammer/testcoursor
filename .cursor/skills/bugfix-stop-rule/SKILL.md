---
name: bugfix-stop-rule
description: Stop rule after 2+ bugfix iterations on same task — trigger retro before more code. Use when Jarvis sees repeated bugfix on same feature, or owner reports same bug again.
---

# Bugfix Stop Rule

ADR: `knowledge/strategy/decisions/2026-07-10-quality-process.md`

## Триггер

**Стоп код** и ретро, если на **одной задаче/фиче**:

- 2+ итерации багфикса подряд, или
- тот же симптом вернулся после «исправлено», или
- 3+ subagent-сессии Programmer на одном файле без нового plan

## Действия Jarvis

1. **Не запускать** Programmer дальше
2. Сообщить владельцу: «Сработало стоп-правило, нужно ретро»
3. Analyst → `artifacts/retrospectives/YYYY-MM-DD-{slug}-retro.md` или `artifacts/{task-id}/01-retrospective.md`
4. Обновить KB (`insales-widgets.md`, ADR при новом паттерне)
5. Planner — план фикса с тест-матрицей (если нужен код)
6. Plan Reviewer APPROVED → только потом Programmer

## Исключения (без ретро)

- Опечатка / one-liner с очевидным fix
- Владелец явно пишет: **«hotfix без ретро»** (фиксируется в `00-owner-decisions.md`)
- CI/regression из внешнего изменения (inSales platform update)

## Шаблон ретро

`templates/retrospective-template.md`

## Метрика

После ретро — строка в `knowledge/metrics/agent-log.md`:
`| дата | task-id | bugfix-итерации | ретро | итог |`
