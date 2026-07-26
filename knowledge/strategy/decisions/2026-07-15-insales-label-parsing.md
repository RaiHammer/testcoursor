# ADR: Парсинг label/value в настройках inSales gen-4

**Дата:** 2026-07-15  
**Статус:** принято  
**Контекст:** ретро багфикса `df_reviews_slider` 14–15.07; рецидив проблемы select/label после owner rename («Режим фокуса», «Мансори»).

## Проблема

InSales gen-4 в части магазинов **сохраняет и отдаёт в Liquid/JS текст опции (label)**, а не машинный ключ (value):

| Поле | Ожидаем value | Может прийти |
|------|---------------|--------------|
| `display_mode` | `masonry` | `Мансори`, `Masonry` |
| `display_mode` | `spotlight` | `Режим фокуса` |
| `title-align` | `left` | `Слева` |
| `min_rating` | `4` | `4+`, `4 звезды и выше` |

Дополнительно: порядок в `settings_form.json` для `select` — **`[label, value]`**, не `[value, label]`. Неверный порядок ломает UI (видны английские ключи).

## Решение (обязательный паттерн для всех виджетов)

### 1. settings_form.json

```json
"options": [
  ["Мансори", "masonry"],
  ["Режим фокуса", "spotlight"]
]
```

- Порядок: **`[человекочитаемый label, value]`**
- Value — ASCII-ключ без пробелов; label — любой язык
- После смены label — см. п. 4

### 2. Liquid — `contains`, не строгое `==`

```liquid
{% assign _raw = widget_settings.display_mode | append: '' | strip | downcase %}
{% if _raw == 'masonry' or _raw contains 'masonry' or _raw contains 'мансори' %}
  {% assign layout = 'masonry' %}
{% endif %}
```

- Покрывать: EN key, EN label, RU label, **owner-specific aliases**
- Не использовать `name: layout` — конфликт с платформой (ADR 2026-07-11)

### 3. JavaScript — зеркальный `parse*` парсер

- Функция на каждый select-тип: `parseLayout`, `parseTitleAlign`, `parseMinRating`
- Алгоритм: exact match value → substring aliases (EN + RU) → safe default
- `syncSettingsFromLayout()` читает CSS vars с `.layout` (live preview редактора)

### 4. Owner rename protocol

При изменении `label` в форме (владелец или команда):

1. Добавить alias в Liquid `contains` и JS `parse*`
2. Добавить case в unit-тест (`settings-sync.test.js` / `layouts.test.js`)
3. Прогнать `settings-form.test.js` (порядок options)
4. Smoke в inSales editor: поле → `data-*` / класс в HTML

### 5. Автотесты (Definition of Done)

| Файл | Проверка |
|------|----------|
| `settings-form.test.js` | `[label, value]` для каждого select |
| `settings-sync.test.js` | parse* на EN keys + RU labels |
| `layouts.test.js` | layout class из parsed value |

## Запреты

- Строгое сравнение `== 'grid'` без fallback на label
- `[value, label]` в options без явного ADR-исключения
- Переименование label без обновления парсеров и тестов
- Полагаться только на `data-*` без учёта CSS vars на `.layout` в редакторе

## Последствия

+ Один рецидив label-парсинга на виджет вместо N итераций  
+ Owner может локализовать UI без поломки логики — при соблюдении протокола  
− +10–15 мин на каждый select при первичной разработке  
− Дублирование alias-списков Liquid + JS (осознанный trade-off)

## Связанные файлы

- `knowledge/platforms/insales-widgets.md` — раздел «Select и button-group»
- `knowledge/strategy/decisions/2026-07-10-quality-process.md`
- `artifacts/2026-07-11-df-reviews-slider-settings-analysis.md`
- `artifacts/2026-07-15-reviews-bugfix-retro/01-retrospective.md`
- `projects/df_reviews_slider/widget/tests/settings-form.test.js`
