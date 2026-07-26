# Анализ: gen-2 поставка быстрого поиска DanForge

**Task ID:** `2026-07-23-df-quick-search-gen2`  
**Дата:** 2026-07-23  
**Продукт gen-4:** `projects/df_quick_search/` (v1.0.0, handle `danforge_quick_search`)  
**Референс-тема gen-2:** `projects/Пример 2 поколения/nivona.ru/`  
**Смежный прецедент:** `df_reviews_slider_gen2` + `artifacts/2026-07-20-reviews-content-cli-gen2/04-gen2-nivona-analysis.md`

---

## Цель

Спроектировать **отдельную версию** виджета быстрого поиска для inSales **generation 2**. Gen-4 уже готов. Нужно понять: достаточно ли смены `info.json` → SimpleWidget gen-2, или нужна **отдельная поставка** как theme snippets + `settings.html`.

---

## Контекст

### Факты (продукт gen-4)

- Полноэкранная панель поиска; не подменяет AjaxSearch, перехватывает клики по CSS-триггерам.
- 21 настройка в `settings_form.json` → Liquid читает **`widget_settings.*`** → пишет `data-*` на root → JS читает `root.dataset.*`.
- Манифесты: `info.gen4.json` (есть `header`, `outside`) и `info.gen2.json` (без них). Текущий `info.json` = gen-4.
- `snippet.liquid` завязан **только** на `widget_settings` (нет fallback на `settings.*`).

### Факты (тема nivona / gen-2)

- Layout: `templates/layouts.layout.liquid` — `head` → `header` → `content_for_layout` → `footer` → `modals` → `scripts`. **Нет** циклов `widget_lists.*`.
- Поиск в шапке: `snippets/header.liquid` → `.header_search` + form `/search` (input `#header-search`). Отдельный `snippets/search_widget.liquid` — простая форма.
- `media/search.js` — **пустой** файл; live-AjaxSearch в теме не реализован (штатная отправка формы).
- Настройки темы: `config/settings.html` (HTML fieldset/table) + дефолты в `config/settings_data.json` → в Liquid/JS как **`settings.key`**.
- Паттерн передачи в JS (`snippets/scripts.liquid`): inline `var x = '{{ settings.foo }}';` / `{% if settings.bar %}true{% else %}false{% endif %}`.
- Чекбоксы в `settings_data.json` часто хранятся как **`"1"`** (вкл); выкл — ключ отсутствует или пусто.
- Кастомная тема: `not_need_shop_bundle: true` — upload SimpleWidget **не гарантирует** вывод без правки шаблона (см. отзывы gen-2).

### Ограничение knowledge

`knowledge/platforms/insales-widgets.md` описывает **gen-4 платформенные виджеты** (`settings_form.json`, CSS vars на `.layout`, editor lists). К theme `settings.html` / gen-2 snippets **применимо частично**:

| Правило из knowledge | Gen-4 widget | Gen-2 theme settings |
|----------------------|--------------|----------------------|
| underscore names | да | да (рекомендуется `df_qs_*`) |
| checkbox absent ≠ false | да | да (часто `"1"` / absent) |
| select `[label, value]` quirks | да | иначе: HTML `<select><option value>` |
| editor `--setting-name` на `.layout` | да | **нет** |
| `enable_server_reload` | да | **нет** (сохранение темы = полный reload) |

---

## Stakeholders / ЦА

| Кто | Интерес |
|-----|---------|
| Владелец DanForge | Продажа клиентам на gen-2 темах; понятная установка |
| Клиент (магазин gen-2) | Быстрый поиск как у gen-4; настройка без кода |
| Разработчик темы | Минимальный patch layout/header; префикс настроек без коллизий |
| Architect / Programmer | Один JS-core vs два пакета; контракт settings → data-* |

---

## 1. Как устроен gen-2 на nivona

```
config/settings.html          → UI настроек темы (fieldset / table / input name=…)
config/settings_data.json     → presets.current дефолты (часто "1" для checkbox)
snippets/*.liquid             → {% include "…" %} из layout / друг друга
templates/layouts.*.liquid    → единственная «точка сборки» страницы
media/*.js|scss               → assets темы (asset_url)
```

**Поток настроек:** админка темы → `settings.NAME` в Liquid → (опционально) inline в `scripts.liquid` / `data-*` на DOM → JS.

**Поиск:** визуально в `header.liquid` (`.header_search`). Для DanForge QS нужны: (1) markup панели на всех страницах, (2) JS/CSS, (3) триггер на `.header_search` / `#header-search` / form.

**Подключение:** include сниппета панели лучше в `layouts.layout.liquid` (после header или перед scripts) — global overlay, не только index.

