# Отчёт: лимиты загрузки отзывов по режимам макета

**Дата:** 2026-07-13  
**Виджет:** `danforge_reviews_slider`  
**Источники:** `settings_form.json`, `settings_data.json`, `snippet.liquid`, `snippet.js`, `cli/get_reviews.py`

---

## Общая модель dual-source

| Источник | Как попадает в DOM | Лимит «на входе» |
|----------|-------------------|------------------|
| **InSales** | Liquid `{% prefetch account.reviews_not_spam %}` на любой странице | `insales-prefetch-limit` (default = `page-size`, 3–50) |
| **Яндекс** | CLI → сниппет `danforge_reviews_yandex.liquid` → `{% include %}` | `yandex_limit` или `sample_count` в CLI (default 20) |
| **Legacy** | Fallback `danforge_reviews_slides.liquid`, если Yandex-сниппет пуст | Зависит от CLI (mixed mode) |

Общее число InSales в магазине: `account.reviews_not_spam_count` → `data-insales-count`.  
Число Яндекс в DOM: считается JS (`ensureYandexCount`) по слайдам `data-source="yandex"`.

---

## Defaults (`settings_data.json`)

| Настройка | Default |
|-----------|---------|
| `page-size` | 12 |
| `page-size-mobile` | 6 |
| `insales-prefetch-limit` | 12 |
| `slider-limit` | 10 |
| `spotlight-limit` | 5 |
| `marquee-limit` | 20 |

CLI (`config.example.json`): `yandex_limit: 0` → fallback на `sample_count: 0` → **все** отфильтрованные Yandex-отзывы попадают в сниппет.

---

## По режимам макета

### Слайдер (`slider`)

| Параметр | Значение |
|----------|----------|
| Настройка лимита | `slider-limit` (default **10**, min 3, max 50) |
| InSales в DOM | Первая порция: `insales-prefetch-limit` (default 12) |
| Яндекс в DOM | Все слайды из CLI-сниппета |
| Видимых карточек | ≤ `slider-limit` — JS `applyModeLimits()` прячет лишние в `[data-df-reviews-pool]` |
| Пагинация JS | Нет |
| «Показать ещё» (masonry) | Нет |
| InSales AJAX load-more | Да, если `reviews_count > prefetch_limit` |
| Mobile vs desktop | `slides-mobile` / `slides-tablet` / `slides-per-view` — сколько карточек в Swiper viewport; лимит слайдов не меняется |
| Вкладки + счётчики | Вкладки без счётчиков; счётчики только в masonry |
| Кнопки «Оставить отзыв» | Под контентом (`df-reviews__actions--inline` внутри `.df-reviews__main`) |

### Spotlight (`spotlight`)

| Параметр | Значение |
|----------|----------|
| Настройка лимита | `spotlight-limit` (default **5**, min 2, max 20) |
| InSales / Яндекс в DOM | Как у слайдера |
| Видимых карточек | ≤ `spotlight-limit` |
| Swiper | 1 крупная карточка (slides-mobile не влияет на spotlight) |
| Пагинация / load-more | Нет / Нет |
| InSales AJAX | Да (кроме list) |
| Кнопки | Под контентом (inline) |

### Бегущая строка (`marquee`)

| Параметр | Значение |
|----------|----------|
| Настройка лимита | `marquee-limit` (default **20**, min 2, max 50) |
| InSales / Яндекс в DOM | Как у слайдера |
| Видимых карточек | ≤ `marquee-limit` |
| Скорость | `marquee-speed` (ПК) / `marquee-speed-mobile` (≤639px) |
| Пагинация / load-more | Нет / Нет |
| InSales AJAX | Да |
| Кнопки | Под контентом (inline) |

### Masonry (`masonry`)

