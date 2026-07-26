# Gen-2: анализ темы nivona.ru и план пилота

**Дата:** 2026-07-20  
**Reference:** `projects/df_reviews_slider/nivona.ru/`  
**Scaffold:** `projects/df_reviews_slider_gen2/` (handle `danforge_reviews_slider_g2`)  
**Статус:** готово к smoke на пилоте (Swiper 3 compat ✅ v0.1.1)  
**Инструкция:** `projects/df_reviews_slider_gen2/docs/nivona-install.md`

---

## 1. Как устроены виджеты gen-2 в nivona

### 1.1 Два параллельных механизма

| Механизм | Где в nivona | Как работает |
|----------|--------------|--------------|
| **`block_list_widget_type`** | `config/setup.json` → `theme_widgets.widget_types[]` | Тип виджета привязан к **block template** (`system-review`, `system-benefit`…). Сниппет получает объект `data` с `data.blocks`. Контент — **статические блоки** в админке, редактируются inline. |
| **Прямые `block_lists.*`** | `snippets/widget_*.liquid`, `footer.liquid`, `index.liquid` | Сниппет читает `block_lists.{handle}.blocks` напрямую по кастомному handle (`index-widget-slider-new`, `widget-footer-benefits`…). **Не** через `setup.json theme_widgets`. |

**Вывод:** nivona — heavily customized gen-2 тема. Живая главная (`templates/index.liquid`) использует **жёсткие `{% include "widget_*" %}`**, а не декларативный `theme_widgets` из `setup.json`.

### 1.2 Текущий блок «Отзывы» (legacy)

```json
// setup.json — reviews-type
{
  "block_template": "system-review",
  "handle": "reviews-type",
  "type": "block_list_widget_type",
  "snippet": "widget_reviews.liquid"
}
```

`snippets/widget_reviews.liquid`:
- Рендерит **ручные** блоки: имя, текст, фото (`block.name`, `block.content`, `block.image`).
- **Не** подключает Yandex, **не** использует CLI-сниппет.
- На текущей `index.liquid` **не подключён** (include отсутствует).

### 1.3 Отзывы на карточке товара (отдельная система)

| Компонент | Назначение |
|-----------|------------|
| `snippets/product_reviews.liquid` | Native inSales `product.reviews` — список, рейтинг, форма «Оставить отзыв» |
| `snippets/scripts.liquid` | Yandex SmartCaptcha для отправки отзыва на товар (`/reviews.json`) |
| `snippets/product_tabs.liquid` | Вкладка «Отзывы» на странице товара |

Это **не** заменяется gen-2 виджетом в MVP — другой use case (per-product vs организация/Yandex Maps).

### 1.4 Swiper в теме

| Факт | Детали |
|------|--------|
| Библиотека | `media/insales.ui.swiper.js` — **Swiper 3.4.2** (jQuery/Dom7) |
| Подключение | `media/plugins.js` → `#= require insales.ui.swiper.js`; SCSS `@import "insales.ui.swiper"` |
| Глобал | `window.Swiper` доступен на всех страницах с `plugins.js` |
| Использование | Галерея товара, promo-slider, «просмотренные товары» (`theme.js`) |

### 1.5 Особенности темы

| Параметр | Значение | Влияние |
|----------|----------|---------|
| `not_need_shop_bundle: true` | `settings_data.json` | Кастомная тема без полного shop bundle; редактор виджетов может отличаться от «коробочных» gen-2 |
| `remote_theme_id: 414` | Кастомный шаблон DanForge | Изменения только через правку файлов темы |
| Нет `widget_list` зон в layout | `layouts.layout.liquid` → только `{{ content_for_layout }}` | **SimpleWidgetType из админки не появится на странице без правки шаблона** |

---

## 2. Можно ли загрузить SimpleWidgetType gen-2 в магазин?

### 2.1 Техническая совместимость upload

| Критерий | Наш gen-2 | Вывод |
|----------|-----------|-------|
| `info.json` → `"generation": 2` | ✅ | Платформа примет upload на gen-2 магазин |
| `type: "SimpleWidgetType"` | ✅ | Стандартный тип загрузки через админку «Виджеты» |
| `widget_list_kinds` | content, before/after_content, footer, sidebar | Зоны определены в info.json |
| Liquid `widget_settings` | ✅ | Работает в snippet.liquid gen-2 |

