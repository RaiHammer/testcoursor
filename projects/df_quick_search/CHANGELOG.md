# CHANGELOG — df_quick_search

## v1.2.0 — слайдер фото + оптимизация превью (2026-07-27)

- **Превью:** `urlFromImageObject` предпочитает `compact_url` → `medium_url` → `thumb_url` (меньше трафика в сетке поиска).
- **Слайдер:** `hover_second_image` (on) → crossfade 2-го фото на ПК. `product_photo_slider` (off) → до 4 фото, зоны/свайп, перебивает crossfade. Оба off → 1 фото.
- **UX:** точки-индикаторы; клик по карточке не срабатывает после свайпа.
- **Re-upload:** `snippet.js`, `snippet.scss`, `snippet.liquid`, `settings_form.json`, `settings_data.json` (+ gen-2)

## v1.1.5 — оформление + единый скроллбар (2026-07-27)

- **Настройки:** фон панели, цвет текста, фон карточек, цвет скроллбара, размер текста в input (px; 0 = авто).
- **CSS vars:** `--df-qs-panel-bg`, `--df-qs-text`, `--df-qs-card-bg`, `--df-qs-scrollbar-*`, `--df-qs-input-font-size`.
- **Scrollbar:** единый тонкий 6px на Mac / Windows / Linux (WebKit + `scrollbar-width: thin`).
- **Re-upload:** `settings_form.json`, `settings_data.json`, `snippet.liquid`, `snippet.scss` (+ gen-2 liquid, fieldset, keys, css)

## v1.1.4 — visible minimal scrollbars on macOS (2026-07-27)

- **UX:** тонкие видимые scrollbar (6px) для колонок товаров, категорий и статей на desktop split-layout; `scrollbar-gutter: stable`.
- **Причина:** macOS overlay scrollbars скрыты по умолчанию — пользователь не видел, что список прокручивается.
- **Re-upload:** `snippet.scss` (+ gen-2 `df_quick_search.scss` / `df_quick_search.css`)

## v1.1.3 — fix hover second image + toggle (2026-07-24)

- **Root cause:** crossfade был за `@media (hover: hover) and (pointer: fine)`. На hybrid/touch ноутбуках primary input часто `hover: none` / `pointer: coarse` даже с мышью → правила hover не применялись, хотя разметка `has-hover-image` + `--hover` была верной. Дополнительно hover-слой имел `z-index: 0` под primary; appear с `animation-fill-mode: both` оставлял opacity/transform на карточке.
- **Fix CSS:** `@media (any-hover: hover)`; primary `z-index: 1`, `--hover` `z-index: 2`; appear → `backwards` (без forwards lock).
- **Setting:** `hover_second_image` (gen-2: `df_qs_hover_second_image`) default **true**; `data-hover-second-image`; JS не рендерит второе `<img>` при выкл.
- **Тесты:** gate `hoverSecondImage` в `settings.test.js`.
- **Re-upload:**
  - **Gen-4:** `snippet.js`, `snippet.scss`, `snippet.liquid`, `settings_form.json`, `settings_data.json`, `info.json`
  - **Gen-2:** `media/df_quick_search.js`, `media/df_quick_search.css`, `snippets/df_quick_search.liquid`, `config/settings_fieldset.html` (+ keys)

## v1.1.2 — fix USD shows ₽ (2026-07-24)

- **Root cause:** на части тем `Shop.config.get(key)` игнорирует ключ и отдаёт **весь** config. Виджет принимал этот объект как `money_with_currency_format` → unit/format не читались → дефолт `₽`. Fallback по `currency_code` не срабатывал (`typeof money === 'object'`). Сумма уже могла быть в USD (enrich + cookie), символ — ₽ (`0.81 ₽`).
- **Fix:** `isPlausibleShopConfigValue` отклоняет «весь config»; `detectCurrencyCode()` — config → `.header-currency select` → unit; при известном коде всегда preset (`$0.81` / `12.50 €`); опционально `Shop.money.format` с отбраковкой stale ₽.
- **Тесты:** `locale.test.js` — USD format strings, incomplete config, whole-config rejection.
- **Re-upload:**
  - **Gen-4:** `snippet.js`, `info.json`
  - **Gen-2:** `media/df_quick_search.js`
- **Не ломает** v1.1.1 `normalizeLocaleString` / locale object.
- **Артефакт:** `artifacts/2026-07-24-df-quick-search-ux-i18n/03-how-locale-works.md`

## v1.1.1 — fix locale=[object Object] (2026-07-24)

- **Root cause:** `Shop.config.locale` (или `Site.language`) на части витрин — **объект**; `String(locale)` → `"[object Object]"` → `/search_suggestions?locale=%5Bobject%20object%5D` → HTTP 500 (bimbobooks.ru).
- **Fix:** `normalizeLocaleString()` — извлекает `.code` / `.locale` / `.iso` / `.iso_code` / `.lang` / первую строку; все fetch-пути (`search_suggestions`, `products_by_id`, `search.json`) всегда шлют строку `en`/`ru` (fallback `ru`).
- **Тесты:** `widget/tests/locale.test.js` — object → string, undefined → ru, string passthrough.
- **Re-upload:**
  - **Gen-4:** `snippet.js`, `info.json`
  - **Gen-2:** `media/df_quick_search.js`
- **Не ломает** v1.1.0 titles/currency.

## v1.1.0 — multi-lang titles + UI chrome + currency (2026-07-24)

