# Отчёт о проделанной работе: df_reviews_slider

**Дата:** 2026-07-15  
**Проект:** `projects/df_reviews_slider/`  
**Версия:** v1.2.1 (post-sprint + owner edits + Jul 15 fixes)

---

## 1. Хронология по темам

### v1.2.0 — Dual-source + 6 макетов (до 2026-07-13)

| Дата | Работа | Артефакт |
|------|--------|----------|
| 2026-07-09 | MVP: виджет + CLI, zip | `artifacts/2026-07-09-reviews-slider/` |
| 2026-07-10 | Ретро качества, review gates | `artifacts/retrospectives/2026-07-10-df-reviews-slider-retro.md` |
| 2026-07-11 | Анализ настроек gen-4 (parseLayout, editor CSS) | `artifacts/2026-07-11-df-reviews-slider-settings-analysis.md` |
| 2026-07-13 | Dual-source refactor: InSales prefetch + Yandex CLI snippet | `artifacts/2026-07-13-reviews-sources-refactor/` |
| 2026-07-13 | Лимиты по режимам (slider/spotlight/marquee/page-size) | `artifacts/2026-07-13-reviews-load-limits/05-report.md` |
| 2026-07-13 | Grid/masonry responsive | `artifacts/2026-07-13-grid-masonry-responsive/` |
| 2026-07-13 | Финальные отчёты + GTM-решения владельца | `artifacts/2026-07-13-reviews-slider-final-reports/` |
| 2026-07-13 | GTM: danforge → Kwork, Модель A цен | `knowledge/strategy/decisions/2026-07-13-df-reviews-slider-gtm.md` |

### Спринт CLI + e2e (2026-07-14, сессии 1–3)

| Сессия | Работа | Результат |
|--------|--------|-----------|
| **1** | CLI audit yandex-only; CTk scaffold; lazy-load Yandex | `05-progress-report.md` |
| **2** | CTk parity (check, batch, copy, progress bar); Playwright e2e 4/4 | `06-progress-report-session2.md` |
| **3** | Manual wizard (без API); e2e 5–6; checklist v1.2.1; DOM budget | `07-progress-report-session3.md` |
| Gate | Code Reviewer | **APPROVED** — `reviews/code-review-sprint.md` |

### Правки владельца + armedf (2026-07-14)

| Работа | Детали |
|--------|--------|
| Owner widget edits | Вкладка «Описание», defaults, floating CTA, layout-* поля, yandex default tab |
| Документ сохранения | `artifacts/2026-07-14-owner-widget-edits/01-owner-changes.md` |
| AJAX research | armedf.ru: `/blogs/shop-reviews` — якорь пагинации; главная `?page=2` — нет |
| armedf CLI run | 63 отзыва Яндекс → theme_id 11314809, uploaded 14.07 18:43 |
| GTM материалы | Тексты danforge + Kwork + чеклист скринов |

### Фиксы 15.07.2026 (post-owner)

| Тема | Что исправлено |
|------|----------------|
| **parseLayout** | Русские алиасы: «Режим фокуса» → spotlight, «Мансори» → masonry |
| **settings_form.json** | Select options в формате inSales `[label, value]` (русские label) |
| **Marquee popup** | Shell overflow hidden не применяется в marquee при открытом overlay |
| **Marquee dedupe** | Дедупликация слайдов при переключении вкладок (reviewId key) |
| **Marquee start** | Старт слева, восстановление animation-delay при смене вкладки |
| **Marquee overflow** | `layout:has(.df-reviews--layout-marquee)` + viewport containment (max-width 100%) |
| **CLI theme_id** | Нормализация и ensure_theme_id — тесты в `test_theme_id.py` |
| **Unit tests** | +`settings-form.test.js`, +`marquee.test.js`; layouts/matrix/sync обновлены |

---

## 2. Текущий статус виджета

### Функции

- **Dual-source:** InSales (prefetch + AJAX load-more) + Яндекс (CLI → liquid snippet)
- **6 макетов:** slider, masonry, grid, list, spotlight (Режим фокуса), marquee (Бегущая строка)
- **Вкладки:** InSales / Яндекс (без «Все»); счётчики — только masonry
- **Lazy-load Yandex:** DOM-экономия при default tab ≠ yandex
- **Модалки + lightbox:** фото original + previews
- **CTA:** floating (masonry/grid desktop), inline (остальные)
- **Форма отзыва:** `df-reviews__write-btn` + POST

### Режимы и ограничения

