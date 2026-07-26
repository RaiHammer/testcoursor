---
name: retrospective
description: Проводит ретроспективу за период, анализирует действия и результаты, формирует новый roadmap. Use when user asks for retrospective, quarterly review, "what worked", "plan for next period", or updating roadmap based on past work.
disable-model-invocation: true
---

# Retrospective

## Когда применять

- «Ретроспектива за...»
- «Что сработало за Q1»
- «Составь план на следующий квартал»
- «Обнови roadmap»

## Workflow

1. **Сбор данных**
   - `artifacts/` — завершённые задачи
   - `knowledge/metrics/monthly-log.md` — цифры
   - `knowledge/metrics/kpi-targets.md` — цели vs факт
   - `knowledge/strategy/roadmap.md` — что планировали

2. **Аналитик** — отчёт: действия → результаты → выводы

3. **Планировщик** — новый roadmap на период (шаблон `templates/roadmap-template.md`)

4. **Plan Reviewer** — проверка полноты плана

5. **Jarvis** — итог владельцу с приоритетами

## Артефакты

- `artifacts/retrospectives/YYYY-MM-retro.md` — шаблон `templates/retrospective-template.md`
- Обновить `knowledge/strategy/roadmap.md`
- Добавить запись в `knowledge/metrics/monthly-log.md`

## Если данных мало

Честно укажи пробелы. Попроси владельца заполнить метрики (заявки, доход, клиенты).

## Рекомендации по периоду

- Ежемесячно: краткий обзор метрик
- Раз в 1–2 месяца: полная ретроспектива + новый roadmap