- **Root cause (titles):** `/search_suggestions?locale=en` отдаёт EN titles, но enrich `/products_by_id` **без** `lang` возвращал RU (default) и `title: full.title || product.title` затирал EN. Категории ок — Liquid SSR по locale страницы.
- **Root cause (currency):** suggestions `price_min` всегда в базовой RUR; после USD cookie `products_by_id` отдаёт конвертированные цены, но merge предпочитал suggestion → виджет оставался в ₽. `formatPrice` хардкодил `₽`.
- **Fix API:** `products_by_id?lang=…`; всегда форсировать `locale` в suggestions; enrich: `title: product.title || full.title`, `price_min` из enrich; cache key = query+locale+currency.
- **Fix UI:** словари RU/EN (`t()`); Liquid panel/aria/default placeholder + `data-ui-locale`.
- **Fix money:** `formatPrice` читает `Shop.config.money_with_currency_format` (object: format/unit/delimiter) → `$2.91` при USD.
- **Тесты:** `widget/tests/locale.test.js` — green с остальными suites.
- **Re-upload:**
  - **Gen-4:** `snippet.js`, `snippet.liquid`, `info.json`
  - **Gen-2:** `media/df_quick_search.js`, `snippets/df_quick_search.liquid`
- **Артефакт:** `artifacts/2026-07-24-df-quick-search-ux-i18n/02-fix-locale.md`
- **Лимиты:** admin placeholder/popular_queries — один язык; неизвестный locale UI → RU; смена валюты без reload Shop.config не подхватывается (тема обычно reload).

## v1.0.10 — appear animation + desktop hover second image (2026-07-24)