| Режим | Где использовать | Load-more InSales | Примечание |
|-------|------------------|-------------------|------------|
| slider, spotlight, marquee, grid | Любая страница | Нет (клиентская пагинация) | Универсальные |
| list | Сайдбар / mobile | Опционально | Owner: info в «Описание» |
| masonry | **Страница с пагинацией** (блог) | Да, server AJAX | Требует якорь URL |

### Owner defaults (не откатывать)

| Настройка | Значение |
|-----------|----------|
| `source-tabs` | `false` |
| Default active tab | `yandex` |
| `insales-prefetch-limit` | `20` |
| `min_rating` (data) | `4` |
| Вкладки админки | Описание / Контент / Дизайн |
| `widget_list_kinds` | content + before/after/footer/panels/sidebar |

### Известные ограничения

1. **Masonry server load-more** требует pagination anchor (`/blogs/shop-reviews` или `insales-ajax-url`). На главной без якоря — prefetch до 50, кнопка скрыта.
2. **`/?page=N` на главной** не пагинирует отзывы (проверено armedf.ru).
3. **Конфликт** `default tab=yandex` + `hide_yandex=true` — guard не реализован (рекомендация code review, не блокер).
4. **PyInstaller** — не настроен; запуск через `start_ctk.bat`.
5. **Liquid Yandex payload** всё ещё в HTML (lazy — DOM only, не bytes).

---

## 3. Открытые пункты / отложенные решения

| # | Пункт | Приоритет | Статус |
|---|-------|-----------|--------|
| 1 | Публикация danforge.ru + Kwork | P0 | Материалы готовы, скрины нет |
| 2 | Деплой виджета на armedf.ru | P0 | CLI готов, виджет не на сайте |
| 3 | Съёмка demo-скринов (P0–P1) | P0 | Чеклист есть |
| 4 | AJAX anchor probe при init | P2 | Outline в AJAX research |
| 5 | PyInstaller packaging | P3 | v2 backlog |
| 6 | Guard hide_yandex + default tab | P3 | Code review recommendation |
| 7 | Liquid `<template>` для нулевого Yandex | P3 | v2 performance |
| 8 | Запрос в InSales про storefront reviews API | Spike | Backlog |
| 9 | Первая продажа Q3 | Бизнес | 0 продаж |

---

## 4. Покрытие тестами

### Widget unit (node)

| Файл | Checks |
|------|--------|
| settings.test.js | 10 |
| settings-matrix.test.js | 16 |
| settings-sync.test.js | 13 |
| layouts.test.js | 16 |
| pagination.test.js | 57 |
| source-tabs.test.js | 38 |
| settings-form.test.js | 10 |
| marquee.test.js | 19 |
| **Итого** | **179** |

### CLI (python unittest)

| Модуль | Tests |
|--------|-------|
| test_yandex_parser.py | 5 |
| test_cli_yandex_only.py | 11 |
| test_clients_manager.py | 5 |
| test_theme_id.py | 6 |
| **Итого** | **27** |

### E2E (Playwright)

| Suite | Результат |
|-------|-----------|
| dual-source.spec.js | **6/6** (lazy mount, counts, hide_yandex, load-more, layout rescan) |

### Не покрыто автотестами

- Ручной smoke в inSales editor (все 6 макетов + русские label)
- armedf.ru live после деплоя
- CTk wizard UX end-to-end

---

## 5. Статус клиента armedf.ru

| Параметр | Значение |
|----------|----------|
| Профиль CLI | `cli/clients/armedf-ru/config.json` |
| theme_id | 11314809 |
| Последний run | 2026-07-14 18:43, status ok |
| Yandex | 70 найдено, 63 в сниппете, uploaded |
| min_rating | 4 |
| AJAX якорь | `/blogs/shop-reviews` — **200**, page=2 работает |
| `/product/shop-reviews` | **404** (guard в виджете) |
| Виджет на сайте | **Не задеплоен** (на момент AJAX research) |

### Рекомендация для armedf

1. Установить виджет на страницу **`/blogs/shop-reviews`** (masonry + source-tabs).
2. `insales-ajax-url` оставить пустым (авто `/blogs/shop-reviews`).
3. `insales-prefetch-limit=20` (уже в owner defaults).
4. Прогнать smoke: вкладки, load-more, counts, mobile.

---

## 6. Версионирование

| Версия | Содержание |
|--------|------------|
| v1.0.0 | MVP |
| v1.0.1 | Упаковка, Kwork/Tilda v1 |
| v1.2.0 | Dual-source, 6 layouts |
| **v1.2.1** | CLI CTk + wizard, lazy-load, owner edits, Jul 15 fixes, 179 unit checks |

**Дистрибутив zip:** обновить перед первой продажей (после финального smoke).
