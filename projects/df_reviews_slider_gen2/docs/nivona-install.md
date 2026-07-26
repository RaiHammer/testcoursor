# Установка gen-2 на nivona.ru

**Виджет:** `danforge_reviews_slider_g2` (v0.1.1+)  
**Handle:** `danforge_reviews_slider_g2`  
**Reference-тема:** `projects/df_reviews_slider/nivona.ru/`  
**Анализ темы:** [`artifacts/2026-07-20-reviews-content-cli-gen2/04-gen2-nivona-analysis.md`](../../../artifacts/2026-07-20-reviews-content-cli-gen2/04-gen2-nivona-analysis.md)

---

## Что не входит в scope

| Файл / зона | Почему не трогаем |
|-------------|-------------------|
| `snippets/product_reviews.liquid` | Native inSales отзывы на карточке товара — отдельная система |
| `snippets/product_tabs.liquid` | Вкладка «Отзывы» на странице товара |
| `snippets/scripts.liquid` | Yandex SmartCaptcha для формы отзыва на товар |

Gen-2 виджет добавляет **блок Yandex-отзывов организации** на главную. Он **не заменяет** product reviews.

---

## Структура главной nivona

`templates/index.liquid` — жёсткие include, без widget zones в layout:

```
widget_slider          ← promo-слайдер
widget_special_products
widget_news
widget_products       ← рекомендуемое место для отзывов — сразу после
section-main-content  ← SEO: h1 + page.content
```

**Рекомендуемое размещение:** после `{% include "widget_products" %}`, перед SEO-блоком `section-main-content`. Отзывы логично идут после каталога и перед текстовым контентом страницы.

---

## Gen-2 темы без widget zones: три варианта

Upload виджета в админку **регистрирует** handle и assets, но **не выводит** блок на странице, пока в template нет точки рендера. У nivona в `layouts.layout.liquid` только `{{ content_for_layout }}` — зон `widget_lists` в layout нет. Нужен **один** из вариантов:

| Вариант | Суть | Админ-настройки | Для nivona |
|---------|------|-----------------|------------|
| **A — только админка** | Добавить виджет в редакторе сайта (секция «Контент» главной) | ✅ | ❌ **Не работает** без theme patch: экземпляр создаётся в `widget_lists.index`, но `index.liquid` не итерирует виджеты |
| **B — manual include** | Скопировать `snippet.liquid` в тему как `snippets/df_reviews_yandex_section.liquid` и `{% include 'df_reviews_yandex_section' %}` | ❌ только правка Liquid | ⚠️ Fallback: нет `widget_settings`, JS/CSS виджета нужно подключать вручную |
| **C — hybrid (рекомендуется)** | CLI + admin upload + theme patch с циклом `widget_lists.index.widgets` | ✅ | ✅ **Рекомендуется** |

### Вариант A — только админка

На «коробочных» gen-2 темах с декларативными widget zones в layout достаточно добавить виджет в редакторе. **Nivona не подходит:** главная собрана из жёстких `{% include "widget_*" %}`, цикл по `widget_lists` в `index.liquid` отсутствует.

Шаг «добавить экземпляр в редакторе» (шаг 4 ниже) **обязателен** и для hybrid — без экземпляра цикл в theme patch нечего рендерить.

### Вариант B — manual include (без SimpleWidgetType liquid tag)

**Отдельного Liquid-тега** для рендера `SimpleWidgetType` по handle (например `{% widget 'danforge_reviews_slider_g2' %}`) в gen-2 **нет**. Рабочие способы:

1. Цикл `{% for widget in widget_lists.index.widgets %}` + `{{ widget }}` — это уже вариант C.
2. Прямой `{% include 'snippet.liquid' %}` — **не** подставляет `widget_settings` из админки; настройки придётся хардкодить в snippet.
3. Копия разметки из `widget/snippet.liquid` в theme snippet + ручное подключение `snippet.js` / `snippet.scss` в тему.

Использовать B только если admin upload невозможен.

### Вариант C — hybrid (рекомендуется для nivona)

| Шаг | Что | Зачем |
|-----|-----|-------|
| **CLI** | `get_reviews.py -u` → `snippets/danforge_reviews_yandex.liquid` | Источник данных Yandex |
| **Admin upload** | Файлы `widget/` | Handle, `settings_form`, автоподключение JS/CSS |
| **Theme patch** | Include + цикл виджетов в `index.liquid` | Фактический вывод на странице |

