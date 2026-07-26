---
name: analyze-requirements
description: Чеклист анализа требований для analyst subagent. Use when starting requirement analysis, gathering task context, or preparing 01-analysis.md artifact.
disable-model-invocation: true
---

# Analyze Requirements

## Чеклист перед началом

- [ ] Прочитан `knowledge/danforge/site-profile.md` (если про сайт)
- [ ] Прочитан `knowledge/stack-preferences.md` (если про код)
- [ ] Понятна бизнес-цель (сайт / клиенты / продукты / доход)
- [ ] Определён тип задачи: Tilda / код / SEO / стратегия

## Вопросы аналитику (если неясно)

1. Кто конечный пользователь / клиент?
2. Какой измеримый результат ожидается?
3. Есть ли дедлайн или приоритет?
4. Что точно **не** входит в задачу?
5. Есть ли существующий код / аналог?

## Структура 01-analysis.md

Скопируй и заполни:

```
# Анализ: {название}
**Task ID:** {task-id}
**Дата:** YYYY-MM-DD

## Цель
## Контекст
## Целевая аудитория / Stakeholders
## Функциональные требования (черновик)
## Нефункциональные требования
## Ограничения
## Риски
## Открытые вопросы
## Рекомендации для Spec Reviewer
```

## После анализа

Передай Jarvis → Spec Reviewer для создания/ревью ТЗ.

Skill `create-spec` — для генерации 02-spec.md из analysis.
