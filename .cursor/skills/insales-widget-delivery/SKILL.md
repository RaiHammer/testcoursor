---
name: insales-widget-delivery
description: Definition of Done for inSales widget delivery — tests, checklist, dist zip, HTML proof. Use when Programmer finishes widget work, Jarvis closes widget task, or before Kwork/danforge publish.
---

# inSales Widget Delivery

Финальная поставка виджета. Jarvis закрывает задачу только после всех пунктов.

## Definition of Done

### 1. Код и KB

- [ ] `knowledge/platforms/insales-widgets.md` учтён
- [ ] Модель `hide_*` для чекбоксов (не `show_*` default-on)
- [ ] Liquid: hyphen-ключи первыми; checkbox `== '1'`
- [ ] GUI/INSTRUCTION синхронизированы с pipeline виджета (если есть CLI)

### 2. Тесты

```bash
# из корня репо
./scripts/test-widgets.sh
```

Или вручную в `projects/{name}/widget/tests/`:
- [ ] `node settings.test.js` — pass
- [ ] `settings-form.test.js` — pass (каждый select)
- [ ] `node --check ../snippet.js` — без syntax error
- [ ] e2e/playwright — по плану (если есть)

### 3. Матрица настроек

Каждый checkbox/range/select проверен **ON и OFF** в превью редактора inSales.
Зафиксировать в `04-plan.md` § тест-план или отдельной таблице.

### 4. HTML-проба

Скрин или paste HTML с `data-*` с live-магазина или превью.
Сохранить в `artifacts/{task-id}/` или `projects/{name}/gtm/screenshots/`.

### 5. Чеклист

Заполнить `templates/insales-widget-checklist.md` → сохранить копию в артефакте.

### 6. Пакет

- [ ] `dist/*.zip` пересобран с актуальной версией
- [ ] CHANGELOG / README версия совпадает
- [ ] Git commit в `projects/{name}/` (snapshot)

### 7. Gates

- [ ] `reviews/plan-review.md` — APPROVED
- [ ] `reviews/code-review.md` — APPROVED

## Порядок закрытия (Jarvis)

1. Code Reviewer APPROVED
2. Прогнать тесты
3. Чеклист + HTML-проба
4. dist zip (если в scope)
5. Обновить `knowledge/danforge/products/{product}.md`
6. Запись в `knowledge/metrics/agent-log.md`