**Upload через админку возможен** — файлы из `df_reviews_slider_gen2/widget/` загружаются как отдельный виджет.

### 2.2 Но: размещение на nivona без правки темы — нет

Nivona **не содержит** Liquid-зон для `widget_lists` (нет циклов по виджетам секции content/footer). Поэтому:

- Upload **регистрирует** виджет и его assets (snippet.js, snippet.scss).
- **Отображение** на главной/странице **не произойдёт**, пока не добавить include или widget zone в template/snippet.

Это **не** ограничение SimpleWidgetType — это архитектура кастомной темы nivona.

### 2.3 Gen-4 виджет на nivona

`danforge_reviews_slider` с `"generation": 4` — **не** загрузится / не будет совместим с gen-2 окружением. Отдельный gen-2 пакет обязателен.

---

## 3. Рекомендуемая доставка для nivona

### Вариант C — Hybrid (рекомендуется)

| Шаг | Что | Зачем |
|-----|-----|-------|
| **CLI** | `get_reviews.py -u` → `snippets/danforge_reviews_yandex.liquid` | Источник данных Yandex (общий с gen-4) |
| **Admin upload** | Файлы `df_reviews_slider_gen2/widget/` | Регистрация handle, settings_form, подключение snippet.js/scss платформой |
| **Theme patch** | 1 include в нужном template | Фактический вывод на странице |

**Почему не чистый A (только admin):** нет widget zones в layout.  
**Почему не чистый B (только snippet):** теряются настройки в админке и автоподключение JS/CSS виджета; придётся дублировать assets в тему.

### Минимальный theme patch (пример)

Добавить в `templates/index.liquid` (или `snippets/footer.liquid` перед benefits):

```liquid
<section class="section-df-reviews">
  <div class="container">
    {% comment %} Экземпляр виджета — после upload и добавления в секцию content главной {% endcomment %}
    {% for widget in widget_lists.index.widgets %}
      {% if widget.widget_type == 'danforge_reviews_slider_g2' %}
        {{ widget }}
      {% endif %}
    {% endfor %}
  </div>
</section>
```

**Альтернатива (если widget_lists.index недоступен):** создать `snippets/df_reviews_yandex_section.liquid` с содержимым из `snippet.liquid` gen-2 и `{% include 'df_reviews_yandex_section' %}` — настройки тогда только через правку snippet (без админ-редактора).

---

## 4. Scope MVP nivona vs gen-4

| Функция | Gen-4 (`df_reviews_slider`) | Gen-2 MVP (nivona pilot) |
|---------|----------------------------|--------------------------|
| Yandex Maps/Shop отзывы | ✅ CLI | ✅ CLI (тот же сниппет) |
| InSales product.reviews | ✅ dual-source | ❌ |
| Макеты | slider, masonry, grid, list, spotlight, marquee | **slider + list** |
| Страница товара / вкладки | ✅ | ❌ (остаётся native `product_reviews`) |
| Форма «Оставить отзыв» в виджете | ✅ | ❌ |
| Фото, lightbox | ✅ | ✅ (из CLI-разметки, modal в gen-2 JS) |
| Prefetch / AJAX inSales | ✅ | ❌ |
| Настройки в админке | Полный settings_form | Упрощённый (см. gen-2 settings_form.json) |
| Floating offset, CTA, product card | ✅ | ❌ |

**Для nivona достаточно:** блок Yandex-отзывов на главной (или отдельной landing-странице) в режиме slider, опционально list — **без** замены product reviews.

---

## 5. Конкретные шаги установки (nivona pilot)

### Предусловия

- [ ] API-ключ inSales с правами на тему
- [ ] URL организации Yandex (Maps) в конфиге CLI
- [ ] Доступ к редактированию темы nivona (remote_theme_id 414)

### Шаг 1 — CLI: данные Yandex

```bash
cd projects/df_reviews_slider/cli
python get_reviews.py -u
```

Проверить в теме: `snippets/danforge_reviews_yandex.liquid` не пуст, содержит `.df-reviews__slide`.

### Шаг 2 — Upload виджета gen-2

1. Админка → **Виджеты** → загрузить все файлы из `projects/df_reviews_slider_gen2/widget/`
2. Убедиться, что handle = `danforge_reviews_slider_g2`, generation = 2

### Шаг 3 — Theme patch: зона вывода

