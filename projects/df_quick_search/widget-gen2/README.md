# Быстрый поиск DanForge — пакет gen-2 (theme-snippet)

**Primary поставка для inSales generation 2** (паттерн nivona: `settings.html` + include в layout).

| | Gen-4 (`widget/`) | Gen-2 (**этот пакет**) |
|--|-------------------|------------------------|
| Установка | Админка «Виджеты» + зона header/outside | Файлы темы вручную |
| Настройки | `settings_form.json` → `widget_settings.*` | `settings.html` → `settings.df_qs_*` |
| JS | `snippet.js` (SSOT) | `media/df_quick_search.js` — **копия** SSOT |
| CSS | platform `snippet.scss` + inline critical | `media/df_quick_search.css` **+** inline critical в liquid |

SimpleWidget `widget/info.gen2.json` — **запасной** канал для магазинов с widget zones. Не путать с этим пакетом.

## Установка

Полный чеклист: [docs/install.md](./docs/install.md).

Кратко: залить snippet + js + css → fieldset в `settings.html` → keys в `settings_data.json` → `{% include "df_quick_search" %}` перед `scripts` в `layouts.layout.liquid`.

## Sync JS / CSS после релиза gen-4

1. Скопировать `widget/snippet.js` → `widget-gen2/media/df_quick_search.js` (байт-в-байт, без форка логики).
2. Пересобрать CSS из scss → `df_quick_search.css`, **сохранив critical overlay/panel** (`display:none` + `position:fixed`). SCSS (~973) → CSS (~813–825) — нормально, не усечение.
3. Сверить critical `<style>` в `snippets/df_quick_search.liquid`: overlay/panel **и** chrome (× / input / chips) — без asset UI не должен быть «голым».
4. Залить клиенту: **liquid + css** (минимум); js — если менялся. Проверить CSS **200** + hard refresh.

## Контракт data-*

Паритет с gen-4 `snippet.liquid` (имена + `'true'`/`'false'`). Сверка при релизе:

| data-* | Источник gen-2 |
|--------|----------------|
| `data-enabled` | `df_qs_enabled` |
| `data-placeholder` | `df_qs_placeholder` |
| `data-popular-queries` | `df_qs_popular_queries` |
| `data-trigger-selectors` | `df_qs_trigger_selectors` |
| `data-show-photos` | `df_qs_show_photos` |
| `data-show-prices` | `df_qs_show_prices` |
| `data-show-product-sort` | `df_qs_show_product_sort` |
| `data-show-all-results` | `df_qs_show_all_results` |
| `data-show-categories` | `df_qs_show_categories` |
| `data-hide-zero-price` | `df_qs_hide_zero_price` |
| `data-show-articles` | `df_qs_show_articles` |
| `data-show-out-of-stock-badge` | `df_qs_show_out_of_stock_badge` |
| `data-articles-lazy-load` | `df_qs_articles_lazy_load` |
| `data-article-blog-handles` | `df_qs_article_blog_handles` |
| `data-articles-blog-url` | `df_qs_articles_blog_url` |
| `data-articles-display-limit` | `df_qs_articles_display_limit` |
| `data-articles-server-total` | Liquid (не UI) |
| `data-articles-cache-key` | Liquid (не UI) |
| `data-results-limit` | `df_qs_results_limit` |
| `data-image-ratio` | `df_qs_image_ratio` |
| `data-cols-mobile/tablet/desktop` | `df_qs_cols_*` |

Корневые маркеры: `data-df-quick-search-root`, `data-danforge-widget="danforge_quick_search"`.

## Состав

```
widget-gen2/
├── README.md
├── docs/install.md
├── snippets/df_quick_search.liquid
├── config/settings_fieldset.html
├── config/settings_data.keys.json
├── media/df_quick_search.js
├── media/df_quick_search.css
├── media/df_quick_search.scss
└── patches/layouts.layout.include.liquid.txt
```

**DanForge** · https://danforge.ru
