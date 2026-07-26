# Быстрый поиск DanForge — функционал и преимущества

**Handle:** `danforge_quick_search` · **Версия:** v1.1.3  
**Платформа:** inSales (generation 2 и 4) · **Автор:** [DanForge](https://danforge.ru)  
**Статус:** stable / production-ready

---

## Функционал

### Поиск

- Live-поиск с debounce 300 ms — запрос после паузы в вводе (минимум 2 символа)
- Гибридная выдача: `/search_suggestions` (как AjaxSearch) + дополнение из `/search.json`, если suggestions < `results_limit`
- Совместимость с AjaxSearch: `AjaxSearch.path` и `AjaxSearch.data` (account_id, locale, hide_items_out_of_stock, fields[])
- Поиск по **названию** и **артикулу (SKU)** всех вариантов
- Строгая фильтрация без fallback на нерелевантные результаты API
- Обогащение через `/products_by_id/{ids}.json` — фото, категории, variants, old price, popularity (chunk по 40)
- Скрытие скрытых/архивных товаров; доп. OOS-фильтр при настройке витрины
- In-memory кэш 60 с; сброс при закрытии панели
- Race protection: `searchSeq` + `AbortController`
- Enter / «Все результаты (N)» → `/search?q=…` (`show_all_results`)
- **Layout fix RU↔EN** (всегда on): пустая выдача → retry в другой раскладке; баннер при успехе; analytics `df_qs_layout_fix`
- Недавние запросы: до 5 в sessionStorage, **только при hits** (товары/статьи); после layout-fix — исправленный запрос
- Популярные запросы: CSV в админке, до 12 чипов рядом с recent

### UI / UX

- Полноэкранная панель + тёмный оверлей; CSS-триггеры с capture + `stopImmediatePropagation`
- Закрытие: оверлей, ×, Escape
- Spinner overlay — предыдущие результаты под затемнением
- Skeleton / placeholder на фото; body scroll lock (iOS-safe)
- Подсветка запроса `<mark>` в заголовках
- Appear-анимация карточек товаров / статей / категорий (CSS; уважает reduced-motion)
- Desktop hover: второе фото товара (если есть в `images[]` после enrich; настройка `hover_second_image`)
- Zero-results: ссылка на `/search`; категории-подсказки; текст «Ничего не найдено…» **скрыт**, если есть категории
- «Показать ещё» — «N из M», incremental append, preserve scroll
- Padding перед scrollbar на desktop scroll-колонках

### Товары

- Фото, название, цена, зачёркнутая старая цена
- Цены выровнены по нижнему краю карточки в ряду (разные высоты названий)
- Бейдж «Нет в наличии» overlay (`show_out_of_stock_badge`)
- Сортировка: по умолчанию / цена ↑↓ / популярность (`show_product_sort`) — по загруженному буферу
- `hide_zero_price`, `results_limit` 1–200
- Форматы фото: square, portrait, portrait-34, landscape, natural
- Сетка 2–6 колонок на mobile / tablet / desktop (auto-fill)

### Категории

- Из товаров + title-match по Liquid JSON коллекций
- Коллизии названий → `Родитель · Категория` (или slug)
- Desktop: scrollable sidebar; mobile: rail
- При empty с категориями — категории считаются «результатом» (без empty-message)

### Статьи блога

- Опционально (`show_articles`, default OFF)
- Полный Liquid-индекс `blogs[handle].articles[i]` по `articles.size`
- Фильтр: title, tags, related products
- Несколько блогов; load more; «Все статьи →»
- Lazy parse + localStorage 24 ч + Liquid `{% cache %}` по size + locale

### Layout B

- **Desktop (≥768px):** sidebar (~240px: категории + статьи) + main товары; независимый scroll
- Категории sidebar: свой overflow; со статьями — adaptive heights (не 50/50)
- **Mobile:** sticky tabs «Товары» | «Статьи»; категории в rail
- Adaptive sidebar articles по высоте экрана

### A11y / Analytics / Performance

- Dialog, focus trap, aria-live, keyboard tabs
- dataLayer: search, product click, zero results, category click, layout fix
- Search cache, chunked enrich, incremental DOM, lazy articles

### Настройки админки

- **21 настройка** в группе «Основные» — полная таблица в README.md
- Вкл/выкл: фото, цены, категории, статьи, бейдж, сортировка, «Все результаты»

### Совместимость

- Gen 2 / Gen 4 манифесты; jQuery + fetch; Shop.config fallback; z-index 2147483646

---

## Преимущества (плюсы)

### По сравнению со штатным поиском inSales

| | Штатный AjaxSearch | DanForge Quick Search |
|---|---|---|
| UI | Dropdown под полем | Полноэкранная панель, Layout B |
| Фото / цены | Минимально | Крупные фото, 5 форматов, old price, stock badge |
| Категории / статьи | Нет | Sidebar / rail + опциональный блог |
| SKU | Зависит от темы | Явный поиск по SKU |
| Раскладка | Нет | RU↔EN auto-retry |
| Сортировка в панели | Нет | Цена / популярность |
| Recent / popular | Нет | Chips |
| Load more | Нет | «N из M» |
| A11y / analytics | Базовая | Focus trap, aria-live, dataLayer |

### По сравнению с кастомным поиском в шапке

- Без правок темы — виджет отдельно; настройки в админке
- Проверен на armedf.ru (кириллица, HTTP 555, account_id, triggers)
- Гибрид suggestions + search.json; enrich products_by_id
- Тесты: settings / fetch / categories

### По сравнению с виджетами конкурентов

- Единый split-layout: товары + категории + статьи
- Полный индекс статей + серверный/клиентский cache
- Честная фильтрация; открытый CHANGELOG

---

## Для кого

### E-commerce

Большой каталог: фото, цена, наличие, категории, SKU для B2B.

### Content + commerce (armedf.ru и аналоги)

Товары + статьи в одной панели; «Все статьи →» для 500+ постов.

### B2B / SKU

Поиск по артикулу; `hide_zero_price` для «запросите цену».

---

## Настройки (кратко для администратора)

| Настройка | Что делает |
|-----------|------------|
| `enabled` | Вкл/выкл виджет |
| `placeholder` | Текст в поле |
| `popular_queries` | CSV популярных запросов |
| `trigger_selectors` | CSS-селекторы открытия |
| `show_photos` | Фото |
| `show_out_of_stock_badge` | Бейдж «Нет в наличии» |
| `show_prices` | Цены |
| `show_product_sort` | Сортировка в выдаче |
| `show_all_results` | Ссылка «Все результаты» |
| `show_categories` | Категории |
| `show_articles` | Статьи (server reload) |
| `articles_lazy_load` | Отложенный parse + localStorage |
| `article_blog_handles` | Handles блогов |
| `articles_display_limit` | Порция статей |
| `articles_blog_url` | «Все статьи →» |
| `hide_zero_price` | Скрыть цену 0 |
| `results_limit` | Порция товаров |
| `image_ratio` | Формат фото |
| `cols_mobile/tablet/desktop` | Колонки сетки |

Defaults и типы — в README.md / `settings_form.json`.

---

## Совместимость и ограничения

### Generation 2 / 4

- **Gen 4:** `info.gen4.json` — есть `header`, `outside`; стили — platform SCSS + inline critical overlay/panel
- **Gen 2 (theme-snippet):** primary — `widget-gen2/`; заливать **liquid + CSS вместе**. Inline critical: overlay/panel **и** chrome (× / input / chips) — без CSS-asset панель не «голая»
- **Gen 2 (SimpleWidget, запасной):** `info.gen2.json` — без `header` / `outside`; переименовать в `info.json`

### armedf.ru

- Триггеры по умолчанию под шапку темы
- `/search.json` **без `per_page`**
- `account_id` через Shop.config / meta
- Кириллица через `/search_suggestions`
- Layout fix для опечаток раскладки

### Известные ограничения (честно)

| Ограничение | Детали |
|-------------|--------|
| Статьи: вес HTML | JSON индекса в каждой странице при `show_articles` |
| Статьи: cache key | По `articles.size`; правки title без смены size могут кешироваться |
| Статьи: нет API | Только Liquid |
| Client-side pagination / sort | По уже загруженному списку |
| Suggestions ~10–12 | Supplement из `/search.json` |
| Layout-suggest empty UI | Временно отключён (retry + баннер успеха работают) |
| Server reload | `enabled`, `show_articles` |

---

## Лицензия

Коммерческая. Один магазин — одна лицензия.

**DanForge** · https://danforge.ru