---

## 2. Отличия от gen-4 widget

| Аспект | Gen-4 (`df_quick_search`) | Gen-2 тема (nivona-паттерн) |
|--------|---------------------------|-----------------------------|
| Манифест | `info.json` SimpleWidgetType, gen 4 | Нет / или отдельный SimpleWidget gen 2 |
| Зоны размещения | `header`, `outside`, content… | Нет header/outside; у кастома часто **нет** widget zones |
| Настройки UI | `settings_form.json` | `config/settings.html` |
| Дефолты | `settings_data.json` виджета | `config/settings_data.json` темы |
| Liquid API | `widget_settings.foo` | `settings.foo` |
| Live preview editor | CSS vars на `.layout` | Полный save + reload |
| Установка | Админка «Виджеты» + drop в зону | Правка файлов темы (+ опционально upload) |
| JS/CSS | Платформа подключает snippet.js/scss | Вручную `media/` + script/link в head/scripts |

**Критично для QS:** gen-4 рассчитан на `header`/`outside` (панель «везде»). В `info.gen2.json` этих kinds **нет** — даже на «коробочном» gen-2 виджет кладут в content/footer/sidebar, что для global overlay неудобно и легко забыть на части шаблонов.

---

## 3. Что уже заложено в df_quick_search для gen-2 — достаточно ли?

| Артефакт | Статус | Достаточно? |
|----------|--------|-------------|
| `info.gen2.json` | generation 2, без header/outside | Только смена манифеста |
| `settings_form.json` / `settings_data.json` | Общие с gen-4 | Для SimpleWidget — да; для theme — **нет**, нужен `settings.html` |
| `snippet.liquid` | Только `widget_settings` | Для theme — нужен адаптер `settings.df_qs_*` (или dual-read) |
| `snippet.js` | Читает `data-*` | **Переиспользуем** без смены API, если Liquid пишет те же data-* |
| README «Gen 2: rename info» | Документирован | **Занижает** риск: на nivona-подобных темах upload ≠ появление на сайте |

**Вердикт:** одной смены `info.json` **недостаточно** как полноценной gen-2 поставки для типичных кастомных тем. Достаточно только для магазинов gen-2 **с рабочими widget_list zones** и готовностью класть виджет в content/footer на `page_kinds: all`. Для целевого паттерна владельца (сниппеты + `settings.html`) нужен **отдельный пакет / ветка поставки**.

Прецедент отзывов: hybrid (upload + theme patch). Для QS hybrid слабее: нет header-зоны; панель должна жить в layout, а не в content-цикле главной.

---

## 4. Матрица 21 настройки → `settings.html`

**Конвенция имён:** префикс `df_qs_` (избежать коллизий с темой).  
**Чекбоксы:** `type="checkbox"`; в `settings_data.json` default вкл → `"1"`, выкл → ключ не писать или `""`.  
**В Liquid:** для default-ON: скрывать только при явном выкл (`settings.df_qs_enabled == blank` или `!= '1'` — уточнить у Architect по факту inSales; на nivona вкл часто `'1'`).  
**Select:** HTML `<select name="…"><option value="…">`.

