# Аудит документации: df_reviews_slider

**Дата:** 2026-07-15  
**Scope:** проект, артефакты, knowledge, GTM

---

## 1. Инвентаризация

### Проект (`projects/df_reviews_slider/`)

| Файл | Назначение | Статус до аудита |
|------|------------|------------------|
| `README.md` | Главная документация | ⚠️ Устарел: defaults 12 prefetch, нет v1.2.1, нет новых тестов |
| `CHANGELOG.md` | История версий | ⚠️ Остановился на v1.2.0 |
| `widget/info.json` | Мета виджета inSales | ✅ Актуален (owner name/description) |
| `widget/settings_form.json` | Форма настроек | ✅ Owner + Jul 15 fixes |
| `cli/INSTRUCTION.md` | Инструкция CLI | ✅ Обновлён в спринте 14.07 |
| `cli/config.example.json` | Пример конфига | ✅ OK |
| `templates/insales-widget-checklist.md` | Чеклист деплоя | ✅ v1.2.1 (сессия 3) |

### Артефакты (ключевые)

| Путь | Актуальность |
|------|--------------|
| `artifacts/2026-07-14-owner-widget-edits/01-owner-changes.md` | ✅ Эталон owner overrides |
| `artifacts/2026-07-14-reviews-slider-sprint/` | ✅ Спринт 1–3 + APPROVED review |
| `artifacts/2026-07-14-reviews-ajax-research/01-research.md` | ✅ Актуален для armedf |
| `artifacts/2026-07-14-reviews-slider-gtm/` | ⚠️ Частично устарел (defaults, masonry FAQ) |
| `artifacts/2026-07-13-reviews-load-limits/05-report.md` | ⚠️ min spotlight/marquee owner=1, doc=2 |
| `artifacts/2026-07-13-reviews-slider-final-reports/` | ⚠️ Техотчёт pre-sprint (e2e «pending») |
| `artifacts/2026-07-09-reviews-slider/` | 📦 Архив MVP |
| `artifacts/2026-07-11-df-reviews-slider-settings-analysis.md` | 📦 Исторический (проблемы решены) |

### Knowledge base

| Файл | Статус до аудита |
|------|------------------|
| `knowledge/danforge/products/df-reviews-slider.md` | ⚠️ v1.2, sprint backlog не закрыт |
| `knowledge/strategy/decisions/2026-07-13-df-reviews-slider-gtm.md` | ✅ Актуален (цены, порядок GTM) |
| `knowledge/strategy/roadmap.md` | ⏳ Не проверялся на df_reviews_slider строку |

### GTM / маркетинг

| Файл | Статус |
|------|--------|
| `artifacts/2026-07-14-reviews-slider-gtm/01-danforge-page.md` | ⚠️ Нет FAQ про masonry/якорь |
| `artifacts/2026-07-14-reviews-slider-gtm/02-kwork-listing.md` | ⚠️ «вкладки» как default, нет masonry caveat |
| `artifacts/2026-07-14-reviews-slider-gtm/03-screenshots-checklist.md` | ⚠️ source-tabs=true для скринов — OK, но не пояснено |
| `artifacts/2026-07-09-reviews-slider/03-kwork-listing.md` | ❌ Устарел (заменён 14.07) |

---

## 2. Что обновлено в этой сессии

| Файл | Изменение |
|------|-----------|
| `projects/df_reviews_slider/README.md` | v1.2.1, owner defaults, masonry constraint, 179 tests, вкладка «Описание» |
| `projects/df_reviews_slider/CHANGELOG.md` | Секция v1.2.1 (Jul 14–15) |
| `knowledge/danforge/products/df-reviews-slider.md` | Статус v1.2.1, sprint done, armedf, owner vs sales defaults |
| `artifacts/2026-07-14-reviews-slider-gtm/01-danforge-page.md` | FAQ: masonry/якорь, вкладки опциональны |
| `artifacts/2026-07-14-reviews-slider-gtm/02-kwork-listing.md` | Masonry caveat, русские названия режимов |
| `artifacts/2026-07-15-reviews-project-meeting/*` | Новые артефакты совещания (4 файла) |

### Не обновлялось (намеренно)

| Файл | Причина |
|------|---------|
| `widget/info.json` | Описание актуально |
| `artifacts/2026-07-13-reviews-load-limits/05-report.md` | Исторический отчёт; min values в form изменены owner |
| `artifacts/2026-07-13-reviews-slider-final-reports/02-technical-report.md` | Snapshot 13.07; не переписывать |
| `knowledge/strategy/decisions/2026-07-13-df-reviews-slider-gtm.md` | Решения не менялись |
| `knowledge/strategy/roadmap.md` | Нет нового стратегического решения — только operational status |

---

## 3. Расхождения документации (зафиксировано)

| Тема | GTM / KB (13.07) | Продукт (owner 14.07) | Рекомендация |
|------|------------------|----------------------|--------------|
| `source-tabs` default | `true` (продажи) | `false` (form+data) | Скрины: включить вручную; текст: «вкладки по желанию» |
| Default active tab | insales (ранний код) | yandex | Для demo armedf — yandex first |
| `insales-prefetch-limit` | 12 (limits doc) | 20 | README обновлён на 20 |
| Masonry на главной | «любая страница» | info: только блог/пагинация | FAQ на danforge уточнён |
| Версия | v1.2 | v1.2.1 | CHANGELOG + README |

**Правило:** owner overrides в `01-owner-changes.md` — источник истины для кода; GTM defaults — для демо/продаж (вкладки включать при съёмке).

---

## 4. Пробелы (не закрыты документацией)

1. **Установочный гайд для клиента** post-sale (one-pager) — нет.
2. **armedf runbook** — только в work-report, нет отдельного `artifacts/armedf-pilot/`.
3. **Обновлённый zip** `dist/danforge-reviews-slider.zip` — не пересобран после Jul 15.
4. **Скрины** — папка `gtm/screenshots/` не создана.

---

## 5. Рекомендации на следующий цикл docs

| Приоритет | Действие |
|-----------|----------|
| P0 | Снять скрины → обновить GTM чеклист [x] |
| P1 | Пересобрать dist zip + smoke checklist |
| P2 | `artifacts/armedf-pilot/01-deploy-runbook.md` после деплоя |
| P3 | Client one-pager «как пользоваться виджетом» (без CLI) |
