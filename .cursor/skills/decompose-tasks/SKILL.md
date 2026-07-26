---
name: decompose-tasks
description: Декомпозирует работу в план с задачами, зависимостями и чеклистами. Use when planner creates 04-plan.md or roadmap from architecture or strategy session.
disable-model-invocation: true
---

# Decompose Tasks

## Шаблон задачи

| # | Задача | Оценка | Зависит от | DoD |
|---|--------|--------|------------|-----|
| 1 | | S/M/L | — | |

## Правила декомпозиции

1. **Атомарность** — одна задача = один deliverable
2. **Проверяемость** — можно сказать done/not done
3. **Зависимости** — явные номера, без циклов
4. **Тест** — каждая кодовая задача → пункт в тест-плане

## Типовые блоки для inSales-виджета

1. Scaffold проекта
2. Liquid-разметка
3. JS-логика
4. Стили
5. Unit-тесты (если применимо)
6. README / инструкция установки
7. Ручная проверка на тестовом магазине

## Типовые блоки для SEO (danforge.ru)

1. Аудит (browser)
2. Список рекомендаций
3. Приоритизация
4. Инструкции для Tilda (Designer)

## Roadmap (стратегия)

Используй `templates/roadmap-template.md`:
- 4 направления: сайт, клиенты, продукты, доход
- KPI таблица
- Не более 5 задач на направление за период

## Output

- Операционный план → `artifacts/{task-id}/04-plan.md`
- Roadmap → `knowledge/strategy/roadmap.md`

После → Plan Reviewer
