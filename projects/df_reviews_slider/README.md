# Слайдер отзывов inSales + Яндекс (DanForge)

**Handle:** `danforge_reviews_slider`  
**Папка:** `projects/df_reviews_slider/`  
**Статус:** v1.3.1 — dual-source, 6 режимов макета, CTk CLI, Yandex Shop API, product page mode  
**Дистрибутив:** `dist/danforge-reviews-slider.zip`  
**Owner overrides:** `artifacts/2026-07-14-owner-widget-edits/01-owner-changes.md` — не откатывать

Объединённый блок отзывов на главной: **InSales** (prefetch Liquid) + **Яндекс** (CLI → сниппет темы). Виджет рендерит и переключает источники; CLI обновляет только Yandex-слайды.

---

## Состав

```
df_reviews_slider/
├── widget/          # gen-4 виджет (Swiper, 6 макетов)
├── cli/             # get_reviews.py — Yandex pipeline + upload (общий для gen-4 и gen-2)
├── output/          # сгенерированные файлы (после CLI)
├── CHANGELOG.md
└── README.md

df_reviews_slider_gen2/   # gen-2 Yandex-only — см. ../df_reviews_slider_gen2/README.md
```

---

## Dual-source architecture

| Источник | Механизм | Кто обновляет |
|----------|----------|---------------|
| **InSales** | `{% prefetch account.reviews_not_spam %}` в `snippet.liquid` | Автоматически при рендере страницы; AJAX load-more |
| **Яндекс** | `{% include 'danforge_reviews_yandex' %}` | CLI `get_reviews.py` → upload в тему |
| **Legacy fallback** | `danforge_reviews_slides.liquid` | Старый mixed-сниппет, если Yandex пуст |

**URL Яндекса в CLI:** `yandex.ru/maps/org/...` — полный набор через SSR + `?page=2`.  
`reviews.yandex.ru/shop/...` — API `/ugcpub/digest` (лимит ~31 отзыва с текстом; счётчик на витрине может быть выше). Для магазинов с большим числом отзывов предпочтительнее **URL Карт**.

**InSales — карточка отзыва о товаре:** в аватаре — **инициалы автора**; под рейтингом — блок `.df-reviews__product` (название + миниатюра, ссылка на товар). Отзывы о магазине — кастомный аватар из настройки `insales-shop-avatar`.

**Страница товара** (виджет на карточке с `product.id`):

- Вкладка **«Товар»** — только `product.reviews` (не все отзывы магазина)
- Вкладка **«Яндекс»** — как на остальных страницах
- Если отзывов на товар нет — `product-empty-message` и кнопка «Оставить отзыв» (форма на этот товар)
- Класс `df-reviews--product-page`, форма POST → `product.url/reviews`

**Вкладки** (`source-tabs`, default **false**): **Сайт** | Яндекс (на странице товара: **Товар** | Яндекс) — без вкладки «Все». Активная вкладка по умолчанию — **Яндекс** (`df_default_tab`).  
**Счётчики** на вкладках — **только в режиме Masonry** (боковые табы).

**Masonry + server load-more InSales** требует pagination anchor (например `/blogs/shop-reviews`). На главной без якоря — prefetch до 50, кнопка «Загрузить ещё» скрыта. См. `artifacts/2026-07-14-reviews-ajax-research/01-research.md`.

Подробная таблица лимитов: [`artifacts/2026-07-13-reviews-load-limits/05-report.md`](../../artifacts/2026-07-13-reviews-load-limits/05-report.md)

---

## Режимы макета (`display_mode`)

| Режим | Ключ | Лимит видимых | Пагинация | Load more | Кнопки CTA |
|-------|------|---------------|-----------|-----------|------------|
| Слайдер | `slider` | `slider-limit` (10) | — | — | под контентом |
| Spotlight | `spotlight` | `spotlight-limit` (5) | — | — | под контентом |
| Бегущая строка | `marquee` | `marquee-limit` (20) | — | — | под контентом |
| Masonry | `masonry` | `page-size` / mobile | да + «Показать ещё» | да (нужен якорь URL) | floating справа |
| Сетка | `grid` | `page-size` / mobile | да | — | floating справа |
| Лента | `list` | `list-limit`, `page-size` / mobile | да | — | под контентом |

---

## Быстрый старт (установщику)

### 1. Виджет

1. Админка → Виджеты → создать → загрузить файлы из `widget/`
2. Добавить **«Слайдер отзывов DanForge»** на главную
3. Выбрать макет, при необходимости включить вкладки InSales/Яндекс

### 2. CLI (Yandex-сниппет)

**GUI (рекомендуется):**

```bash
cd cli
pip install -r requirements.txt
start.bat
```

**CLI:**

```bash
python get_reviews.py --check
python get_reviews.py -u                    # generate + upload yandex snippet
python get_reviews.py --dry-run
python get_reviews.py -c clients/myshop/config.json
python get_reviews.py --insales-backup      # диагностика inSales API
```

Стандартный run **не вызывает** inSales API — только Yandex.  
Output: `output/danforge_reviews_yandex.liquid` → `snippets/danforge_reviews_yandex.liquid` в теме.

📄 Полная инструкция: [cli/INSTRUCTION.md](cli/INSTRUCTION.md)

### 3. Проверка

```bash
cd widget/tests
node settings.test.js
node settings-matrix.test.js
node settings-sync.test.js
node layouts.test.js
node pagination.test.js
node source-tabs.test.js
node settings-form.test.js
node marquee.test.js

cd ../../cli
python -m unittest discover -s tests

# E2E (Playwright, dual-source lazy Yandex)
cd ../widget/tests
npx playwright install chromium   # первый запуск
npx playwright test
# или: npm run test:e2e
```