1. Выбрать место: **главная** — после `widget_products` (см. [`docs/nivona-install.md`](../../projects/df_reviews_slider_gen2/docs/nivona-install.md))
2. Добавить include/widget loop (см. §3)
3. Опубликовать тему

### Шаг 4 — Добавить экземпляр виджета

1. Редактор сайта → Главная → секция **Контент**
2. Добавить «Отзывы Яндекс DanForge (gen-2)»
3. Настройки MVP: `display_mode: slider`, `slides_per_view: 3`, `min_rating: 4` или `5`, `slider_limit: 10`

### Шаг 5 — Smoke checklist

- [ ] Слайдер инициализируется (стрелки, pagination)
- [ ] Переключение slider ↔ list в настройках
- [ ] Фильтр min_rating скрывает слайды
- [ ] «Читать полностью» + modal
- [ ] Пустой сниппет → `empty_message`
- [ ] Нет конфликта CSS с `.reviews-wrapper` / `.review` nivona
- [ ] Mobile: 1 slide, desktop: 3

### Шаг 6 — Regression

- [ ] Product reviews tab (`product_reviews.liquid`) работает как прежде
- [ ] Yandex captcha на форме отзыва товара не сломана

---

## 6. Adjustments для `df_reviews_slider_gen2/` (document only)

### 6.1 Swiper API — **критично для nivona** ✅ done (v0.1.1)

| Проблема | Детали |
|----------|--------|
| Тема nivona | Swiper **3.4.2** |
| `snippet.js` gen-2 (до v0.1.1) | Конфиг Swiper **8+**: `navigation: { nextEl, prevEl }`, `rewind`, `watchOverflow` |
| Swiper 3 | `nextButton` / `prevButton`, нет `rewind` |

**Реализовано в v0.1.1** (commit `c62241bd`): `detectSwiperMajorVersion` в `snippet.js` — авто-выбор API v3 или v8+ при инициализации; `destroySwiper` с fallback для Swiper 3.

**Smoke:** режим **list** first (без Swiper), затем **slider** — см. [`docs/nivona-install.md`](../../projects/df_reviews_slider_gen2/docs/nivona-install.md).

### 6.2 `libraries: ["swiper"]` в info.json

На gen-2 inSales может подгрузить **свою** версию Swiper для виджета → конфликт с Swiper 3 темы.

**Опции:**
- A) Убрать `"swiper"` из libraries, полагаться на `window.Swiper` темы (nivona) + compat layer в JS
- B) Оставить libraries — платформа может инжектить Swiper 8 только в контекст виджета (проверить на smoke)

**Документировать решение после smoke** — не менять до первого теста на nivona.

### 6.3 CSS isolation

Классы `df-reviews__*` не пересекаются с nivona `.review`, `.reviews-wrapper` — **OK**.  
Добавить обёртку `.section-df-reviews` с `padding` под сетку Bootstrap nivona.

### 6.4 Редактор / live preview

`not_need_shop_bundle: true` — preview настроек в редакторе может не обновлять `--setting-*` на `.layout` (см. gen-4 docs). Gen-2 scaffold уже использует `data-*` + inline CSS vars — достаточно для MVP, но чекбоксы проверить вручную на пилоте.

### 6.5 Optional: nivona theme snippet-обёртка

Для повторяемости — добавить в reference `nivona.ru/snippets/df_reviews_section.liquid` (не в scope сейчас, только после одобрения пилота).

---

## 7. Риски пилота

| Риск | Mitigation |
|------|------------|
| Swiper 3 vs 8 | ✅ compat v0.1.1; smoke slider на пилоте |
| Нет widget zone | Theme patch обязателен (§5 шаг 3) |
| Два продукта (gen-4 + gen-2) | Чёткое разделение handles и README |
| Клиент правит тему параллельно | Фиксировать diff patch в артефакте / PR к теме |

---

## 8. Definition of Done (pilot)

- [ ] Yandex-отзывы видны на главной nivona в slider
- [ ] CLI refresh обновляет контент без правки виджета
- [ ] Product reviews на карточке товара не затронуты
- [x] Swiper compat — v0.1.1 (`detectSwiperMajorVersion`)
- [ ] Зафиксирована политика `libraries: ["swiper"]` после smoke (§6.2)

---

**Следующий шаг:** smoke на staging/tech domain nivona по [`docs/nivona-install.md`](../../projects/df_reviews_slider_gen2/docs/nivona-install.md) → обновить CHANGELOG по результатам.
