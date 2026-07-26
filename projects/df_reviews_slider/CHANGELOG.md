# CHANGELOG

## v1.3.1 — страница товара + вкладки (2026-07-20)

### Виджет (gen-4)

- **Страница товара:** при `product.id` — только отзывы этого товара (`product.reviews`), не все отзывы магазина
- **Яндекс на карточке товара:** вкладка и слайды работают как на остальных страницах
- **Пустое состояние на товаре:** настройка `product-empty-message` + кнопка «Оставить отзыв» в блоке
- **Форма на товаре:** POST на `product.url/reviews` с `review[product_id]`; класс `df-reviews--product-page`
- **Вкладки:** «Сайт» вместо «InSales»; на странице товара — «Товар»
- На странице товара блок `.df-reviews__product` под рейтингом не показывается (избыточен)

## v1.3.0 — widget UX + Yandex Shop CLI (2026-07-20)

### Виджет (gen-4)

- **Скрыть кнопку «Оставить отзыв»** — `hide_write_btn`
- **InSales товарные отзывы:** инициалы в аватаре; блок `.df-reviews__product` под рейтингом (название + миниатюра + ссылка)
- **Блок товара — оформление:** `product-thumb-ratio`, `product-bg-color`, `product-text-color`
- **Выравнивание текста отзыва:** `review-text-align` (left / center / right) — только `.df-reviews__text`
- **Floating CTA / вкладки:** настраиваемый sticky-отступ `floating-offset` (rem), CSS `--df-reviews-floating-top`
- **Masonry:**
  - «Читать полностью» по `text-lines`; кнопка **только при обрезке текста** (не из-за фото)
  - Фото отзыва inline **после текста** (и после expand); в попапе — **перед** текстом
- Обновлены `settings_form.json`, `settings_data.json`, help-тексты

### CLI

- **Яндекс Магазин:** `reviews.yandex.ru/shop/...` через API `/ugcpub/digest` (пагинация offset)
- Лимит API ~31 отзыв с текстом; счётчик на витрине может быть выше — для полного набора использовать URL **Яндекс Карт**
- Unit-тесты: `cli/tests/test_yandex_parser.py`

### Документация

- README, INSTRUCTION, чеклист, knowledge base — v1.3.0
- Gen-2 prep: `artifacts/2026-07-20-reviews-content-cli-gen2/03-gen2-prep.md`

## v1.2.1 — sprint CLI + owner edits + editor fixes (2026-07-14–15)

- CLI: CustomTkinter parity, progress bar, manual wizard (без API), `theme_id` fixes
- Lazy-load Yandex, e2e dual-source **6/6**, checklist v1.2.1
- Owner widget edits сохранены (вкладка «Описание», defaults, floating CTA, layout-*)
- `parseLayout`: русские алиасы («Режим фокуса», «Мансори»)
- `settings_form.json`: select `[label, value]` для русского dropdown
- Marquee: popup overflow, tab dedupe, left start, animation offset, horizontal containment (`layout:has()`)
- AJAX research armedf.ru: якорь `/blogs/shop-reviews`
- Unit tests: **179 checks** (+settings-form, +marquee); CLI: **27 tests**
- Документ owner overrides: `artifacts/2026-07-14-owner-widget-edits/01-owner-changes.md`

## v1.2.0 — dual-source + 6 layouts (2026-07-13)

- Dual-source: InSales prefetch + Yandex CLI snippet (`danforge_reviews_yandex.liquid`)
- Вкладки InSales / Яндекс (без «Все»); счётчики **только в Masonry**
- 6 макетов: slider, masonry, grid, list, spotlight, marquee
- Лимиты по режимам: `slider-limit`, `spotlight-limit`, `marquee-limit`, `page-size`, `insales-prefetch-limit`
- InSales AJAX load-more; Masonry «Показать ещё»
- Floating CTA — masonry + grid; inline CTA — slider, spotlight, marquee, list
- Photo previews в lightbox (`data-photo-previews`)
- Отчёт лимитов: `artifacts/2026-07-13-reviews-load-limits/05-report.md`

## v1.0.1 — упаковка

- Kwork + Tilda гайды, обложки, zip дистрибутив
- `yandex.example.json`

## [1.0.0] — 2026-07-09

### MVP
- Виджет `danforge_reviews_slider` (Swiper, адаптив)
- CLI `get_reviews.py`: inSales Admin API, Яндекс (парсинг + JSON fallback)
- Генерация `danforge_reviews_slides.liquid`, кэш JSON
- Загрузка сниппета в тему (`-u`)
- Случайный срез отзывов, demo-режим (`--demo`)
