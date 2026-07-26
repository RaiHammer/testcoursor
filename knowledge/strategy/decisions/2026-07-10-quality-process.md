# ADR: Процесс качества для inSales-виджетов

**Дата:** 2026-07-10  
**Статус:** принято  
**Контекст:** ретро `df_reviews_slider`, множественные баги settings_form

## Решение

### 1. Обязательный маршрут (даже «мелкие» виджеты)

```
Analyst (краткий spec + матрица настроек)
  → Plan Reviewer (тест-план: каждая настройка ON/OFF)
  → Programmer (KB insales-widgets + чеклист)
  → Code Reviewer (APPROVED)
  → Jarvis (чеклист insales-widget-checklist.md)
```

Пропуск этапов — только по явному решению владельца.

### 2. Definition of Done для виджета

- `knowledge/platforms/insales-widgets.md` учтён
- `widget/tests/settings.test.js` — pass
- `widget/tests/visibility.html` — PASS
- `templates/insales-widget-checklist.md` заполнен
- HTML-пруф от превью или клиента (скрин `data-*`)

### 3. Запреты

- Default-on чекбоксы show_* без явного `true` в Liquid
- Backward compat старых ключей без ADR миграции
- Переименование `name` в settings_form без заметки в README
- Сдача без проверки всех чекбоксов в редакторе inSales

### 4. Jarvis

После 2+ итераций багфикса на одной задаче — **стоп**, ретро в `artifacts/retrospectives/`, обновление KB, затем код.

## Последствия

+ Меньше итераций с клиентом  
+ Повторное использование паттернов между виджетами  
− +30–60 мин на чеклист и тесты (окупается на первом же баге)

## Связанные файлы

- `knowledge/platforms/insales-widgets.md`
- `templates/insales-widget-checklist.md`
- `artifacts/retrospectives/2026-07-10-df-reviews-slider-retro.md`