Обёртка `.section-df-reviews` + `.container` — в theme patch (padding в `snippet.scss` виджета).

---

## Установка (hybrid)

Upload виджета в админку **недостаточен** — у nivona нет `widget_list` зон в `layouts.layout.liquid`. Нужны три шага.

### Шаг 1 — CLI: данные Yandex

```bash
cd projects/df_reviews_slider/cli
python get_reviews.py -u
```

Результат в теме: `snippets/danforge_reviews_yandex.liquid`.

**Проверка:** файл не пуст, содержит разметку с классами `.df-reviews__slide`.

### Шаг 2 — Upload виджета gen-2

1. Админка → **Виджеты** → загрузить все файлы из `projects/df_reviews_slider_gen2/widget/`
2. Handle = `danforge_reviews_slider_g2`, generation = 2
3. Убедиться, что snippet.js / snippet.scss подключились платформой

### Шаг 3 — Theme patch

Добавить в `templates/index.liquid` **после** `widget_products`:

```liquid
{% include "widget_products" %}

<section class="section-df-reviews">
  <div class="container">
    {% for widget in widget_lists.index.widgets %}
      {% if widget.widget_type == 'danforge_reviews_slider_g2' %}
        {{ widget }}
      {% endif %}
    {% endfor %}
  </div>
</section>

<section class="section-main-content">
  ...
```

Опубликовать тему.

### Шаг 4 — Экземпляр виджета в редакторе

1. Редактор сайта → Главная → секция **Контент**
2. Добавить «Отзывы Яндекс DanForge (gen-2)»
3. Сохранить и опубликовать

---

## Настройки MVP для пилота

| Настройка | Рекомендация |
|-----------|--------------|
| `display_mode` | Сначала **list**, затем **slider** (см. smoke) |
| `min_rating` | 4 или 5 |
| `slider_limit` | 10 |
| `slides_per_view` | 3 (desktop), `slides_mobile: 1` |
| `title` | Отзывы покупателей |

---

## Smoke checklist

Порядок важен: **сначала list**, потом slider.

### Фаза A — list (без Swiper)

- [ ] Блок виден на главной после `widget_products`
- [ ] Карточки отзывов рендерятся из `danforge_reviews_yandex.liquid`
- [ ] Фильтр `min_rating` скрывает низкие оценки
- [ ] «Читать полностью» открывает modal
- [ ] Пустой сниппет → показывается `empty_message`
- [ ] Нет конфликта CSS с `.reviews-wrapper` / `.review` nivona

### Фаза B — slider (Swiper 3 compat, v0.1.1+)

Тема nivona использует **Swiper 3.4.2** (`media/insales.ui.swiper.js`). Виджет v0.1.1+ автоматически выбирает API v3 или v8+ — **переустанавливать compat не нужно**.

- [ ] Переключить `display_mode` на **slider** в настройках виджета
- [ ] Слайдер инициализируется: стрелки, pagination
- [ ] Mobile: 1 слайд, desktop: 3
- [ ] Autoplay (если включён) работает
- [ ] В DevTools: `window.Swiper` — major 3, instance создаётся без ошибок

### Regression (обязательно)

- [ ] Вкладка «Отзывы» на карточке товара работает как прежде (`product_reviews.liquid` **не изменялся**)
- [ ] Yandex captcha на форме отзыва товара не сломана

---

## Swiper и libraries

| Факт | Детали |
|------|--------|
| Тема | Swiper **3.4.2**, глобал `window.Swiper` через `plugins.js` |
| Виджет v0.1.1+ | `getSwiperMajorVersion()` → `buildSwiperConfig()` — v3 (`nextButton`/`prevButton`) или v8+ |
| List-режим | Swiper не используется — работает на любой gen-2 теме |

Подробности compat-слоя — в [анализе §6.1](../../../artifacts/2026-07-20-reviews-content-cli-gen2/04-gen2-nivona-analysis.md#61-swiper-api--критично-для-nivona).

---

## Предусловия

- [ ] API-ключ inSales с правами на тему
- [ ] URL организации Yandex (Maps) в конфиге CLI
- [ ] Доступ к редактированию темы nivona (`remote_theme_id: 414`)

---

## Ссылки

- [README проекта](../README.md)
- [CHANGELOG v0.1.1](../CHANGELOG.md)
- [Полный анализ nivona](../../../artifacts/2026-07-20-reviews-content-cli-gen2/04-gen2-nivona-analysis.md)
