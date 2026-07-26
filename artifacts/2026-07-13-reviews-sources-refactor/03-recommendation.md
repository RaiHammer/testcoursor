# Рекомендация: рефакторинг источников отзывов

**Дата:** 2026-07-13  
**Вердикт:** поэтапная миграция, целевая архитектура — **dual source (Liquid inSales + CLI Yandex)**

---

## Рекомендуемый подход

### Phase 1 — Quick fixes (опционально, 3–5 ч)

Если нужен промежуточный результат до Phase 2:

1. CLI: убрать `random.shuffle`, сортировать `picked` по `created_at DESC`.
2. JS: переписать `applySourceTab` → полный reinit (pagination, Swiper, masonry).
3. JS: убрать `filterSlides().remove()` — заменить на `is-hidden`.

**Ограничение:** inSales по-прежнему через API и CLI — не закрывает основной запрос владельца.

### Phase 2 — Native inSales (основная, 12–18 ч)

1. Liquid: prefetch loop для inSales в `snippet.liquid`.
2. CLI: только Yandex → `danforge_reviews_yandex.liquid`.
3. JS: source-aware tabs + merge «Все» по `data-sort-ts`.
4. AJAX load-more для inSales (по test), со spike paginate на целевой странице.
5. Обновить tests, README, release checklist.

### Phase 3 — Optimization (4–6 ч)

1. `lazy_yandex` — include/инициализация по первому клику.
2. EventBus reload после нового отзыва.
3. Deprecate/remove `danforge_reviews_slides.liquid`.

---

## Оценка сложности

| Этап | Часы | Риск |
|------|------|------|
| Phase 1 (hotfix) | 3–5 | Низкий |
| Phase 2 (native inSales) | 12–18 | Средний–высокий |
| Phase 3 (lazy/optimize) | 4–6 | Средний |
| **Итого end-to-end** | **19–29** | |

Spike paginate/prefetch в widget context: **+2 ч**, включить в Phase 2 до кодирования AJAX.

---

## Риски для inSales gen-4

| Риск | Митигация |
|------|-----------|
| `paginate` / `blog.url` не на главной | Spike; fallback — больший prefetch limit + CTA на страницу отзывов |
| Prefetch в editor_mode кэшируется | `enable_server_reload`; тест в редакторе |
| Два snippet include — лимит размера widget | Ограничить yandex_limit; lazy_yandex |
| Regression 6 layouts × 3 tabs | Матрица в `widget/tests/` + visibility.html |
| Старые клиенты со `danforge_reviews_slides` | Transition include + инструкция в README |
| min_rating только в JS для Yandex | Фильтр в CLI при generate |

---

## Следующий шаг конвейера

**Конвейер inSales-виджет:** Analyst ✅ → **Planner** → **Plan Reviewer** → Programmer → Code Reviewer + `templates/insales-widget-checklist.md`

Planner должен:

1. Разбить Phase 2 на задачи с dependency graph (spike → Liquid → CLI → JS → tests).
2. Зафиксировать решение по вкладке «Все» (merge vs sections) после ответа владельца.
3. Указать файлы: `snippet.liquid`, `snippet.js`, `get_reviews.py`, `settings_form.json`, partials, tests.

Spec Reviewer — **опционально** (упрощённый конвейер < 1 дня возможен, но объём Phase 2 ближе к полному → рекомендуется Spec Review gate на `02-spec.md`).

---

## Решение для Jarvis

| Параметр | Значение |
|----------|----------|
| Архитектура | Dual source: Liquid inSales + generated Yandex |
| Не делать | Full AJAX для обоих источников |
| Приоритет | Phase 2; Phase 1 — только если нужен hotfix на текущей неделе |
| Blocker | Spike: paginate на странице установки виджета у клиента |
