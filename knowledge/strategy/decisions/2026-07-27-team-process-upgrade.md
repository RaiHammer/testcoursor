# ADR: Усиление процесса ИИ-команды

**Дата:** 2026-07-27  
**Статус:** принято  
**Контекст:** аудит команды `artifacts/2026-07-27-ai-team-audit/01-full-analysis.md`

## Решение

1. **Gates = блокеры** — Jarvis не handoff без APPROVED в `reviews/` (skip только явной фразой владельца)
2. **5 новых skills:** pipeline-handoff, owner-edit-protocol, insales-widget-delivery, bugfix-stop-rule, tilda-live-check
3. **Owner playbook** — `knowledge/owner-playbook.md` + rule `owner-interaction.mdc`
4. **Hooks** — напоминания после analyst, planner, programmer
5. **CI локально** — `scripts/test-widgets.sh`
6. **Метрики** — `knowledge/metrics/agent-log.md`
7. **Spec Reviewer** обязателен для задач >4 ч

## Последствия

+ Меньше багфикс-циклов как у reviews 10.07  
+ Владелец понимает границы запросов  
+ Измеримость gates  
− +15–30 мин на формальности (окупается)

## Связанные файлы

- `knowledge/owner-playbook.md`
- `.cursor/rules/owner-interaction.mdc`
- `.cursor/skills/*/SKILL.md` (5 новых)
