# Быстрый поиск — виджет inSales (DanForge)

**Handle:** `danforge_quick_search`  
**Папка:** `projects/df_quick_search/`  
**Версия:** v1.2.1  
**Статус:** stable / production-ready

Полноэкранный быстрый поиск для интернет-магазинов inSales: live-выдача с фото, ценами, категориями, опционально статьями блога. Layout B (split desktop / tabs mobile), сортировка, раскладка RU↔EN, popular/recent queries. Совместим с платформенным AjaxSearch.

> Коммерческое описание, плюсы и целевая аудитория — в [FEATURES.md](./FEATURES.md).

---

## Содержание

1. [Функции по категориям](#функции-по-категориям)
2. [Архитектура поиска](#архитектура-поиска)
3. [Настройки](#настройки)
4. [Установка](#установка)
5. [armedf.ru](#armedfru)
6. [Тесты](#тесты)
7. [Чеклист превью / загрузки](#чеклист-превью--загрузки)
8. [Известные ограничения](#известные-ограничения)
9. [История версий](#история-версий)
10. [Состав проекта](#состав-проекта)

---

## Функции по категориям

### Search (поиск)

- Live-поиск с debounce 300 ms, минимум 2 символа
- Гибрид: `/search_suggestions` + дополнение из `/search.json` при нехватке результатов
- Переиспользование `AjaxSearch.path` / `AjaxSearch.data` when available
- Поиск по названию и SKU (артикул) всех вариантов
- Строгая клиентская фильтрация — без нерелевантных fallback-результатов
- Enrich через `/products_by_id/{ids}.json` (chunk по 40 id)
- Скрытие hidden/archived/`published:false` после enrich; OOS-фильтр при `hide_items_out_of_stock`
- In-memory кэш 60s, сброс при закрытии панели
- Race protection: `searchSeq` + `AbortController`
- Enter / «Все результаты (N)» → `/search?q=…` (ссылка управляется `show_all_results`)
- **Layout fix RU↔EN** (всегда включён): при пустой выдаче пробует другую раскладку (`рщтвф` → `honda`); баннер при успехе
- Недавние запросы (до 5) в sessionStorage — **только успешные** (товары и/или статьи > 0); сохраняется исправленный запрос после layout-fix
- Популярные запросы из настройки админки (CSV, до 12 чипов)

### UI/UX

- Полноэкранная панель + тёмный оверлей
- Настраиваемые CSS-триггеры (capture-phase, `stopImmediatePropagation`)
- Закрытие: оверлей, ×, Escape
- Spinner overlay — предыдущие результаты видны под затемнением
- Skeleton shimmer на карточках; без URL фото — `is-placeholder` (не вечный skeleton)
- Body scroll lock с восстановлением позиции (iOS-safe)
- Подсветка запроса `<mark>` в заголовках
- Zero-results: ссылка на /search; до 5 категорий; **empty-message скрыт**, если показаны категории
- «Показать ещё (N из M)» — честный счётчик, incremental append
- Сохранение scroll при load more (desktop split-layout) и scrollTop категорий sidebar
- Padding перед scrollbar на desktop scroll-контейнерах

### Layout B

- **Desktop (≥768px):** split — sidebar (категории + статьи) + main (товары); независимый scroll колонок
- **Категории в sidebar:** собственный `overflow-y: auto`; без статей — flex fill; со статьями — adaptive split (JS measure, не 50/50)
- **Mobile (<768px):** rail категорий + sticky tabs «Товары» | «Статьи»
- Адаптивный sidebar статей по высоте; `articles_display_limit` — минимум и шаг load more

### Products (товары)

- Карточки: фото, название, цена, зачёркнутая старая цена
- Цены в ряду карточек выровнены по нижнему краю (`height: 100%` + `margin-top: auto`)
- Бейдж «Нет в наличии» overlay на фото (`show_out_of_stock_badge`)
- Сортировка: по умолчанию (порядок поиска), цена ↑/↓, популярность (`show_product_sort`)
- Фильтр `hide_zero_price`
- Лимит выдачи 1–200 (`results_limit`)
- Форматы фото: square, portrait, portrait-34, landscape, natural
- Адаптивная сетка 2–6 колонок (mobile / tablet / desktop); auto-fill заполняет ширину
- Корректный URL товара (`url` / `html_url` / permalink); без URL карточка отбрасывается

### Categories (категории)

- Из найденных товаров + по названию из Liquid JSON коллекций
- При коллизии названий — подпись `Родитель · Категория` (или `Название · slug`)
- Desktop sidebar / mobile rail

### Articles (статьи)

- Опционально (`show_articles`, default OFF)
- Liquid-индекс из `blogs[handle].articles[i]` — **все** статьи блога(ов), title, tags, related products
- Фильтр: заголовок, теги, связанные товары
- Несколько блогов через `article_blog_handles`
- Load more порциями (`articles_display_limit`)
- «Все статьи →» на `articles_blog_url`
- Lazy parse индекса (`articles_lazy_load`, default ON)
- localStorage cache parsed-индекса (24 ч)
- Liquid `{% cache %}` индекса по `articles.size` + handle + locale

### Settings (настройки)

- **21 параметр** в группе «Основные» (см. таблицу ниже)
- Независимое вкл/выкл: фото, цены, категории, статьи, бейдж, сортировка, «Все результаты»
- `enabled` и `show_articles` с `enable_server_reload`

### Performance

- Lazy articles index — парсинг при первом открытии/поиске
- Liquid `{% cache %}` — не пересобирает indexed loop на каждый page view при том же `articles.size`
- Articles localStorage cache — без повторного JSON.parse
- Search cache 60s; chunked products_by_id (40 id); incremental DOM при load more

### A11y

- `role="dialog"`, `aria-modal`, focus trap (Tab)
- `aria-live="polite"` — объявление результатов
- Restore focus на триггер
- Tabs: keyboard navigation (стрелки, Home, End)

### Analytics

- `dataLayer` events (optional): `df_qs_search`, `df_qs_product_click`, `df_qs_zero_results`, `df_qs_category_click`, `df_qs_layout_fix`

### Compatibility

- inSales gen 2 и gen 4
- jQuery `$.ajax` + fetch fallback
- `Shop.config` / `meta[name="shop-config"]` fallback
- Inline critical styles: overlay/panel (+ gen-2 chrome: × / input / chips) — страховка при 404 CSS-asset
- z-index 2147483646

---

## Архитектура поиска

Виджет **не подменяет** платформенный `AjaxSearch` в шапке — открывает **собственную панель** по клику на триггеры.

| Этап | Endpoint | Зачем |
|------|----------|-------|
| 1. Suggestions | `GET /search_suggestions` | Быстрый autocomplete, кириллица. Params как у `AjaxSearch.data`: `query`, `account_id`, `locale`, `fields[]`, `hide_items_out_of_stock`. Путь из `AjaxSearch.path`. |
| 2. Enrich | `GET /products_by_id/{ids}.json` | Фото, категории, variants/old_price, popularity. Chunk по 40 id. |
| 3. Supplement | `GET /search.json?q=…&lang=…` | Если suggestions < `results_limit`. **Без `per_page`** — HTTP 555 на armedf.ru. |
| 4. Filter | JS `productMatchesQuery` | Title + SKU; пустая выдача без fallback. |
| 5. Layout fix | Клиент | При 0 товаров+статей — retry с другой раскладкой клавиатуры. |

**Статьи:** публичного API нет. Индекс из Liquid — все статьи указанных блогов. Кеш parsed-индекса в `localStorage` (24 ч). JSON всё ещё в HTML страницы.

**Лимиты API:** suggestions ~10–12 позиций; «Показать ещё» и сортировка — client-side из загруженного списка.

---

## Настройки

Полная таблица из `settings_form.json` (22 пункта):

| Имя | Label | Тип | Default | Описание |
|-----|-------|-----|---------|----------|
| `enabled` | Включить быстрый поиск | checkbox | `true` | Вкл/выкл виджет. Server reload. |
| `placeholder` | Подсказка в поле поиска | text | `Поиск по каталогу` | Placeholder input |
| `popular_queries` | Популярные запросы | text | `""` | CSV через запятую; чипы при пустом поле рядом с недавними (max 12) |
| `trigger_selectors` | Селекторы открытия поиска | text | `.header__search, …` | CSS через запятую |
| `show_photos` | Показывать фото товаров | checkbox | `true` | Фото на карточках |
| `image_url_size` | Качество фото в поиске | select | `auto` | auto / compact / medium / thumb / small / large |
| `hover_second_image` | Второе фото при наведении | checkbox | `true` | Crossfade 2-го фото на ПК при hover |
| `product_photo_slider` | Слайдер (до 4 фото) | checkbox | `false` | Зоны на ПК / свайп; перебивает crossfade |
| `show_out_of_stock_badge` | Показывать «Нет в наличии» на карточке | checkbox | `true` | Overlay на фото; только при `show_photos=true` |
| `show_prices` | Показывать цены товаров | checkbox | `true` | Цена + old price |
| `show_product_sort` | Сортировка товаров в выдаче | checkbox | `true` | Цена / популярность; default — порядок поиска |
| `show_all_results` | Ссылка «Все результаты» | checkbox | `true` | Кнопка на `/search?q=…` под сеткой |
| `show_categories` | Показывать категории | checkbox | `true` | Sidebar (desktop) / rail (mobile) |
| `show_articles` | Показывать статьи блога в результатах | checkbox | `false` | Liquid-индекс; server reload |
| `articles_lazy_load` | Отложенная загрузка индекса статей | checkbox | `true` | Parse JSON при первом открытии/поиске; далее localStorage |
| `article_blog_handles` | Handles блогов для поиска статей | text | `blog` | Через запятую: `blog, shop-reviews` |
| `articles_display_limit` | Статей в первой порции | number 1–100 | `8` | Sidebar + вкладка «Статьи»; шаг load more |
| `articles_blog_url` | Ссылка на страницу блога | text | `/blog` | Кнопка «Все статьи →» |
| `hide_zero_price` | Не показывать товары с нулевой ценой | checkbox | `false` | Фильтр price_min = 0 |
| `results_limit` | Количество товаров в выдаче | number 1–200 | `24` | Первая порция и шаг «Показать ещё» |
| `image_ratio` | Формат фото товаров | select | `square` | square / portrait / portrait-34 / landscape / natural |
| `cols_mobile` | Товаров в ряд (mobile, ≤767px) | select | `2` | 2–6 |
| `cols_tablet` | Товаров в ряд (tablet, 768–1199px) | select | `3` | 2–6 |
| `cols_desktop` | Товаров в ряд (desktop, ≥1200px) | select | `4` | 2–6; auto-fill заполняет ширину |

---

## Установка

### Gen 4 (SimpleWidget) — primary для generation 4

1. Манифест: `info.gen4.json` → `info.json` (или текущий `info.json`, если уже gen 4)
2. Админка → **Виджеты** → загрузить файлы из `widget/`:
   - `info.json`, `snippet.liquid`, `snippet.js`, `snippet.scss`
   - `settings_form.json`, `settings_data.json`
3. Добавить виджет в зону **header** или **outside**
4. Настроить `trigger_selectors` под тему; включить `enabled`
5. При необходимости — статьи (`show_articles`, handles, blog URL); smoke: кириллица, SKU, desktop/mobile

### Gen 2 (theme-snippet) — primary для generation 2

**Основной канал:** пакет [`widget-gen2/`](./widget-gen2/) — сниппет темы + `settings.html` (паттерн nivona).  
Полная инструкция: [widget-gen2/docs/install.md](./widget-gen2/docs/install.md).

Кратко: залить `snippets/df_quick_search.liquid` + `media/df_quick_search.{js,css}` → fieldset в `settings.html` → keys в `settings_data.json` → `{% include "df_quick_search" %}` перед `scripts` в `layouts.layout.liquid`.

**Важно при обновлении:** заливать **liquid + CSS вместе**. В liquid — critical `<style>` (overlay/panel + chrome ×/input/chips); полный вид — из CSS-asset. После заливки: DevTools → `df_quick_search.css` **200**, hard refresh. Разница «~973 строк SCSS → ~813–825 CSS» — нормальная компиляция, не усечение.

**Запасной канал:** `widget/info.gen2.json` (SimpleWidget без `header`/`outside`) — только для магазинов с рабочими widget zones. На nivona-like кастомных темах **недостаточно** одной смены манифеста.

---

## armedf.ru

Проверен на [armedf.ru](https://armedf.ru). Референсы темы — в `Пример/Шапка/`.

| Проблема | Решение в виджете |
|----------|-------------------|
| HTTP 555 на `/search.json` | Не отправляем `per_page` |
| `window.Site.account` пустой | Fallback `account_id` через `Shop.config` / meta |
| Кириллица в поиске | `/search_suggestions` (как AjaxSearch) |
| JS темы перехватывает клик | Capture-phase + `stopImmediatePropagation` |
| 500+ статей в блоге | Liquid `{% cache %}` по `articles.size`; JSON в HTML; client localStorage; «Все статьи →» |
| Опечатка раскладки (рщтвф) | Layout fix RU↔EN — retry + баннер |

**Дефолтные триггеры для armedf.ru:**

```
.header__search, .header__search-form, .header__search-field, .header__search-btn, .js-open-search-panel, .js-show-search
```

**Рекомендуемые настройки для content+commerce:**

- `show_articles`: ON
- `article_blog_handles`: handles ваших блогов
- `articles_blog_url`: `/blog` (или ваш путь)
- `articles_lazy_load`: ON (default)
- `show_product_sort` / `show_all_results`: ON (default)

---

## Тесты

```bash
cd projects/df_quick_search
node widget/tests/settings.test.js
node widget/tests/fetch.test.js
node widget/tests/categories.test.js
```

`settings.test.js` — defaults, data-атрибуты, sort, layout-fix, recent, empty-message.  
`fetch.test.js` — cache hit, filter, chunk, fetch chain (mock).  
`categories.test.js` — parent labels при коллизии названий.

---

## Чеклист превью / загрузки

### Файлы перед заливкой

- [ ] Версия **v1.1.3** в README / FEATURES / CHANGELOG
- [ ] Gen-2: liquid critical chrome (× / input / chips) + CSS asset **200**
- [ ] Цены карточек в одном ряду выровнены по нижнему краю (разные длины названий)
- [ ] `info.json` — нужный generation (gen2 или gen4)
- [ ] `settings_form.json` ↔ `settings_data.json` ключи совпадают
- [ ] `snippet.liquid` / `.js` / `.scss` загружены
- [ ] Тесты: `node widget/tests/*.test.js` — exit 0

### Открытие / закрытие

- [ ] Клик по триггеру в шапке открывает панель
- [ ] Оверлей, ×, Escape закрывают панель
- [ ] Body scroll заблокирован; позиция восстанавливается
- [ ] Focus возвращается на триггер

### Поиск товаров

- [ ] Ввод ≥2 символов — spinner, затем результаты
- [ ] Поиск по названию (кириллица) и SKU
- [ ] Layout fix: `рщтвф` → результаты для `honda` + баннер
- [ ] Фото, цена, old price; бейдж «Нет в наличии» (ON/OFF)
- [ ] Сортировка цена / популярность обновляет сетку
- [ ] «Показать ещё (N из M)» — incremental, scroll сохраняется
- [ ] «Все результаты» ON/OFF (`show_all_results`); Enter → `/search?q=…`
- [ ] Empty: категории без текста «Ничего не найдено…»; ссылка на /search есть

### Настройки видимости (ON и OFF)

- [ ] `show_photos`, `image_url_size`, `product_photo_slider`, `hover_second_image`, `show_prices`, `show_categories`, `show_product_sort`, `show_all_results`, `show_out_of_stock_badge`
- [ ] `hide_zero_price` ON — товары с ценой 0 скрыты
- [ ] `enabled` OFF — виджет скрыт

### Layout

- [ ] Desktop: sidebar + main, независимый scroll; длинный список категорий скроллится
- [ ] Mobile: sticky tabs под полем
- [ ] `cols_*` — сетка на breakpoints
- [ ] Gap перед scrollbar на desktop

### Статьи (если `show_articles` ON)

- [ ] Статьи в sidebar / tab; load more; «Все статьи →»
- [ ] `articles_lazy_load` — индекс не парсится до открытия
- [ ] Повторное открытие — articles из localStorage при том же cache key

### Recent / popular

- [ ] Недавние — только после успешного поиска
- [ ] Popular CSV chips рядом с recent / только popular

### A11y

- [ ] Tab cycles внутри панели; aria-live объявляет результаты

---

## Известные ограничения

| Ограничение | Детали |
|-------------|--------|
| Статьи: вес HTML | Полный JSON индекса в HTML при `show_articles`; Liquid cache снимает серверный loop, client cache — parse; вес ответа остаётся |
| Статьи: cache key | Инвалидация по `articles.size` (+ locale); правка title без смены size может отдать старый Liquid-кеш |
| Статьи: нет API | Только Liquid-индекс |
| Товары: client-side pagination / sort | «Показать ещё» и сортировка — по уже загруженному буферу |
| Suggestions limit | `/search_suggestions` ~10–12; supplement из `/search.json` |
| Layout-suggest UI | Empty-state блок «Возможно, вы имели в виду…?» временно скрыт (v0.0.36); retry раскладки и баннер успеха работают |
| `show_articles` / `enabled` | Server reload |

---

## История версий

| Версия | Ключевые изменения |
|--------|-------------------|
| **v1.1.3** | Fix hover 2nd image (`any-hover`) + `hover_second_image` toggle |
| **v1.1.2** | Fix USD price symbol (₽ → $) when Shop.config.get returns whole config |
| **v1.1.1** | Fix locale object → string (`[object Object]` 500) |
| **v1.1.0** | Multi-lang titles/chrome + currency-aware prices |
| **v1.0.10** | Appear-анимация выдачи; desktop hover → 2-е фото; i18n анализ (код → v1.1) |
| **v1.0.9** | Gen-2: critical chrome в liquid (×/input/chips) + CSS recompile; «972→825» = SCSS≠усечение |
| **v1.0.8** | Цены карточек товаров прижаты к низу (`margin-top: auto` + `height: 100%`) |
| **v1.0.7** | Gen-2 critical CSS — overlay/panel `display:none` + `position:fixed` (inline + asset); fix leak ×/«ПОИСК» |
| **v1.0.6** | Gen-2 re-upload — same syntax fix as v1.0.5 (live Gen-2 sync was incomplete) |
| **v1.0.5** | Syntax fix — restore `handleLoadMoreProducts` declaration (Gen-4 parse error) |
| **v1.0.4** | Adaptive sidebar split (JS measure) — cats/articles hug or share 25–70% |
| **v1.0.3** | Category chips hug content — no vertical stretch in sidebar list |
| **v1.0.2** | Sidebar 50/50 CSS grid; product cols `minmax(0,1fr)` — no h-scroll / category shrink |
| **v1.0.1** | Categories 50% with articles; no h-scroll products/articles |
| **v1.0.0** | Stable release — production-ready сводка всех фич 0.0.x |
| **v0.0.37** | Empty-message скрыт при категориях |
| **v0.0.36** | Recent только с hits; hide layout-suggest UI |
| **v0.0.35** | Gap / padding перед scrollbar |
| **v0.0.34** | Scroll категорий в desktop sidebar |
| **v0.0.33** | Layout fix на empty с категориями |
| **v0.0.32** | Layout fix всегда on (без настройки) |
| **v0.0.31** | Исправление раскладки RU↔EN |
| **v0.0.30** | Fix sort re-render; `show_all_results` |
| **v0.0.29** | Сортировка цена / популярность |
| **v0.0.28** | Полный индекс статей; Liquid + localStorage cache |
| **v0.0.27** | Popular queries chips |
| **v0.0.26** | Category chip parent labels |
| **v0.0.25** | Skeleton fix; URL; hidden products |
| **v0.0.24** | Stock badge; lazy articles |
| **v0.0.23** | SCSS max() compile fix |
| **v0.0.22** | Grid fill; adaptive sidebar; Phase 2 |
| **v0.0.21** | «Все результаты»; Enter; strict filter; armedf triggers |
| **v0.0.20–v0.0.13** | Blog link, scroll, spinner, Layout B, articles pagination |
| **v0.0.12–v0.0.1** | Articles MVP → scaffold |

Полный CHANGELOG: [CHANGELOG.md](./CHANGELOG.md).

---

## Состав проекта

```
df_quick_search/
├── FEATURES.md          — функционал, плюсы, для кого (коммерческое)
├── CHANGELOG.md
├── README.md
├── Пример/              — референсы armedf.ru (шапка)
├── widget/              — gen-4 SimpleWidget (SSOT JS/SCSS)
│   ├── info.json        — манифест gen-4 (текущий)
│   ├── info.gen2.json   — запасной SimpleWidget gen-2
│   ├── info.gen4.json
│   ├── snippet.liquid
│   ├── snippet.js
│   ├── snippet.scss
│   ├── settings_form.json
│   ├── settings_data.json
│   └── tests/
└── widget-gen2/         — ★ primary gen-2 theme-snippet поставка
    ├── docs/install.md
    ├── snippets/df_quick_search.liquid
    ├── config/
    ├── media/
    └── patches/
```

---

## Лицензия

Коммерческая. Один магазин — одна лицензия.

**DanForge** · https://danforge.ru
