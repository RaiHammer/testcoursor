# Отзывы Яндекс — gen-2 (DanForge)

**Handle:** `danforge_reviews_slider_g2`  
**Папка:** `projects/df_reviews_slider_gen2/`  
**Статус:** v0.1.1 — MVP + Swiper 3 compat (Yandex-only, slider + list)  
**Поколение inSales:** **2** (`info.json` → `generation: 2`)

Упрощённый виджет для магазинов на **шаблонах generation 2**. Показывает отзывы из CLI-сниппета `danforge_reviews_yandex.liquid`. Без InSales prefetch, dual-source, masonry и формы отзывов.

Полнофункциональный dual-source виджет — `projects/df_reviews_slider/` (gen-4).

---

## Состав

```
df_reviews_slider_gen2/
├── widget/
│   ├── info.json
│   ├── snippet.liquid
│   ├── snippet.js
│   ├── snippet.scss
│   ├── settings_form.json
│   └── settings_data.json
├── docs/
│   └── nivona-install.md
├── CHANGELOG.md
└── README.md
```

CLI общий с gen-4: `projects/df_reviews_slider/cli/get_reviews.py` → upload `danforge_reviews_yandex.liquid`.

---

## Установка

1. CLI: `python get_reviews.py -u` (из `df_reviews_slider/cli/`) — сниппет в тему
2. Админка → Виджеты → загрузить файлы из `widget/`
3. Добавить виджет на страницу (главная, sidebar и т.д.)
4. Выбрать макет: **Слайдер** или **Лента**

**Swiper:** в `info.json` указан `"libraries": ["swiper"]` — тема должна подключать Swiper. `snippet.js` **v0.1.1+** автоматически выбирает API v3 или v8+ (см. ниже).

### Swiper 3 на gen-2 legacy-темах

Многие кастомные gen-2 темы (в т.ч. **nivona.ru**) подключают **Swiper 3.4.2** через `media/insales.ui.swiper.js`, а не Swiper 8+ как gen-4. Виджет определяет major-версию при инициализации:

| Версия | API | Пример темы |
|--------|-----|-------------|
| **Swiper 3.x** | `nextButton`/`prevButton`, `pagination` + `paginationClickable`, autoplay как число | nivona (`insales.ui.swiper.js` 3.4.2) |
| **Swiper 8+** | `navigation`, `pagination.el`, `rewind`, `watchOverflow` | gen-4 магазины, современные темы |

List-режим Swiper не использует — работает на любой gen-2 теме.

---

## Nivona.ru (пилот gen-2)

**Reference-тема:** `projects/df_reviews_slider/nivona.ru/`  
**Инструкция:** [`docs/nivona-install.md`](docs/nivona-install.md)  
**Анализ:** `artifacts/2026-07-20-reviews-content-cli-gen2/04-gen2-nivona-analysis.md`

### Особенности nivona

| Факт | Следствие для установки |
|------|-------------------------|
| Кастомная gen-2 тема (`remote_theme_id: 414`, `not_need_shop_bundle: true`) | Upload виджета **недостаточен** — нужен **theme patch** (include или widget loop) |
| Нет `widget_list` зон в `layouts.layout.liquid` | Виджет из админки не появится на странице без правки template |
| Legacy `widget_reviews.liquid` — ручные блоки (`block_list_widget_type`) | **Не** заменяет Yandex CLI; на текущей главной не подключён |
| Swiper **3.4.2** в `media/insales.ui.swiper.js` | **v0.1.1+** — compat-слой в `snippet.js`; smoke slider на главной |
| Product reviews — native inSales + Yandex captcha | Gen-2 виджет **не** трогает вкладку «Отзывы» на товаре |

### Рекомендуемая установка (hybrid)

Пошаговая инструкция: **[docs/nivona-install.md](docs/nivona-install.md)** (CLI → upload → theme patch после `widget_products`, smoke list → slider).

### MVP scope на nivona

Yandex-only, slider на главной, `min_rating` 4–5, без dual-source и без замены product reviews.

---

## Настройки

| name | default | Назначение |
|------|---------|------------|
| `title` | Отзывы покупателей | Заголовок блока |
| `title_align` | center | left / center |
| `display_mode` | slider | slider / list |
| `accent_color` | #f5a623 | Звёзды, акценты |
| `text_lines` | 5 | Обрезка текста, «Читать полностью» |
| `slider_limit` | 10 | Макс. слайдов в слайдере |
| `list_limit` | 10 | Макс. карточек в ленте |
| `min_rating` | 0 | Фильтр на клиенте (0 / 4 / 5) |
| `hide_date` | false | Скрыть дату |
| `hide_source` | false | Скрыть подпись «Яндекс» |
| `autoplay` | false | Автопрокрутка слайдера |
| `show_arrows` | true | Стрелки слайдера |
| `slides_mobile` / `slides_tablet` / `slides_per_view` | 1 / 2 / 3 | Слайдов в viewport |
| `empty_message` | Отзывы скоро появятся | Если сниппет пуст |

Ключи настроек — **с подчёркиванием** (см. `knowledge/platforms/insales-widgets.md`).

---

## Совместимость CSS

Сниппет CLI генерирует разметку с классами `df-reviews__*` — gen-2 виджет использует те же классы, что gen-4 Yandex-слайды.

---

## TODO (v0.2+)

- [ ] Smoke на реальном gen-2 магазине
- [ ] Unit-тесты парсеров настроек
- [ ] Опционально: grid-макет
- [ ] Чеклист установки gen-2 в `templates/`

---

## Лицензия

Коммерческая. Один магазин — одна лицензия.

**DanForge** · https://danforge.ru
