---
name: owner-edit-protocol
description: Protocol when the owner edits inSales widget settings or code in admin. Use when owner changed widget in admin, renamed labels, or before Programmer touches widget files after owner edits.
---

# Owner Edit Protocol

## Когда применять

- Владелец менял виджет в админке inSales (настройки, labels, defaults)
- Владелец залил файлы темы вручную
- Programmer возвращается к `projects/*/widget/*` после паузы

## Протокол для владельца

1. **Не менять** `settings_form.json` labels без уведомления команды
2. После правок в админке — написать Jarvis:
   ```
   @jarvis Owner edit: {магазин}, {что изменил}
   ```
3. Приложить скрин или HTML-фрагмент с `data-*` (если баг)

## Протокол для Jarvis

1. **Стоп** Programmer на `widget/*` до артефакта
2. Создать/обновить `artifacts/{task-id}/01-owner-changes.md`:

```markdown
# Owner changes

**Дата:** YYYY-MM-DD
**Магазин:** …
**Файлы / настройки:** …

## Что изменил владелец
- …

## Что НЕ трогать (team fixes)
- …

## Влияние на тесты
- parseLayout / Liquid contains / settings-form.test.js
```

3. Analyst сверяет diff repo vs owner changes
4. Только после этого — Programmer

## Обязательные проверки после owner rename

- [ ] `settings_form.json` — порядок select `[label, value]`
- [ ] Liquid `contains` для RU labels
- [ ] JS `parseLayout` / парсеры для новых labels
- [ ] `settings-form.test.js` обновлён
- [ ] Smoke всех макетов в редакторе inSales

## ADR

`knowledge/strategy/decisions/2026-07-15-insales-label-parsing.md`