| # | Ключ gen-4 (`name`) | Label | HTML в settings.html | `name` темы | Default в settings_data |
|---|---------------------|-------|----------------------|-------------|-------------------------|
| 1 | `enabled` | Включить быстрый поиск | `<input type="checkbox">` | `df_qs_enabled` | `"1"` |
| 2 | `placeholder` | Подсказка в поле поиска | `<input type="text">` | `df_qs_placeholder` | `"Поиск по каталогу"` |
| 3 | `popular_queries` | Популярные запросы | `<input type="text">` (+ hint) | `df_qs_popular_queries` | `""` |
| 4 | `trigger_selectors` | Селекторы открытия | `<input type="text">` (длинный) | `df_qs_trigger_selectors` | `".header_search, .header_search form, #header-search, .header_search button"` *(nivona-default; gen-4 default — armedf)* |
| 5 | `show_photos` | Показывать фото | checkbox | `df_qs_show_photos` | `"1"` |
| 6 | `show_out_of_stock_badge` | Бейдж «Нет в наличии» | checkbox | `df_qs_show_out_of_stock_badge` | `"1"` |
| 7 | `show_prices` | Показывать цены | checkbox | `df_qs_show_prices` | `"1"` |
| 8 | `show_product_sort` | Сортировка в выдаче | checkbox | `df_qs_show_product_sort` | `"1"` |
| 9 | `show_all_results` | Ссылка «Все результаты» | checkbox | `df_qs_show_all_results` | `"1"` |
| 10 | `show_categories` | Показывать категории | checkbox | `df_qs_show_categories` | `"1"` |
| 11 | `show_articles` | Статьи блога | checkbox | `df_qs_show_articles` | *(absent / выкл)* |
| 12 | `articles_lazy_load` | Отложенный индекс статей | checkbox | `df_qs_articles_lazy_load` | `"1"` |
| 13 | `article_blog_handles` | Handles блогов | `<input type="text">` | `df_qs_article_blog_handles` | `"blog"` |
| 14 | `articles_display_limit` | Статей в первой порции | `<input type="number" min="1" max="100">` | `df_qs_articles_display_limit` | `"8"` |
| 15 | `articles_blog_url` | Ссылка на блог | `<input type="text">` | `df_qs_articles_blog_url` | `"/blog"` |
| 16 | `hide_zero_price` | Скрыть нулевую цену | checkbox | `df_qs_hide_zero_price` | *(absent)* |
| 17 | `results_limit` | Кол-во товаров | `<input type="number" min="1" max="200">` | `df_qs_results_limit` | `"24"` |
| 18 | `image_ratio` | Формат фото | `<select>`: square, portrait, portrait-34, landscape, natural | `df_qs_image_ratio` | `"square"` |
| 19 | `cols_mobile` | Колонки mobile | `<select>` 2–6 | `df_qs_cols_mobile` | `"2"` |
| 20 | `cols_tablet` | Колонки tablet | `<select>` 2–6 | `df_qs_cols_tablet` | `"3"` |
| 21 | `cols_desktop` | Колонки desktop | `<select>` 2–6 | `df_qs_cols_desktop` | `"4"` |

**UI-блок в settings.html (паттерн nivona):**

```html
<fieldset>
  <legend>Быстрый поиск DanForge</legend>
  <table>
    <tr>
      <td><label for="df_qs_enabled">Включить быстрый поиск</label></td>
      <td><input name="df_qs_enabled" id="df_qs_enabled" type="checkbox" /></td>
    </tr>
    <!-- … остальные 20 полей … -->
  </table>
</fieldset>
```

**Liquid-адаптер (смысл):** те же `assign` / `data-*`, источник `settings.df_qs_*` вместо `widget_settings.*`. JS **не менять** по контракту data-*.

---

## 5. Рекомендация: theme-snippet vs SimpleWidget gen-2

### Вариант A — только SimpleWidget (`info.gen2.json` + settings_form)

| Плюсы | Минусы |
|-------|--------|
| Переиспользует текущий widget/ пакет | Нет `header`/`outside` |
| Админ-настройки виджета знакомы | На nivona-like без widget zones — **не появится** без patch |
| Как у `df_reviews_slider_gen2` | Content-зона ≠ global overlay; риск дублей/пропусков страниц |
| | `enable_server_reload` / editor quirks всё ещё gen-4 knowledge |

### Вариант B — theme snippets + settings.html (отдельная поставка)

| Плюсы | Минусы |
|-------|--------|
| Совпадает с типичным gen-2 паттерном владельца | Ручная установка в каждую тему |
| Гарантированный include в layout | Нет «магазина виджетов» / одного клика |
| Настройки рядом с остальной темой | Нужен отдельный dist: snippet + patch settings.html/data + assets |
| Триггеры под селекторы темы из коробки | Дрейф кода vs gen-4 (нужен shared core) |

### Вариант C — Hybrid (upload SimpleWidget + theme include)

| Плюсы | Минусы |
|-------|--------|
| JS/CSS может тянуть платформа | Для QS всё равно нужен layout include |
| settings_form если виджет реально рендерится через `{{ widget }}` | Без экземпляра в widget_lists — пусто |
| | Сложнее документировать, чем B |

### Рекомендация Analyst

**Основная поставка gen-2: Вариант B (theme-snippet + settings.html)** как продуктовый пакет `df_quick_search_gen2` (или `theme/` внутри проекта).

**Опционально** оставить `info.gen2.json` + settings_form для магазинов с нормальными widget zones (коробочные gen-2) — как **доп. канал**, не как единственный.

Shared: один `snippet.js` (+ scss), два Liquid-адаптера (`widget_settings` vs `settings.df_qs_*`).

Не полагаться на README «переименуй info» как полный gen-2 GTM.

---

## 6. Риски / открытые вопросы для Architect

### Риски

