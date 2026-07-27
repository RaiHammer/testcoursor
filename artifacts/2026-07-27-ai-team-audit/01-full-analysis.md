# Анализ: эффективность ИИ-команды

**Дата:** 2026-07-27  
**Тип:** стратегический аудит  
**Инициатор:** владелец

## Цель

Оценить работу 11 агентов, взаимодействие, gaps; внедрить улучшения.

## Итоговая оценка: 7/10

| Область | Оценка |
|---------|--------|
| Доставка продуктов | 8/10 |
| Процесс gates | 5→7/10 после gen2 |
| Knowledge base | 9/10 |
| Координация | 6/10 |

## Ключевые находки

1. **Reviews MVP** — обход gates → ~60% времени на баги (10.07)
2. **Quick Search gen2** — Plan+Code APPROVED → эталон
3. **Spec Reviewer** — 0 применений до аудита
4. **Owner edits** — ломали parseLayout без протокола (15.07)

## Внедрено 2026-07-27

- Skills: pipeline-handoff, owner-edit-protocol, insales-widget-delivery, bugfix-stop-rule, tilda-live-check
- `knowledge/owner-playbook.md`
- `.cursor/rules/owner-interaction.mdc`
- Hooks: analyst, planner, programmer
- `scripts/test-widgets.sh`
- `knowledge/metrics/agent-log.md`
- ADR: `decisions/2026-07-27-team-process-upgrade.md`

## Рекомендации на будущее (не внедрено)

- Browser MCP для SEO live-check
- GitHub Actions CI (опционально)
- Копирайтер после 5+ тем в content-backlog

## Следующий шаг

Владелец читает `knowledge/owner-playbook.md`. Jarvis ведёт agent-log на каждой задаче.