- **Appear:** товары / статьи / категории — лёгкий fade+slide (`opacity` + `translateY(6px)`, ~280ms); лёгкий stagger первых 4–8; `prefers-reduced-motion` отключает анимации.
- **Hover 2nd image (desktop):** после enrich (`images[]` из `/products_by_id`) второе фото в карточке; crossfade только при `@media (hover: hover) and (pointer: fine)`; без второго фото — graceful single img; mobile без flash.
- **i18n (#3):** анализ + рекомендация (без кода) — `artifacts/2026-07-24-df-quick-search-ux-i18n/01-analysis.md`. UI chrome всё ещё RU; API locale уже ок; полный RU/EN dict → v1.1.
- **Sync:** gen-2 `media/df_quick_search.{js,scss,css}`.
- **Тесты:** second-image helpers в `settings.test.js`; suites green.
- **Re-upload:**
  - **Gen-4:** `snippet.js`, `snippet.scss`, `info.json`
  - **Gen-2:** `media/df_quick_search.js` + `media/df_quick_search.css` (liquid без изменений)
- **Файлы:** `widget/snippet.{js,scss}`, `widget-gen2/media/df_quick_search.{js,scss,css}`, `widget/tests/settings.test.js`, `CHANGELOG.md`, `README.md`, `FEATURES.md`, `widget/info*.json`, `widget-gen2/docs/install.md`

## v1.0.9 — gen-2 critical chrome + CSS recompile (2026-07-23)

- **Bug (Gen-2 / sushivenik):** панель открывается (overlay/panel из inline), но × / input / recent·popular выглядят «голыми» (plain ×, default input, серые чипы).
- **Root cause (line count):** «972 → 825» — это **не усечение правил**. `df_quick_search.scss` ≈973 строк (nesting + blanks); скомпилированный CSS ≈813–825. Содержимое правил сохранено; git history на файл отсутствует (untracked).
- **Root cause (live UI):** chrome-стили (`__close`, `__input`, chips) живут только в CSS-asset; при 404 / незалитом / закэшированном asset liquid critical давал только overlay/panel → симптом со скриншота.
- **Fix:**
  1. Critical `<style>` в `snippets/df_quick_search.liquid` расширен: close, panel-title, form, input, recent/popular chips (+ mobile input).
  2. CSS пересобран из `df_quick_search.scss` (`sass`); `html/body.df-quick-search-open` → `overflow: hidden !important`.
  3. v1.0.8 price bottom-align сохранён (`height: 100%` / `margin-top: auto`).
- **Gen-4:** без изменений snippet.*; только bump версии в `info*.json` / docs.
- **Re-upload (gen-2, обязательно):** `snippets/df_quick_search.liquid` + `media/df_quick_search.css`. После заливки: DevTools → CSS **200**, hard refresh.
- **Файлы:** `widget-gen2/snippets/df_quick_search.liquid`, `widget-gen2/media/df_quick_search.{scss,css}`, `widget-gen2/docs/install.md`, `CHANGELOG.md`, `README.md`, `FEATURES.md`, `widget/info*.json`

## v1.0.8 — product card price bottom-align (2026-07-23)

- **Bug:** цены под названиями разной высоты (2–4 строки) не выравнивались в ряду карточек — особенно заметно на mobile.
- **Fix (CSS):** `.df-quick-search__product` — `height: 100%` (stretch в grid); image wrap — `flex-shrink: 0`; `.df-quick-search__product-prices` — `margin-top: auto` (+ `padding-top: 0.25rem` вместо старого margin).
- **Skip:** line-clamp заголовка — не запрашивался владельцем.
- **Sync:** gen-2 `media/df_quick_search.{scss,css}`.
- **Re-upload:**
  - **Gen-4:** `snippet.scss` (+ `info.json` при смене описания)
  - **Gen-2:** `media/df_quick_search.css` (scss в репо для sync)
- **Файлы:** `widget/snippet.scss`, `widget-gen2/media/df_quick_search.{scss,css}`, `CHANGELOG.md`, `README.md`, `FEATURES.md`, `widget/info*.json`, `widget-gen2/docs/install.md`

## v1.0.7 — gen-2 critical CSS for overlay/panel (2026-07-23)

- **Bug (Gen-2 only, sushivenik):** до открытия поиска на странице текли `.df-quick-search__close` и `.df-quick-search__panel-title` («ПОИСК»); остальная панель без стилей; при открытии ломалась вёрстка.
- **Root cause:** в gen-2 не было critical inline `<style>` из gen-4 (`display:none` + `position:fixed` для overlay/panel). В `df_quick_search.css` тоже не было правил `__overlay` / `__panel` — панель жила в document flow; close/title (`position:absolute`) утекали на страницу. Gen-4 держит эти правила в `snippet.liquid` и поэтому не ломался.
- **Fix:**
  1. Портирован critical `<style>` блок в `widget-gen2/snippets/df_quick_search.liquid` (паритет с gen-4).
  2. Добавлены `__overlay` / `__panel` (+ mobile + scroll-lock) в `widget-gen2/media/df_quick_search.{scss,css}` как страховка при 404 asset.
- **Gen-4:** без изменений.
- **Re-upload (минимум):** `snippets/df_quick_search.liquid` + `media/df_quick_search.css`.
- **Файлы:** `widget-gen2/snippets/df_quick_search.liquid`, `widget-gen2/media/df_quick_search.{scss,css}`, `widget-gen2/docs/install.md`, `CHANGELOG.md`, `README.md`, `FEATURES.md`, `widget/info*.json`

## v1.0.6 — gen-2 re-upload syntax fix (2026-07-23)

- **Bug:** Gen-2 live всё ещё — `df_quick_search.js:1746 Uncaught SyntaxError: Unexpected token 'function'`.
- **Cause:** в v1.0.5 правка `function handleLoadMoreProducts` попала в репозиторий (gen-2 = gen-4, SHA совпадает), но live Gen-2 / `info.gen2.json` остались на v1.0.4 — синк заливки был неполным.
- **Verify:** `node --check` OK на `widget/snippet.js` и `widget-gen2/media/df_quick_search.js`; `function handleLoadMoreProducts` на стр. 1742.
- **Action:** повторно залить Gen-2 `media/df_quick_search.js` (+ метаданные версии).
- **Файлы:** `CHANGELOG.md`, `README.md`, `FEATURES.md`, `widget/info.json`, `widget/info.gen2.json`, `widget/info.gen4.json`

## v1.0.5 — syntax fix handleLoadMoreProducts (2026-07-23)

- **Bug:** Gen-4 live (`theme_preview`) — `Uncaught SyntaxError: Unexpected token 'function'` (snippet parse fail).
- **Cause:** при правке adaptive sidebar в v1.0.4 у `handleLoadMoreProducts` осталось тело без объявления `function` (перед `handleLoadMoreArticles`, ~стр. 1741).
- **Fix:** восстановлен `function handleLoadMoreProducts(state, query, event) { ... }`.
- **Sync:** `widget-gen2/media/df_quick_search.js` (в репо; live Gen-2 — см. v1.0.6).
- **Тесты:** `node --check` OK; settings / fetch / categories / sidebar-split — pass.
- **Файлы:** `widget/snippet.js`, `widget-gen2/media/df_quick_search.js`, `CHANGELOG.md`, `README.md`, `FEATURES.md`, `widget/info.json`

## v1.0.4 — adaptive sidebar split (2026-07-23)

- **Goal:** desktop sidebar (≥768) больше не делит категории/статьи жёстко 50/50 — высоты адаптивны под контент.
- **Алгоритм (`layoutSidebarSplit` + `allocateSidebarSplitHeights`):**
  1. Измерить `sidebar.clientHeight` и natural `scrollHeight` блоков категорий и статей.
  2. Если оба помещаются → категории = natural (hug); статьи забирают остаток.
  3. Если не помещаются → каждому `min(natural, available/2)`, leftover стороне с дефицитом; при одновременном overflow — пол ≥25%, потолок ≤70%.
  4. Пиксельные `flex-basis`/`height` на секции; пересчёт после render, load-more статей, resize (debounce).
- **CSS:** `--with-articles` → flex column + `gap` (вместо grid 50/50); only-cats / only-arts без изменений (`flex: 1` + scroll). Чипы категорий по-прежнему `align-items: flex-start` / `flex: 0 0 auto`.
- **Sync:** gen-2 scss/css/js; critical CSS в `snippet.liquid`.
- **Тесты:** `widget/tests/sidebar-split.test.js`
- **Файлы:** `widget/snippet.{scss,liquid,js}`, `widget-gen2/media/df_quick_search.{scss,css,js}`, `CHANGELOG.md`, `README.md`, `FEATURES.md`, `widget/info.json`

## v1.0.3 — category chips hug content (2026-07-23)

- **Bug:** после sidebar 50/50 grid чипы `.df-quick-search__category-item` растягивались по высоте списка (`align-items: stretch` + list `flex: 1 1 auto`) — высокие пустые боксы, текст сверху (gen-4 armedf, gen-2 sushivenik).
- **Fix:** `.df-quick-search__category-list` → `align-items` / `align-content: flex-start`; чипы → `flex: 0 0 auto`, `align-self: flex-start`, `height: auto`. Скролл списка (`overflow-y: auto`) и заполнение панели категорий сохранены.
- **Sync:** gen-2 scss/css; critical CSS в `snippet.liquid`.
- **Файлы:** `widget/snippet.scss`, `widget/snippet.liquid`, `widget-gen2/media/df_quick_search.{scss,css}`, `CHANGELOG.md`, `README.md`, `FEATURES.md`, `widget/info.json`

## v1.0.2 — sidebar 50/50 grid + product grid fit (2026-07-23)

- **Root cause (категории сжимались):** `flex: 0 0 50%` / `max-height: 50%` не держат долю, если высота сайдбара content-sized (`%` от `auto` → auto). При «Показать ещё» блок статей раздувал сайдбар/перераспределял flex — категории становились ниже.
- **Fix:** `--with-articles` → CSS Grid `minmax(0,1fr) minmax(0,1fr)`; сайдбар `overflow: hidden` + цепочка `flex: 1 1 0%` / `min-height: 0` / `overflow: hidden` от panel → results → split-body; скролл только у внутренних списков (категории и статьи).
- **Root cause (h-scroll):** `auto-fill` + `minmax(max(9–11rem, …))` давал треки шире колонки, когда `%` ширины сетки indefinite.
- **Fix:** `repeat(var(--df-qs-cols-*), minmax(0, 1fr))` + `min-width: 0` / `box-sizing` на grid/main/sort.
- **JS:** preserve scroll читает/пишет `scrollTop` у внутренних list-узлов.
- **Sync:** gen-2 scss/css/js; critical CSS в `snippet.liquid`.
- **Файлы:** `widget/snippet.scss`, `widget/snippet.liquid`, `widget/snippet.js`, `widget-gen2/media/df_quick_search.{scss,css,js}`, `CHANGELOG.md`, `README.md`, `FEATURES.md`

## v1.0.1 — desktop sidebar layout polish (2026-07-23)

- **Fix:** при наличии статей блок категорий в desktop sidebar занимает стабильные **50%** высоты (`flex: 0 0 50%` + `max-height: 50%`), список чипов скроллится внутри; раньше `flex: 0 1 auto` + только `max-height` позволяли flex-shrink сжимать категории ниже 50%
- **Fix:** убраны горизонтальные scrollbar у колонки товаров (`.df-quick-search__main`) и сайдбара статей/категорий (`overflow-x: hidden`, `min-width: 0`, перенос длинных заголовков статей)
- **Sync:** gen-2 `widget-gen2/media/df_quick_search.scss` + `.css`
- **Файлы:** `widget/snippet.scss`, `widget/snippet.liquid`, `widget-gen2/media/df_quick_search.scss`, `widget-gen2/media/df_quick_search.css`, `CHANGELOG.md`
- **Примечание:** на live процент-flex оказался недостаточен → см. v1.0.2

## v1.0.0 — stable release (2026-07-23)

Первый стабильный релиз. Виджет готов к продакшену на inSales Gen-2 / Gen-4 (пилот: armedf.ru).

**Сводка продукта (включая историю 0.0.x):**
- Полноэкранный live-поиск: гибрид `/search_suggestions` + `/search.json`, enrich `/products_by_id`, SKU, строгий фильтр
- Layout B: desktop split (sidebar категории/статьи + main товары), mobile tabs; независимый scroll; spinner overlay; scrollbar padding
- Товары: фото/цены/old price, stock badge, сортировка цена/популярность, `show_all_results`, grid cols, skeleton
- Категории: parent labels при коллизиях названий; scroll в sidebar; empty-message скрыт, если есть категории
- Статьи: полный Liquid-индекс + `{% cache %}` + lazy parse + localStorage 24ч
- UX: popular queries, recent только при hits, layout fix RU↔EN (всегда on), analytics dataLayer
- 21 настройка в админке; тесты `settings` / `fetch` / `categories`

История 0.0.x ниже без изменений.

## v0.0.37 — empty-message скрыт при категориях (2026-07-23)

- **UX:** если на empty state есть категории (`.df-quick-search__categories--empty`), не показывать `.df-quick-search__empty-message` («Ничего не найдено…») — категории считаются результатом
- **Без изменений:** ссылка «Искать на странице поиска», recent/analytics, пустой empty state без категорий
- **Файлы:** `snippet.js`, `CHANGELOG.md`

## v0.0.36 — recent только с результатами; hide layout-suggest (2026-07-23)

- **UX:** в «Недавние запросы» попадают только успешные поиски (товары и/или статьи > 0 после prepare/filter)
- **Fix:** при layout-коррекции в recent сохраняется исправленный запрос (`honda`), а не исходный без выдачи (`рщтвф`)
- **UX:** empty-state блок `.df-quick-search__layout-suggest` временно отключён (код закомментирован); retry раскладки и баннер `.df-quick-search__layout-hint` без изменений
- **Файлы:** `snippet.js`, `CHANGELOG.md`

## v0.0.35 — gap перед scrollbar (2026-07-22)

- **UX:** контент больше не прилипает к вертикальному scrollbar — `padding-right: 0.75rem` на скролл-контейнерах
- **Desktop:** `.df-quick-search__main`, `.df-quick-search__categories--sidebar`, `.df-quick-search__articles--sidebar`
- **Mobile:** `.df-quick-search__results` уже с `padding: 1.5rem` (gap есть)
- **Файлы:** `snippet.scss`, `snippet.liquid`

## v0.0.34 — scroll категорий в desktop sidebar (2026-07-22)

- **UX:** длинный список категорий больше не вылезает за низ сайдбара — у `.df-quick-search__categories--sidebar` свой `overflow-y: auto`
- **Без статей:** категории занимают оставшуюся высоту сайдбара (`flex: 1`, `min-height: 0`)
- **Со статьями:** класс `df-quick-search__sidebar--with-articles` → категории `max-height: 50%`, статьи по-прежнему `flex: 1` со своим скроллом
- **Mobile:** rail категорий без изменений (горизонтальные чипы)
- **Fix:** при partial re-render сохраняется `scrollTop` категорий сайдбара
- **Файлы:** `snippet.scss`, `snippet.liquid`, `snippet.js`

## v0.0.33 — layout fix на пустой выдаче с категориями (2026-07-22)

- **Fix:** empty state больше не пропускает layout-подсказку из‑за категорий — «пусто» = нет товаров и статей (suggested / title-matched категории не считаются hits)
- **Fix:** после неудачного retry с другой раскладкой в empty state всегда показывается «Возможно, вы имели в виду …?» (state.layoutSuggestion)
- **UX:** `рщтвф` → поиск `honda`; при успехе — баннер; при неудаче — кнопка «Искать» + категории на empty state

## v0.0.32 — layout fix всегда включён (2026-07-22)

- **Layout fix RU↔EN:** всегда включён — настройка `layout_fix` удалена из админки
- **Файлы:** `settings_form.json`, `settings_data.json`, `snippet.liquid`, `snippet.js`

## v0.0.31 — исправление раскладки RU↔EN (2026-07-22)

- **Layout fix:** при пустой выдаче пробует тот же запрос в другой раскладке (например «рщтвф» → «honda»)
- **UX:** при успехе — баннер «Показаны результаты для …» + кнопка заменить запрос в поле; при неудаче — подсказка «Возможно, вы имели в виду …?»
- **Настройка `layout_fix`:** checkbox, default ON (удалена в v0.0.32 — фича всегда on)
- **Analytics:** `df_qs_layout_fix` при успешной автозамене

## v0.0.30 — fix sort re-render, all-results toggle (2026-07-22)

- **Fix:** смена сортировки не обновляла сетку — `bindProductSort` вызывал `renderResults` с неверными аргументами (query вместо products)
- **Copy:** пункт сортировки «По умолчанию» вместо «По релевантности»
- **Настройка `show_all_results`:** checkbox для ссылки `.df-quick-search__all-results` («Все результаты»)

## v0.0.29 — сортировка товаров: цена и популярность (2026-07-22)

- **Сортировка выдачи товаров:** select в шапке блока «Товары» — по релевантности (default), цена ↑/↓, по популярности (если API отдал `popularity` / `sales_rate` / `orders_count` / `sort_weight`)
- **Без сортировки по названию** — порядок поиска по умолчанию сохраняется
- **Клиентская:** сортируется уже загруженный буфер (тот же список, что «Показать ещё»)
- **Настройка `show_product_sort`:** checkbox, default ON
- **Enrich:** прокидываются поля популярности из `/products_by_id`
- **Файлы:** `snippet.js`, `snippet.scss`, `snippet.liquid`, `settings_form.json`, `settings_data.json`

## v0.0.28 — полный индекс статей + Liquid/JS cache (2026-07-22)

- **Liquid indexed loop:** вместо `paginate … by 100` — доступ `blogs[handle].articles[i]` по `articles.size` для каждого handle; пустые слоты (blank title) пропускаются
- **Полный клиентский индекс:** при `show_articles` в JSON попадают все статьи блога(ов); `indexIncomplete` = false, когда длина индекса ≈ `articles_server_total`
- **Liquid `{% cache %}` (основной):** тяжёлый JSON-индекс обёрнут в `{% cache df_qs_articles_cache_key %}…{% endcache %}` — сервер не пересобирает цикл 500+ статей на каждый page render при том же ключе
- **Формула Liquid cache key:** `df_qs_articles` + для каждого валидного handle `_{handle}_{blogs[handle].articles.size}` + `_{language.locale}`  
  Пример: `df_qs_articles_blog_512_ru` или `df_qs_articles_blog_512_news_48_ru`  
  Инвалидация при изменении `articles.size` любого блога или locale; **не** ловит правки title/текста без смены размера — caveat
- **Client `localStorage` (вторичный):** ключ `df_qs_articles_v1:{тот же data-articles-cache-key}`, TTL 24 ч — без повторного `JSON.parse` script-тега
- **`articles_lazy_load`:** без изменений (откладывает первую загрузку на клиенте)
- **Ограничение HTML:** закешированный JSON всё равно отдаётся в HTML страницы (вес ответа); Liquid cache снимает CPU/render loop на сервере, client cache — parse на клиенте
- **«Все статьи →»:** остаётся для UI блога даже при полном индексе (после исчерпания локальных совпадений)
- **Файлы:** `snippet.liquid`, `snippet.js`, `settings_form.json`, tests, docs

## v0.0.27 — popular queries chips (2026-07-22)

- **Настройка `popular_queries`:** text CSV в админке («Популярные запросы»), default пусто
- **UI:** блок «Популярные запросы» рядом с «Недавние запросы» при пустом поле / query &lt; 2 символов
- **Поведение:** клик по чипу → заполняет input и запускает поиск; пустой список — блок скрыт; можно показать только popular / только recent / оба
- **Парсинг:** trim, skip empty, case-insensitive dedupe, max 12
- **Файлы:** `settings_form.json`, `settings_data.json`, `snippet.liquid` (`data-popular-queries`), `snippet.js`, `snippet.scss`, tests

## v0.0.26 — category chip parent labels (2026-07-22)

- **Duplicate category titles:** при одинаковых названиях и разных URL чипы показывают `Родитель · Категория` (например `Мужское · Шорты` / `Женское · Шорты`)
- **Hierarchy:** в Liquid JSON коллекций добавлен `level`; JS восстанавливает `parentTitle` по порядку `flatten_branch`
- **Fallback:** нет родителя при коллизии — `Название · slug` из URL; уникальные названия без изменений
- **UI:** desktop sidebar и mobile rail; перенос длинных подписей в чипах (чуть меньший font-size)

## v0.0.25 — skeleton, URL, hidden products (2026-07-22)

- **Fix eternal `is-skeleton`:** нет URL фото → `is-placeholder` (статичный фон), не вечный shimmer без `<img>`
- **Image settle:** есть URL → `<img>` + `is-skeleton` до `load` / `error` / timeout 8s; на ошибке → `is-placeholder`
- **Enrich images:** `pickProductImage` — `first_image` / `images[0]` / `image` / `image_url`; map id через `String(id)`
- **Fix 404 href:** убран fallback `/product_by_id/{id}`; `resolveProductUrl` — `url` / `html_url` / `/product/{permalink|handle}`; без URL карточка отбрасывается (`#` только как страховка в render)
- **Hidden products:** после enrich исключаются `is_hidden` / `hidden` / `archived` / `published:false`; OOS на витрине остаётся с бейджем «Нет в наличии»
- **OOS filter:** при `hide_items_out_of_stock` (AjaxSearch.data / Shop.config) клиент дополнительно скрывает товары без доступных variants

## v0.0.24 — stock badge overlay, lazy articles (2026-07-21)

- **Stock badge overlay:** «Нет в наличии» поверх фото товара (absolute overlay на `.df-quick-search__product-image-wrap`, полупрозрачная полоса снизу)
- **Настройка `show_out_of_stock_badge`:** checkbox, default ON — «Показывать «Нет в наличии» на карточке»; работает при `show_photos=true`
- **Phase 3 — lazy articles index:** `articles_lazy_load` (default ON) — JSON в `<script id="df-qs-articles-index">`, парсинг только при первом открытии панели или первом поиске; при OFF — eager parse как v0.0.23
- **Liquid limit:** paginate 100/blog без изменений; «Все статьи →» для 500+ статей
- **Документация:** README (полный feature list, таблица настроек, armedf.ru, чеклист), FEATURES.md (функционал, плюсы, для кого), info*.json, help texts

## v0.0.23 — SCSS max() compile fix (2026-07-21)

- **grid auto-fill:** Sass `max()` / `min()` конфликтовали с CSS `max()` / `min()` в `minmax()` + `calc()` + CSS vars — `#{"min(...)"}` интерполяция для mobile / tablet / desktop breakpoints (inSales SCSS compiler)

## v0.0.22 — grid fill, adaptive sidebar, Phase 2 (2026-07-21)

- **Fix grid width (Issue 1):** убран ultra-wide `max-width` cap; сетка `repeat(auto-fill, minmax(...))` заполняет `.df-quick-search__main` на широких экранах; `cols_*` — минимум колонок на breakpoint
- **Adaptive sidebar articles (Issue 2):** после render на desktop вычисляется `sidebarArticlesVisibleCount` по доступной высоте sidebar; пересчёт на `resize` (debounced); `articles_display_limit` — минимум и шаг «Показать ещё»
- **2.1 Search cache:** in-memory `Map`, TTL 60s; инвалидация при закрытии панели
- **2.2 Incremental load more:** append карточек товаров/статей без полного re-render; полный re-render только для нового запроса
- **2.3 A11y:** focus trap в панели (Tab cycles); `aria-live="polite"` — объявление количества результатов; restore focus на триггер при закрытии
- **2.4 Recent searches:** последние 5 запросов в `sessionStorage`; chips при пустом input / query < 2
- **2.5 Analytics:** optional `dataLayer` events — `df_qs_search`, `df_qs_product_click`, `df_qs_zero_results`, `df_qs_category_click`
- **2.6 Stock badge:** «Нет в наличии» на карточке, если все variants unavailable (edge cases после enrich)
- **2.7 Chunk `/products_by_id`:** запросы по 40 id, merge результатов
- **2.8 Tests:** `widget/tests/fetch.test.js` — cache hit, filter, chunk, fetch chain mock

## v0.0.21 — Phase 1 quick wins (2026-07-21)

- **«Все результаты (N)»:** ссылка под сеткой товаров на `/search?q=…` (тот же URL, что и Enter); показывается при любой ненулевой выдаче, в т.ч. после исчерпания локального «Показать ещё»
- **Enter / submit формы:** переход на страницу полного поиска вместо только `preventDefault`
- **Фильтр `filterProductsByQuery`:** убран fallback на нерелевантные результаты API — пустой массив, если strict match не нашёл совпадений
- **Честный load more:** кнопка скрывается, когда `allProducts.length <= visibleCount`; подпись «Показать ещё (N из M)»
- **Подсветка запроса:** `<mark class="df-quick-search__mark">` в заголовках товаров и статей (case-insensitive, кириллица)
- **Zero-results UX:** «Ничего не найдено по запросу «…»», ссылка на `/search?q=`, до 5 категорий из collections JSON при `show_categories`
- **Ultra-wide:** `max-width: min(100%, calc(var(--df-qs-cols-desktop) * 13rem))` на сетке desktop
- **Триггеры armedf.ru:** дефолт дополнен `.header__search-btn`, `.js-open-search-panel`, `.js-show-search`
- **Документация:** README, info*.json — актуальное коммерческое описание v0.0.21

## v0.0.20 — default blog URL (2026-07-21)

- **Дефолт `articles_blog_url`:** `/blog` в `settings_data.json`, `settings_form.json` и Liquid fallback при пустом значении

## v0.0.19 — all articles blog link (2026-07-21)

- **Настройка `articles_blog_url`:** ссылка на страницу блога для кнопки «Все статьи →» (например `/blog`, `/articles`); fallback — `/blog` или первый handle из `article_blog_handles`
- **Кнопка «Все статьи →»:** после исчерпания локальных совпадений или сразу, если индекс неполный (на сервере больше статей, чем в Liquid paginate 100) — в sidebar (desktop) и вкладке «Статьи» (mobile); «Показать ещё» сохраняется, пока есть непоказанные совпадения в клиентском индексе
- **Liquid:** `data-articles-server-total` — сумма `articles_count` по блогам (для определения неполного индекса vs paginate 100)
- **Стили:** `.df-quick-search__all-articles` — оформление как у load more, но ссылка

## v0.0.18 — preserve scroll on load more (2026-07-21)

- **Fix:** «Показать ещё» больше не сбрасывает прокрутку в соседних колонках — перед partial re-render сохраняются `scrollTop` для `.df-quick-search__main`, `.df-quick-search__articles--sidebar` и `.df-quick-search__results` (mobile), затем восстанавливаются
- **Сохранено:** scroll-to-top при смене вкладки, полный сброс при новом поиске, spinner overlay

## v0.0.17 — fix desktop scroll regression (2026-07-21)

- **Fix:** восстановлена независимая прокрутка `.df-quick-search__main` и `.df-quick-search__articles--sidebar` на desktop — обёртка `.df-quick-search__results-content` получила `flex: 1`, `min-height: 0`, `overflow: hidden` в flex-цепочке (регрессия v0.0.16)
- **Сохранено:** spinner overlay поверх результатов, mobile scroll на `.df-quick-search__results`, sticky tabs

## v0.0.16 — spinner overlay preloader (2026-07-21)

- **Preloader поиска:** skeleton-сетка заменена на spinner overlay поверх `.df-quick-search__results` — предыдущие результаты остаются видимыми под полупрозрачным затемнением
- **Поведение:** overlay показывается при запросе (query ≥2), скрывается при отрисовке результатов, пустой выдаче или ошибке
- **Разметка:** контент результатов вынесен в `.df-quick-search__results-content`, spinner — sibling-overlay внутри `.df-quick-search__results`

## v0.0.15 — numeric limits, search preloader, mobile sticky tabs (2026-07-21)

- **Настройки `results_limit` и `articles_display_limit`:** type `number`, любое целое в диапазоне 1–200 / 1–100 (не только пресеты select)
- **Статьи sidebar:** начальная порция = `articles_display_limit` (убран hardcoded `SIDEBAR_ARTICLES_MAX = 6`); load more — тем же шагом
- **Preloader поиска:** skeleton-сетка (shimmer) в `.df-quick-search__results` при вводе запроса, до отрисовки результатов или ошибки
- **Mobile sticky:** tabs липнут под полем поиска при прокрутке; категории (`--rail`) больше не sticky; при смене вкладки scroll results → top
- **Desktop:** без изменений layout

## v0.0.14 — desktop scroll + sidebar articles load more (2026-07-21)

- **Desktop scroll:** `.df-quick-search__results` не скроллится целиком — отдельная прокрутка в `.df-quick-search__main` (товары) и `.df-quick-search__articles--sidebar` (статьи)
- **Sidebar статьи:** «Все статьи →» заменено на «Показать ещё» — порции по `articles_display_limit`, начальная порция 6, счётчик «N из M»
- **Mobile:** без изменений — tabs, load more статей в tab panel, общий scroll results

## v0.0.13 — split layout (Variant B) (2026-07-21)

- **Desktop (≥768px):** двухколоночный layout — sidebar ~240px (категории + до 6 статей + «Все статьи →»), main — сетка товаров и «Показать ещё»
- **Mobile (<768px):** sticky chips категорий под полем поиска; tabs «Товары (N)» | «Статьи (N)», default — Товары
- **A11y:** `role="tablist"`, `aria-selected`, keyboard navigation (стрелки, Home/End)
- **Сохранено:** load more товаров/статей, счётчики, skeleton, old price, cols, scroll lock, все настройки видимости

## v0.0.12 — articles pagination (2026-07-21)

- **Статьи:** убран жёсткий `slice(0, 8)` — полный список в `state.matchedArticles`, показ порциями
- **Настройка `articles_display_limit`:** 8 / 12 / 16 / 24 (дефолт 8) — размер первой порции и шаг «Показать ещё»
- **Счётчик статей:** «Статьи (8 из 58)» при усечении, «Статьи (58)» когда показаны все
- **Кнопка «Показать ещё»** в секции статей — по аналогии с товарами

## v0.0.11 — SCSS min() compile fix (2026-07-21)

- **max-width сетки:** Sass `min()` конфликтовал с CSS `min()` на `calc()` + CSS vars — заменено на `#{"min(...)"}` интерполяцию в `snippet.scss` (inSales SCSS compiler)

## v0.0.10 — skeleton, scroll lock, count, articles, grid cols (2026-07-21)

- **Skeleton preloader:** shimmer на `.df-quick-search__product-image-wrap.is-skeleton` — пустое фото, ошибка загрузки; `onload` снимает класс
- **Body scroll lock:** `position: fixed` + сохранение/восстановление scrollY при открытии/закрытии панели (iOS); `.df-quick-search__results` прокручивается внутри
- **Счётчик товаров:** заголовок «Товары (N)» — полный merged list до «Показать ещё»
- **Поиск статей (MVP):** настройки `show_articles` (default off), `article_blog_handles`; индекс из Liquid `blogs[handle].articles`; фильтр по title, tags, related products. Публичного API нет — см. README
- **Колонки сетки:** настройки `cols_mobile` / `cols_tablet` / `cols_desktop` (2–6); CSS vars `--df-qs-cols-*`, breakpoints 767 / 768–1199 / 1200+; max-width сетки на ultra-wide

## v0.0.9 — results limit, old price, search docs (2026-07-21)

- Настройка `results_limit` (12 / 24 / 48), дефолт 24; убран жёсткий cap `RESULT_LIMIT = 12` в JS
- Гибридная выдача: `/search_suggestions` (как AjaxSearch) + дополнение из `/search.json` без `per_page`, если suggestions меньше лимита
- Параметр `limit` в запрос suggestions (недокументирован; сервер inSales обычно отдаёт ~10–12)
- Кнопка «Показать ещё» — подгружает следующую порцию из уже полученного списка
- Старая цена: `variants[0].old_price` после enrich через `/products_by_id`, стиль `.df-quick-search__product-price-old`
- Комментарий в `snippet.js` + раздел «Архитектура поиска» в README

## v0.0.8 — suggestions display fix (2026-07-21)

- Цены: чтение `fields.price_min` из ответа `/search_suggestions` (inSales кладёт цену во вложенный `fields`, не в корень)
- Фото и категории: обогащение результатов через `/products_by_id/{ids}.json` — suggestions не отдаёт `first_image` и `canonical_url_collection_id`
- `account_id` / `locale`: fallback на `Shop.config` и `meta[name="shop-config"]` (на armedf.ru `window.Site.account` пустой)
- Формат фото: добавлен вариант «Портрет (3:4)» (`portrait-34`)
- Скролл: `min-height: 0` + `overflow-y: auto` на `.df-quick-search__results` — прокрутка внутри панели при заблокированном body

## v0.0.7 — search_suggestions + race fix (2026-07-21)

- Поиск переведён с `/search.json` на `/search_suggestions` (как платформенный AjaxSearch inSales)
- Параметры как у AjaxSearch: `query`, `account_id`, `locale`, `fields[]=price_min` (не `/search.json`)
- Защита от гонки: `searchSeq` + `AbortController` — устаревшие ответы не перезаписывают актуальные
- Триггеры: только `click` в capture-фазе (убран preventDefault на touchstart/pointerdown)

## v0.0.6 — fix panel layout (2026-07-21)

- Убран перенос панели в `body` — из-за scoped CSS inSales стили слетали
- Критичные стили оверлея/панели вынесены в глобальный `<style>` в `snippet.liquid`

## v0.0.5 — fix initWidget crash (2026-07-21)

- Исправлена ошибка `Cannot read properties of undefined (reading 'classList')` — `panel` использовался до объявления
- После переноса панели в `body` результаты ищутся по сохранённой ссылке, не через `root.querySelector`

## v0.0.4 — z-index, trigger block, search fix (2026-07-21)

- Максимальный z-index для панели и оверлея — всегда поверх шапки и модалок темы
- Триггеры перехватываются в capture-фазе: `stopImmediatePropagation` блокирует их собственный JS
- Поиск через jQuery `$.ajax` (как в примере шапки), fallback на `fetch`
- Убран `per_page` из запроса (вероятная причина HTTP 555 на armedf.ru)
- Поиск по названию и артикулу (`variants.sku`), категории из товаров + по названию из JSON

## v0.0.3 — fullscreen panel + trigger selectors (2026-07-21)

- Поиск открывается полноэкранной панелью с тёмным оверлеем
- Закрытие по клику на оверлей, кнопку × и Escape
- Добавлена настройка `trigger_selectors` — CSS-селекторы через запятую для открытия поиска
- Дефолтные триггеры: `.header__search`, `.header__search-form`, `.header__search-field`

## v0.0.2 — quick search controls (2026-07-21)

- Реализован live-поиск по `/search.json` с дебаунсом и выдачей внутри виджета
- Добавлены настройки: enabled, show_photos, show_prices, show_categories, hide_zero_price, image_ratio
- Добавлен фильтр «не показывать товары с нулевой ценой»
- Добавлены форматы изображений товаров: square, portrait, landscape, natural
- Подготовлены два манифеста: `widget/info.gen2.json` и `widget/info.gen4.json`

## v0.0.1 — scaffold (2026-07-21)

- Создан проект `projects/df_quick_search/`, handle `danforge_quick_search`
- Пустой каркас виджета inSales gen-4
- Папка `examples/` для референсов от заказчика