| Параметр | Значение |
|----------|----------|
| Колонки | `layout-columns` / `-tablet` / `-mobile` (1–4 / 1–4 / 1–2) |
| Отзывов на «странице» | `page-size` desktop (default **12**), `page-size-mobile` (default **6**) при ширине ≤639px |
| InSales в DOM | Prefetch `insales-prefetch-limit`; далее AJAX «Загрузить ещё» |
| Яндекс в DOM | Все из CLI-сниппета сразу |
| Пагинация | Да — нумерация страниц + стрелки (`usesPagination`) |
| «Показать ещё» | Да — accumulate mode (`usesLoadMore`, только masonry) |
| InSales AJAX | Да |
| Вкладки | Боковые (`df-reviews__tabs--side`) **со счётчиками** InSales N / Яндекс N |
| Кнопки | Floating sticky-колонка справа |

### Сетка (`grid`)

| Параметр | Значение |
|----------|----------|
| Колонки | Как masonry |
| Отзывов на странице | `page-size` / `page-size-mobile` (mobile breakpoint) |
| InSales / Яндекс | Prefetch + AJAX / CLI полностью |
| Пагинация | Да (только нумерация, **без** «Показать ещё») |
| InSales AJAX | Да |
| Вкладки | Сверху, **без** счётчиков |
| Кнопки | Floating sticky справа |

### Лента (`list`)

| Параметр | Значение |
|----------|----------|
| Отзывов на странице | `page-size` / `page-size-mobile` |
| InSales / Яндекс | Prefetch + AJAX / CLI полностью |
| Пагинация | Да |
| «Показать ещё» | Нет |
| InSales AJAX | **Нет** — кнопка не рендерится (`df_layout != 'list'` в Liquid) |
| Вкладки | Сверху, без счётчиков |
| Кнопки | Inline под контентом |

---

## Prefetch vs AJAX (InSales)

### Prefetch (Liquid, SSR)

- Всегда на первом рендере страницы, не зависит от paginate контекста главной.
- Лимит: `insales-prefetch-limit` (clamp 3–50).
- Offset: `paginate.current_page` × limit (если paginate доступен).

### AJAX load-more

- Кнопка `[data-df-insales-loadmore]` — если `account.reviews_not_spam_count > insales-prefetch-limit`.
- URL: `insales-ajax-url` + `?page=N` (default `/product/shop-reviews`).
- JS `loadInsalesPage()` — fetch HTML, парсит новые `.df-reviews__slide[data-source="insales"]`, append в wrapper.
- Скрыта на вкладке «Яндекс» и в режиме `list`.
- **Не заменяет** JS-пагинацию masonry/grid/list — работает параллельно, расширяя DOM.

---

## Яндекс: лимиты CLI

```python
# get_reviews.py — sample_yandex_reviews()
limit = cfg.yandex_limit or cfg.sample_count or ALL
return sorted_reviews[:limit]
```

- Сортировка: `created_at DESC`, без shuffle.
- Фильтр `min_rating` при генерации.
- Output: `danforge_reviews_yandex.liquid` → upload в тему (`-u`).
- Виджет **не** подгружает Яндекс по AJAX — все слайды уже в include.

---

## JS-функции лимитов

| Функция | Режимы |
|---------|--------|
| `usesPagination()` | masonry, grid, list |
| `usesLoadMore()` | только masonry |
| `usesFloatingActions()` | masonry, grid |
| `shouldShowTabCounts()` | только masonry |
| `applyModeLimits()` | slider, spotlight, marquee |
| `getPageSize()` | mobile → `page-size-mobile` при pagination layouts |

---

## Сводная таблица

| Режим | В DOM InSales (старт) | В DOM Яндекс | Видимо сразу | Load more JS | InSales AJAX | Счётчики вкладок |
|-------|----------------------|--------------|--------------|--------------|--------------|------------------|
| slider | prefetch limit | все CLI | slider-limit | — | да | нет |
| spotlight | prefetch limit | все CLI | spotlight-limit | — | да | нет |
| marquee | prefetch limit | все CLI | marquee-limit | — | да | нет |
| masonry | prefetch limit | все CLI | page-size* | да | да | **да** |
| grid | prefetch limit | все CLI | page-size* | — | да | нет |
| list | prefetch limit | все CLI | page-size* | — | **нет** | нет |

\* На mobile (≤639px) для pagination-режимов: `page-size-mobile`.

---

## Deploy note

После изменения `insales-prefetch-limit` или `display_mode` — пересохранить виджет в редакторе inSales (`enable_server_reload: true`).