1. **Placement:** без include в layout панель не на всех страницах → «поиск не открывается».
2. **Trigger conflict:** form submit vs capture-phase intercept; на nivona нет AjaxSearch, но submit всё ещё уводит на `/search`.
3. **Checkbox semantics:** `'1'` / absent / `true` / `'false'` — ошибочный default-ON ломает выкл (см. knowledge).
4. **Коллизии имён** без префикса `df_qs_`.
5. **Дублирование пакета** с gen-4 → рассинхрон фич без shared core.
6. **Статьи + `{% cache %}`** на gen-2 Liquid — проверить поддержку cache tag на целевых магазинах.
7. **Assets:** SCSS виджета vs уже собранный `theme.css` — подключать отдельный css или вливать в media.
8. **Несколько layout** (checkout, account) — QS обычно не нужен; не ломать checkout includes.

### Открытые вопросы (требует уточнения у владельца / Architect)

1. Пилот-магазин gen-2: nivona.ru или другой? Дефолтные `trigger_selectors` под кого?
2. Нужен ли канал SimpleWidget gen-2 параллельно theme-пакету, или только B?
3. Handle/имя пакета: `danforge_quick_search_g2` vs тот же handle?
4. Обновления: клиент правит тему вручную или DanForge заливает ZIP/файлы?
5. Нужны ли все 21 настройки в gen-2 MVP или урезанный набор?
6. Подтвердить: в gen-2 SimpleWidget `widget_settings` + `settings_form` работают так же, как в gen-4 (по отзывам — да при рендере `{{ widget }}`).
7. Есть ли у целевых тем штатные widget_list zones в layout (не nivona)?

---

## 7. Acceptance criteria для gen-2 поставки

### Поставка / установка

- [ ] Отдельный артефакт поставки (не только rename `info.gen4` → gen2).
- [ ] Документированная установка: какие файлы темы править (layout/header, settings.html, settings_data.json, media).
- [ ] Fieldset «Быстрый поиск DanForge» со всеми согласованными настройками; дефолты в `settings_data.json`.
- [ ] Include панели на основных storefront layout (не checkout), один экземпляр.

### Поведение (паритет с gen-4 v1.0.0, кроме явно урезанного scope)

- [ ] Клик по триггерам темы открывает fullscreen-панель; overlay / Escape / × закрывают.
- [ ] Live-поиск ≥2 символов; suggestions + enrich + supplement; SKU; layout-fix RU↔EN.
- [ ] Настройки из админки темы меняют `data-*` и поведение (photos, prices, categories, sort, all results, OOS badge, limits, cols, ratio).
- [ ] `enabled` OFF — виджет не активен.
- [ ] Статьи (если в scope): индекс из Liquid, lazy/localStorage как в gen-4.
- [ ] Нет регрессии навигации: Enter / «Все результаты» → `/search?q=…`.

### Качество

- [ ] Те же unit-тесты парсеров settings (или общие), что у gen-4, зелёные.
- [ ] Smoke на пилотной gen-2 теме: desktop + mobile, триггер шапки.
- [ ] README gen-2: отличие от gen-4, матрица настроек, селекторы темы.

### Явно вне AC (пока)

- [ ] Live preview editor CSS vars (gen-4 only).
- [ ] Drop в зону `header`/`outside` без правки темы на nivona-like.

---

## Требования (черновик) для Spec / Architect

1. Пакет **theme-snippet gen-2** с адаптером `settings.df_qs_*` → идентичные `data-*`.
2. Переиспользовать `snippet.js` / логику SCSS; минимизировать форк.
3. Дефолтные триггеры документировать per-theme (nivona vs armedf).
4. Решение по второму каналу SimpleWidget — явно в архитектуре (in/out of MVP).
5. Чеклист установки по аналогии с `df_reviews_slider_gen2/docs/nivona-install.md`.

---

## Ограничения

- Не проектировать структуру папок/модулей здесь — Architect.
- Не писать код — Programmer.
- Knowledge gen-4 widgets ≠ полная спека theme settings.
- `media/search.js` nivona пуст — не опираться на AjaxSearch темы.

---

## Рекомендации для следующего этапа

| Кому | Что |
|------|-----|
| Jarvis | Зафиксировать развилку B (primary) vs A/C; подтвердить пилот-тему |
| Architect | Dual Liquid adapter, состав пакета, asset pipeline, checkbox contract |
| Spec (если нужен) | AC выше → `02-spec.md`; scope MVP (все 21 vs урезание) |
| Plan | После APPROVED arch — шаги: scaffold gen2, settings.html block, layout include, smoke |

---

## Приложение: поток данных (оба канала)

```
[Gen-4 / SimpleWidget]
  settings_form → widget_settings → snippet.liquid → data-* → snippet.js

[Gen-2 theme]
  settings.html → settings.df_qs_* → snippet.liquid (adapter) → data-* → snippet.js (тот же)
```
