# План реализации: адаптив grid/masonry + scroll fix

**Статус:** APPROVED (выполнено программистом)

## 1. Настройки

### settings_form.json — группа «Masonry, сетка и лента»

| name | label | default | min | max |
|------|-------|---------|-----|-----|
| `layout-columns` | Количество колонок (десктоп) | 3 | 1 | 4 |
| `layout-columns-tablet` | Колонки на планшете | 2 | 1 | 4 |
| `layout-columns-mobile` | Колонки на телефоне | 1 | 1 | 2 |
| `page-size` | Отзывов на странице (десктоп) | 12 | 3 | 50 |
| `page-size-mobile` | Отзывов на странице (мобильный) | 6 | 2 | 20 |

### settings_data.json

Добавить дефолты для трёх новых ключей.

## 2. Liquid

- `data-df-columns-tablet`, `data-df-columns-mobile`, `data-df-page-size-mobile` на shell
- `data-columns-tablet`, `data-columns-mobile`, `data-page-size-mobile` на viewport

## 3. JavaScript

- `getViewportBreakpoint()` — mobile/tablet/desktop
- `getLayoutColumnsForBreakpoint()` / `getEffectiveColumns()`
- `getPageSize()` — mobile page-size для pagination-режимов
- `applyEffectiveColumnClasses()` — классы `df-reviews--cols-N` по viewport
- `syncResponsiveColumnSettings()` — sync из data-* и CSS vars редактора
- `bindResponsiveLayoutResize()` — repaginate при смене breakpoint
- **Scroll fix:** `loadMoreReviews` default `scroll: false`; `preserveScroll` в `mountPaginationSlides`; save/restore `scrollY`

## 4. SCSS

Удалить hardcoded override колонок в media queries 991/639 — колонки управляет JS.

## 5. Тесты

- `settings-sync.test.js` — новые ключи settingVarNames
- `pagination.test.js` — breakpoint + effective page size logic

## 6. Проверка

```bash
node widget/tests/settings.test.js
node widget/tests/settings-sync.test.js
node widget/tests/pagination.test.js
node widget/tests/layouts.test.js
node widget/tests/settings-matrix.test.js
```

Ручная проверка в превью inSales: Masonry/Grid на desktop/tablet/mobile; «Показать ещё» без прыжка скролла.
