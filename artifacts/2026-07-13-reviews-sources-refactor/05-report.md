# Отчёт: DanForge Reviews Slider — Phase 2 dual-source

**Дата:** 2026-07-13  
**Исполнитель:** Programmer  
**Задача:** `2026-07-13-reviews-sources-refactor`

---

## Резюме

Виджет переведён на **dual-source architecture** по решениям владельца (`00-owner-decisions.md`):

- **InSales** — Liquid `{% prefetch account.reviews_not_spam sort: 'date_desc' %}` на любой странице
- **Яндекс** — CLI → `danforge_reviews_yandex.liquid`
- **Вкладки** — только **InSales | Яндекс** (без «Все»)
- **Phase 1 hotfix** — пропущен; sort + tabs исправлены в рамках Phase 2

---

## Изменённые файлы

| Файл | Изменение |
|------|-----------|
| `cli/get_reviews.py` | Yandex-only pipeline, sort DESC, `danforge_reviews_yandex.liquid`, `--insales-backup` |
| `cli/gui.py` | Путь к новому сниппету + fallback legacy |
| `cli/config.example.json` | `source_mode: yandex`, `yandex_limit` |
| `widget/snippet.liquid` | Prefetch inSales, include Yandex, вкладки, AJAX markup |
| `widget/snippet.js` | `switchSourceTab`, `loadInsalesPage`, filter без `.remove()` |
| `widget/snippet.scss` | Стили кнопки InSales load-more |
| `widget/settings_form.json` | `insales-prefetch-limit`, `insales-ajax-url` |
| `widget/settings_data.json` | Defaults новых настроек |
| `widget/tests/source-tabs.test.js` | **новый** |
| `widget/tests/settings-matrix.test.js` | Без вкладки «all» |
| `widget/tests/settings.test.js` | Парс prefetch limit |
| `cli/tests/test_cli_yandex_only.py` | **новый** |

---

## CLI (Task 3)

- Standard run **не вызывает** `/admin/reviews.json`
- Output: `output/danforge_reviews_yandex.liquid` (upload в тему)
- Сортировка: `created_at DESC`, **`random.shuffle` удалён**
- Слайды: `data-source="yandex"`, `data-sort-ts` (Unix)
- Флаг `--insales-backup` — диагностический fetch inSales через API
- Demo mode — только Yandex-слайды

### Миграция для пользователей CLI

1. Обновить `get_reviews.py` / GUI
2. В `config.json`: `"source_mode": "yandex"`, при необходимости `"yandex_limit": 20`
3. Запустить генерацию → загрузить **`snippets/danforge_reviews_yandex.liquid`** в тему
4. Старый `danforge_reviews_slides.liquid` можно оставить 1 релиз (виджет использует как fallback)
5. InSales-отзывы **больше не перегенерируются** CLI — они живут в виджете через prefetch

---

## Widget (Tasks 1–5)

### Настройки

| name | default | Назначение |
|------|---------|------------|
| `insales-prefetch-limit` | 12 | Первая порция inSales (prefetch) |
| `insales-ajax-url` | `/product/shop-reviews` | URL AJAX load-more |

### Liquid

- InSales: prefetch + карточки с `data-source="insales"`, `data-sort-ts`, `data-review-id`
- Yandex: `{% include 'danforge_reviews_yandex' %}`
- Fallback: если нет контента — `danforge_reviews_slides.liquid` (legacy mixed)
- `min_rating` для inSales — фильтр в Liquid
- Кнопка `[data-df-insales-loadmore]` при `reviews_count > prefetch_limit`

### JS

- `switchSourceTab(root, 'insales'|'yandex')` — visibility + reinit pagination / Swiper / masonry / marquee
- Без вкладок (`source-tabs: false`) — оба источника видны, pagination по объединённому DOM
- `filterSlides` — только `is-hidden` для Yandex + `min_rating`, без `.remove()`
- `loadInsalesPage` — fetch HTML, append inSales-слайды, сохранение scroll position

---

## Тесты (Task 6)

```text
node widget/tests/settings.test.js          — 6 checks OK
node widget/tests/settings-matrix.test.js   — 11 checks OK
node widget/tests/layouts.test.js           — 14 checks OK
node widget/tests/pagination.test.js        — 26 checks OK
node widget/tests/source-tabs.test.js       — 16 checks OK
python -m unittest discover -s cli/tests    — 10 tests OK
```

`visibility.html` — без изменений структуры (hide flags).

---

## Deploy checklist

1. **Тема:** upload `danforge_reviews_yandex.liquid` (CLI `-u` или вручную)
2. **Виджет:** залить `snippet.liquid`, `snippet.js`, `snippet.scss`, `settings_form.json`, `settings_data.json`
3. **Редактор inSales:** пересохранить виджет (server reload для prefetch-настроек)
4. **Smoke:** вкладки InSales/Яндекс в slider + masonry; load-more inSales на странице с paginate
5. **Regression:** `templates/insales-widget-checklist.md`

---

## Известные ограничения

- AJAX inSales зависит от HTML-ответа страницы отзывов; на главной без paginate — только prefetch limit
- Legacy fallback (`danforge_reviews_slides`) может дублировать inSales, если в теме остался mixed-сниппет без yandex-only
- `reviews_enabled? == false` — блок inSales не рендерится; вкладка InSales скрыта в Liquid

---

## Следующий шаг

Code Reviewer + ручная матрица layouts × tabs на пилотном магазине.
