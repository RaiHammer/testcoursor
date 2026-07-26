# DF Reviews Slider — анализ проблем управления настройками inSales

**Дата:** 2026-07-11  
**Виджет:** `danforge_reviews_slider`  
**Симптом:** работают только режимы **slider** и **spotlight**; masonry, grid, list, marquee и часть настроек (title-align, колонки, max-visible, marquee-speed) не влияют на превью.

---

## Краткий вывод

Проблема **не одна**, а цепочка платформенных ограничений inSales gen-4. Настройки «ломаются» на разных уровнях: форма → Liquid → DOM → CSS → JS. Слайдер и spotlight работали, потому что опираются на **Swiper** (глобальная библиотека темы), а статические макеты — только на **нашем SCSS**, который в редакторе может не применяться или перебиваться.

---

## 1. Два канала доставки настроек в редакторе

| Канал | Когда | Где в DOM |
|-------|-------|-----------|
| **Server reload** (`enable_server_reload: true`) | Перерисовка Liquid | `data-*` на `.df-reviews__viewport`, классы на `.df-reviews` |
| **Live preview** (без перезагрузки) | Смена ползунка/селекта | CSS-переменные на **`.layout.widget-type_*`** |

Пользователь правильно заметил: в DevTools много параметров висит на **`.layout`**, а не на `.df-reviews`. Редактор inSales инжектирует стили вида:

```css
--display_mode: grid;
--layout-columns: 3;
--title-align: По центру;
--marquee-speed: 55s;
```

**Следствие:** JS, который читает только `data-layout` / `data-columns` на viewport, **не видит** изменения без server reload.

**Исправление:** `syncSettingsFromLayout()` в `snippet.js` — чтение CSS vars с `.layout` + дублирующие `data-df-*` на `.df-reviews` из Liquid.

**Важно:** observer только на `.layout[style]`, не на `.df-reviews` — иначе бесконечный цикл (JS меняет class/style → observer → JS…). Смена `display_mode` — только через server reload (Liquid), не через JS re-init Swiper.

---

## 2. Select отдаёт label, не value

Поля `display_mode`, `title-align`, `min_rating` в части магазинов сохраняют **текст опции** («Сетка», «По центру»), а не ключ (`grid`, `center`).

| Настройка | Ожидаем | Может прийти |
|-----------|---------|--------------|
| `display_mode` | `masonry` | `Masonry` |
| `title-align` | `left` | `Слева` |
| `min_rating` | `4` | `4+` |

**Следствие:** строгое сравнение `== 'grid'` в Liquid даёт fallback → `slider`.

**Исправление:** парсинг через `contains` в Liquid и JS (`parseLayout`, `parseTitleAlign`).

---

## 3. Зарезервированное имя `layout`

Имя поля `layout` в `settings_form.json` конфликтует с Liquid/inSales → **500 на странице**. Переименовано в `display_mode`.

**Урок:** перед добавлением поля проверять, не является ли имя системным в Liquid/шаблоне.

---

## 4. SCSS виджета vs глобальный Swiper

Слайды генерируются с классом **`swiper-slide`** (нужен для slider/spotlight). Тема подключает Swiper CSS:

```css
.swiper-slide { width: 100%; flex-shrink: 0; }
```

Для masonry/grid/list родитель — `.df-reviews__grid`, не `.swiper-wrapper`. Глобальные стили Swiper всё равно задают слайдам **ширину 100%** → визуально одна колонка, даже если `column-count: 3` на контейнере.

**Исправление (тройная защита):**
1. Inline `style` на wrapper из Liquid (`column-count` / `grid-template-columns`)
2. JS `prepareStaticLayout()` — inline-стили + снятие `swiper-slide` в статических режимах
3. Плоские селекторы в SCSS с `!important`

---

## 5. `column-count: var(--x)` не компилируется

inSales SCSS не поддерживает динамический `column-count` через CSS-переменную. Классы `df-reviews--cols-1..4` с фиксированными значениями — обязательны.

---

## 6. button-group с 6+ опциями → text field

Для `display_mode` изначально использовался `button-group` с 6 макетами → в редакторе превращался в **текстовое поле** с произвольным вводом. Заменён на `select`.

---

## 7. Почему slider/spotlight «всегда работали»

| Режим | Механизм | Зависимость от нашего SCSS |
|-------|----------|----------------------------|
| slider | `new Swiper(root)` | Минимальная |
| spotlight | `new Swiper` + centeredSlides | Минимальная |
| masonry/grid/list | CSS layout на `.df-reviews__grid` | **Полная** |
| marquee | CSS animation + JS clone | Средняя |

Swiper инициализируется из JS и использует библиотеку темы — поэтому эти режимы переживали проблемы со SCSS и CSS vars.

---

## 8. Чеклист для следующих виджетов

1. Каждая настройка: **Liquid класс/data** + **JS fallback** + **CSS с !important** для критичного
2. Select/button-group: парсить **и value, и label** (RU/EN)
3. Не использовать `layout` как `name`
4. В редакторе проверять **и** `.layout` style, **и** `.df-reviews` data-*
5. `enable_server_reload: true` для полей, меняющих структуру HTML
6. `MutationObserver` на `.layout[style]` для live preview
7. Тесты: `settings-sync.test.js`, `layouts.test.js`, smoke `layouts.html`

---

## 9. Что сделано в этом фиксе

| Файл | Изменение |
|------|-----------|
| `snippet.liquid` | `title-align` через contains; inline layout на wrapper; `data-df-*` на shell |
| `snippet.js` | `syncSettingsFromLayout`, `prepareStaticLayout`, observer `.layout`, re-init при смене макета |
| `snippet.scss` | Плоские layout-селекторы с `!important` |
| `settings-sync.test.js` | Тесты парсеров label/value |

---

## Ссылки

- [Виджеты inSales](https://www.insales.ru/collection/vidzhety)
- [settings_form.json](https://www.insales.ru/collection/vidzhety/product/settings_formjson)
- [LiquidHub — основы](https://liquidhub.ru/collection/osnovy)
- Внутренняя база: `knowledge/platforms/insales-widgets.md`
