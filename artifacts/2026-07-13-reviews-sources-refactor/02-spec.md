# ТЗ (черновик): рефакторинг источников отзывов DanForge Reviews Slider

**Версия:** 0.1 (draft)  
**Дата:** 2026-07-13  
**Handle:** `danforge_reviews_slider`  
**Зависимости:** `01-analysis.md`, `test/snippet.liquid`, `knowledge/platforms/insales-widgets.md`

---

## 1. Обзор

Виджет получает отзывы из **двух независимых источников** с единым UI карточки и вкладками фильтрации по источнику.

| Источник | Механизм загрузки | Обновление данных |
|----------|-------------------|-------------------|
| **InSales** | Liquid `{% prefetch account.reviews_not_spam %}` | Автоматически (платформа) |
| **Яндекс** | CLI → snippet `danforge_reviews_yandex.liquid` | Ручной/пакетный запуск CLI |

---

## 2. Функциональные требования

### 2.1 InSales

| ID | Требование |
|----|------------|
| FR-I1 | Отзывы загружаются через `account.reviews_not_spam` с `sort: 'date_desc'`. |
| FR-I2 | Используется `{% prefetch %}` с `limit` и `offset` для первой страницы. |
| FR-I3 | Карточка содержит: author, rating, content, date (`review.created_at`), avatar/image, source label «InSales», опционально фото (`review.image`). |
| FR-I4 | Фильтр `min_rating` применяется в Liquid до рендера (`{% if review.rating >= df_min_rating %}`). |
| FR-I5 | Настройка `hide_insales` — не рендерить блок inSales в Liquid (не JS-remove). |
| FR-I6 | Ответ менеджера (`review.replied?`) — out of scope Phase 1, Phase 2+ при необходимости. |
| FR-I7 | Форма «Оставить отзыв» — без изменений (уже нативная). |
| FR-I8 | При `account.reviews_enabled? == false` — блок inSales скрыт, вкладка InSales недоступна. |

### 2.2 Яндекс

| ID | Требование |
|----|------------|
| FR-Y1 | CLI генерирует **только** Яндекс-отзывы в `danforge_reviews_yandex.liquid`. |
| FR-Y2 | Сортировка в CLI: `created_at DESC` (без `random.shuffle`). |
| FR-Y3 | Каждый слайд: `data-source="yandex"`, `data-sort-ts` (ISO), `data-rating`, schema attrs. |
| FR-Y4 | Настройка `hide_yandex` — не include snippet в Liquid. |
| FR-Y5 | CLI сохраняет `reviews_cache.json` только для Yandex (или yandex section). |
| FR-Y6 | Upload в тему: snippet `danforge_reviews_yandex.liquid`; старый `danforge_reviews_slides.liquid` — deprecate с инструкцией миграции. |

### 2.3 Вкладки источника

| ID | Требование |
|----|------------|
| FR-T1 | Вкладки: **Все** / **InSales** / **Яндекс** (если `source_tabs=true` и источник не скрыт). |
| FR-T2 | При выборе вкладки в viewport видны **только** слайды выбранного источника. |
| FR-T3 | Смена вкладки сбрасывает pagination на страницу 1 и пересчитывает total pages. |
| FR-T4 | Смена вкладки переинициализирует Swiper (slider/spotlight), masonry layout, marquee, load-more. |
| FR-T5 | Слайды в `[data-df-reviews-pool]` участвуют в фильтрации источника. |
| FR-T6 | Если активна только одна вкладка (один источник) — панель вкладок скрыта или показывает один таб. |
| FR-T7 | Вкладка по умолчанию: **Все** (если оба источника доступны). |

### 2.4 Вкладка «Все»

| ID | Требование |
|----|------------|
| FR-A1 | Показываются отзывы обоих источников. |
| FR-A2 | Порядок: **merge by `data-sort-ts` descending** (новые первые). |
| FR-A3 | При равных датах: inSales перед yandex (tie-break). |
| FR-A4 | Merge выполняется в JS один раз при init / смене на «Все» (re-index `data-df-slide-index`). |

### 2.5 Сортировка

