---
name: create-spec
description: Генерирует техническое задание из анализа по шаблону spec-template.md. Use when analyst completed 01-analysis.md and spec-reviewer needs to create or finalize 02-spec.md.
disable-model-invocation: true
---

# Create Spec

## Вход

- `artifacts/{task-id}/01-analysis.md` — одобренный анализ
- `templates/spec-template.md` — шаблон

## Workflow

1. Прочитай analysis
2. Заполни `templates/spec-template.md` — все секции обязательны
3. Сохрани как `artifacts/{task-id}/02-spec.md`
4. Передай Spec Reviewer для gate

## Правила

- Каждое требование из analysis → в spec (или явно в out-of-scope)
- Критерии приёмки — проверяемые, не «удобно» / «красиво»
- Приоритеты: must / should / could
- NFR: для виджетов — совместимость inSales; для сайта — Tilda-ограничения

## Критерии приёмки — примеры

**Хорошо:**
- [ ] Виджет фильтрует товары по выбранному цвету
- [ ] Страница услуг содержит H1 с ключевым словом «разработка inSales»

**Плохо:**
- [ ] Всё работает хорошо
- [ ] Клиент доволен

## Связь

Analysis → **create-spec** → Spec Reviewer → Architect