---

## Настройки виджета (основные)

| name | default | Назначение |
|------|---------|------------|
| `display_mode` | slider | Макет: slider / masonry / grid / list / spotlight / marquee |
| `source-tabs` | false | Вкладки Сайт / Яндекс (на товаре: Товар / Яндекс) |
| `hide_write_btn` | false | Скрыть кнопку «Оставить отзыв» (`.df-reviews__write-btn`) |
| `empty-message` | Отзывы скоро появятся | Если нет отзывов InSales и Yandex-сниппета |
| `product-empty-message` | — | Пустое состояние на **странице товара** (без отзывов на товар) |
| `text-lines` | 5 | Строк текста до «Читать полностью» (все режимы, вкл. Masonry) |
| `review-text-align` | center | Выравнивание только `.df-reviews__text`: left / center / right |
| `floating-offset` | 1.5 | Sticky-отступ сверху для floating CTA и боковых вкладок (rem) |
| `product-thumb-ratio` | 1/1 | Пропорции миниатюры в блоке товара (1/1, 3/4, 4/3, 16/9, auto) |
| `product-bg-color` | rgba(0,0,0,0.04) | Фон блока `.df-reviews__product` |
| `product-text-color` | #333333 | Цвет названия товара в блоке `.df-reviews__product` |
| `list-limit` | 10 | Максимум отзывов в режиме «Лента» (InSales + Яндекс) |
| `page-size` | 12 | Отзывов на странице (masonry, grid, list) |
| `page-size-mobile` | 6 | То же на телефоне (≤639px) |
| `insales-prefetch-limit` | 20 | InSales в первой порции (prefetch); help: только Masonry |
| `insales-ajax-url` | /product/shop-reviews | URL AJAX load-more InSales |
| `insales-shop-avatar` | — | Заглушка аватара для отзывов о магазине (file) |
| `slider-limit` | 10 | Макс. слайдов в слайдере |
| `spotlight-limit` | 5 | Макс. в Spotlight |
| `marquee-limit` | 20 | Макс. в бегущей строке |
| `layout-columns` | 3 | Колонки masonry/grid |
| `hide_insales` / `hide_yandex` | false | Скрыть источник |
| `min_rating` | 0 | Фильтр InSales в Liquid; Yandex — при CLI |

Полный список: `widget/settings_form.json`

**Редактор inSales:** вкладки **`Описание`**, **`Контент`**, **`Дизайн`** (русские ключи). В «Описание» — info-блоки про универсальные режимы, Masonry (блог/пагинация), Ленту (сайдбар/mobile). `display_mode` — русские label в select (`[label, value]`).

---

## config.json (CLI)

| Поле | Описание |
|------|----------|
| `shop`, `api_key`, `password` | inSales API (upload темы) |
| `theme_id` | ID темы (null = опубликованная) |
| `yandex_org_url` | URL организации: **Яндекс Карты** (`yandex.ru/maps/org/...`) или **Яндекс Магазин** (`reviews.yandex.ru/shop/...`) |
| `yandex_reviews_file` | JSON fallback |
| `yandex_limit` | Лимит Yandex-слайдов (0 = sample_count) |
| `sample_count` | Fallback лимит (default 20) |
| `min_rating` | Фильтр при генерации |
| `source_mode` | `yandex` (standard) / legacy `mix` |

---

## Masonry UI

- Боковые вкладки **Сайт** / Яндекс **со счётчиками** (`data-df-tab-count`); на товаре — **Товар** / Яндекс
- Floating sticky-колонка: «Оставить отзыв» + CTA справа; отступ сверху — `floating-offset`
- «Читать полностью» — **только если текст обрезан** по `text-lines` (наличие фото не влияет)
- Порядок в карточке: текст → «Читать полностью» → **фото отзыва inline** → источник
- «Показать ещё» — accumulate pagination
- InSales AJAX «Загрузить ещё» — если отзывов больше prefetch limit

## Попап «Читать полностью»

- Фото отзыва — **перед** полным текстом
- Блок товара InSales (если есть) — в шапке под рейтингом

## Фото в lightbox

Карточки передают `data-photo-urls` (original) и `data-photo-previews` (medium) — lightbox использует previews для быстрой загрузки.

---

## Deploy checklist

1. **CLI:** `python get_reviews.py -u` → `danforge_reviews_yandex.liquid` в теме
2. **Виджет:** залить `snippet.liquid`, `snippet.js`, `snippet.scss`, `settings_form.json`, `settings_data.json`
3. **Редактор:** пересохранить виджет (server reload для prefetch-настроек)
4. **Smoke:** вкладки, masonry counts, load-more InSales, все 6 макетов
5. **Чеклист:** `templates/insales-widget-checklist.md`

---

## Обновление отзывов

| Источник | Действие | Частота |
|----------|----------|---------|
| Яндекс | `python get_reviews.py -u` | раз в месяц / по запросу |
| InSales | Автоматически на сайте + AJAX | без CLI |

---

## Требования

- inSales generation 4, Swiper на теме (`info.json`)
- Python 3.10+
- API-ключ: отзывы + темы

---

## Gen-2 (in progress)

Отдельный продукт для шаблонов inSales **generation 2**: `projects/df_reviews_slider_gen2/` (handle `danforge_reviews_slider_g2`, Yandex-only, slider + list). Prep: `artifacts/2026-07-20-reviews-content-cli-gen2/03-gen2-prep.md`. Текущий виджет — **generation 4** only.

---

## Лицензия

Коммерческая. Один магазин — одна лицензия.

**DanForge** · https://danforge.ru