| ID | Требование |
|----|------------|
| FR-S1 | InSales: `sort: 'date_desc'` в prefetch (server). |
| FR-S2 | Yandex: sort desc в CLI перед generate. |
| FR-S3 | «Все»: client merge desc по `data-sort-ts`. |
| FR-S4 | Запрещено случайное перемешивание (`random.shuffle`) в production pipeline. |

---

## 3. Поведение вкладок: что грузится когда

| Вкладка | Initial SSR | Lazy / AJAX |
|---------|-------------|-------------|
| **InSales** | Prefetch первых `insales_prefetch_limit` отзывов | Load more / page nav → AJAX inSales (если count > limit) |
| **Яндекс** | Include snippet (limit `yandex_limit` в CLI, default 20) | Phase 2: fetch snippet section по клику, если `lazy_yandex=true` |
| **Все** | Оба блока SSR (или Yandex lazy — см. настройку) | Pagination/load-more работает по **видимому merged** списку |

**Initial load (рекомендация):**

- InSales: всегда SSR (limit = `page-size` или `insales_prefetch_limit`).
- Yandex: SSR если ≤10 отзывов; иначе defer до первого открытия вкладки Яндекс/Все (Phase 2).

---

## 4. Pagination и load-more по режимам

### 4.1 InSales — server pagination (masonry/grid/list на странице отзывов)

Если `paginate` доступен:

- Кнопка «Показать ещё» / AJAX: URL текущей страницы `?page=N` (как test).
- Ответ парсится: новые `.df-reviews__slide[data-source=insales]` append в wrapper.
- Pagination container обновляется.

Если `paginate` **не** доступен (виджет на главной):

- Fallback: prefetch limit = max(`slider-limit`, `page-size`, 50) **или** сообщение «полный список на странице отзывов» + CTA link.
- **Spike обязателен** перед финализацией.

### 4.2 Yandex — client pagination

- Все Yandex-слайды в DOM (generated limit).
- JS pagination/load-more/slider-limit — как сейчас, но **после** filter by source.

### 4.3 Режимы layout

| Layout | Pagination | Load more | Source tab behavior |
|--------|------------|-----------|---------------------|
| slider | N/A (slider-limit) | N/A | Reinit Swiper on visible slides only |
| spotlight | N/A (spotlight-limit) | N/A | Reinit Swiper |
| masonry | Page nav + load more | Yes | Masonry relayout after tab switch |
| grid | Page nav | No | Remount visible page |
| list | Page nav + load more | Yes | Same as masonry |
| marquee | marquee-limit | N/A | Rebuild marquee track |

---

## 5. Изменения CLI (`get_reviews.py`)

| Изменение | Детали |
|-----------|--------|
| Убрать inSales fetch из `run()` | `fetch_insales_reviews()` — optional `--insales-backup` или удалить |
| `sample_reviews()` | Только Yandex pool; убрать `insales_ratio` из основного flow |
| Сортировка | `picked.sort(key=lambda r: r.created_at or '', reverse=True)` |
| Убрать `random.shuffle` | Полностью |
| Snippet name | `danforge_reviews_yandex.liquid` |
| Config | `yandex_limit` (default 20), deprecate `sample_count` / `insales_ratio` для mix |
| `--check` | Оставить API ping (опционально) |
| Demo mode | Yandex-only demo slides |

---

## 6. Изменения Widget Liquid

| Изменение | Детали |
|-----------|--------|
| Заменить include | Вместо `danforge_reviews_slides` → prefetch loop + `include danforge_reviews_yandex` |
| Partial карточки | `_df_review_card.liquid` с параметром source |
| Assign prefetch | `reviews_start`, `insales_count = account.reviews_not_spam_count` |
| data-attrs | `data-source="insales"`, `data-sort-ts="{{ review.created_at | date: '%s' }}"` |
| Empty state | Раздельно: нет inSales / нет Yandex / нет вообще |
| Editor mode | Placeholder slides если 0 reviews (как сейчас empty-message) |

### 6.1 Новые/изменённые настройки (`settings_form.json`)

| name | type | default | Описание |
|------|------|---------|----------|
| `insales_prefetch_limit` | range 3–50 | = `page-size` | Сколько inSales SSR в prefetch |
| `yandex_prefetch_limit` | range 3–50 | 20 | Подсказка для CLI (`config.json`) |
| `lazy_yandex` | checkbox | false | Не include Yandex до первого клика (Phase 2) |
| `insales_ajax_loadmore` | checkbox | true | AJAX подгрузка inSales |

Help text для `min_rating`: «Для InSales — на сервере; для Яндекс — при генерации CLI».

---

## 7. Изменения Widget JS (`snippet.js`)

| Функция | Действие |
|---------|----------|
| `filterSlides()` | Убрать `.remove()`; для rating/source — `is-hidden` или не рендерится в Liquid |
| `applySourceTab()` | Заменить на `switchSourceTab(source)` |
| `switchSourceTab` | 1) mark hidden by source 2) merge/reindex if `all` 3) resetPagination 4) reinit layout |
| `getOrderedSlides()` | Учитывать active source filter |
| `loadInsalesPage(url)` | NEW: AJAX по образцу test/snippet.js |
| `mergeAllSourcesByDate()` | NEW: для вкладки «Все» |
| Pool slides | При tab switch — apply visibility to pool nodes |

---

## 8. Edge cases

| Case | Ожидание |
|------|----------|
| 0 inSales, есть Yandex | Видны Yandex; вкладка InSales hidden; «Все» = Yandex |
| 0 Yandex, есть inSales | CLI empty → include пуст; только inSales |
| 0 обоих | Empty state + CTA «Оставить отзыв» если reviews_enabled |
| Только один источник + source_tabs off | Работа без вкладок |
| `hide_insales` + вкладка InSales | Таб скрыт; filter in Liquid |
| editor_mode | Mock/placeholder не ломает prefetch; форма с датой |
| Новый отзыв через форму | EventBus `send-review:insales:ui_reviews` — optional reload block (Phase 2) |
| min_rating отсекает все inSales | Fallback empty для источника, не crash |
| Старый snippet `danforge_reviews_slides` | Fallback include если yandex snippet missing (transition, 1 release) |

---

## 9. Нефункциональные требования

| ID | Требование |
|----|------------|
| NFR-1 | First Contentful Paint: не более +20% vs текущий при lazy_yandex=true |
| NFR-2 | Совместимость с `widget/tests/*.test.js` — обновить тесты |
| NFR-3 | Smoke `visibility.html` — PASS |
| NFR-4 | README CLI: новый workflow без inSales API для генерации |
| NFR-5 | Обратная совместимость настроек виджета (без переименования critical keys) |

---

## 10. Test plan (outline)

### 10.1 Liquid / platform

- [ ] Prefetch на странице отзывов: sort date_desc, limit работает
- [ ] Prefetch на главной (если используется): поведение paginate
- [ ] hide_insales / hide_yandex в editor preview
- [ ] min_rating фильтрует inSales в Liquid

### 10.2 CLI

- [ ] Генерация только Yandex, порядок desc
- [ ] Upload `danforge_reviews_yandex.liquid`
- [ ] Batch clients без inSales fetch

### 10.3 JS / UI

- [ ] Вкладки: каждый таб показывает только свой source (6 layouts)
- [ ] «Все»: хронологический merge
- [ ] Pagination после switch tab → page 1, correct count
- [ ] Slider: нет пустых slides после filter
- [ ] Masonry: relayout после tab switch
- [ ] Load more inSales AJAX
- [ ] Resize / editor change-setting events

### 10.4 Regression matrix

Комбинации: `{slider, masonry, grid, list}` × `{all, insales, yandex}` × `{desktop, mobile}`.

---

## 11. Out of scope

- Автоматический cron CLI для Yandex
- Отзывы Avito/Google
- Product-level reviews (только shop reviews inSales)
- Manager reply UI для inSales cards

---

## 12. Критерии приёмки

1. InSales-отзывы на сайте обновляются без перезапуска CLI.
2. Вкладки показывают только выбранный источник во всех layout modes.
3. Порядок отзывов — новые первые в каждой вкладке.
4. CLI не вызывает `/admin/reviews.json` в standard run.
5. Документация и release checklist обновлены.
