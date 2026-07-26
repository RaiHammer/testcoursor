# План спринта: df_reviews_slider (2026-07-14)

**Основание:** решения владельца 2026-07-13, `02-technical-report.md`  
**Статус:** в работе  
**Проект:** `projects/df_reviews_slider/`

---

## Цели спринта (порядок)

| # | Цель | Приоритет | Статус сессии 1 |
|---|------|-----------|-----------------|
| 1 | CLI audit + yandex-only (убрать mix/insales_ratio из GUI) | P0 | ✅ gui.py |
| 2 | CustomTkinter rebuild (DanForge brand) | P1 | ✅ parity gui_ctk.py (сессия 2) |
| 3 | Lazy-load Yandex в snippet.js | P0 | ✅ реализовано |
| 4 | Code review prep + e2e smoke plan | P1 | ✅ e2e 6/6 сценариев |

---

## Фаза 1 — CLI audit (yandex-only)

**Scope:** `cli/gui.py`, `cli/get_reviews.py` (default source_mode)

### Задачи

- [x] Удалить поля `insales_ratio`, combobox `source_mode` (mix/insales)
- [x] Подзаголовок: «Yandex → сниппет темы»
- [x] Поле `yandex_limit` (0 = все найденные)
- [x] `source_mode` всегда `yandex` при сохранении
- [x] Default `load_config`: `yandex` вместо `mix`
- [x] Синхронизировать INSTRUCTION.md с новыми подписями GUI (сессия 2)

### Критерии готовности

- GUI не показывает legacy mixed-режим
- `config.json` сохраняется с `source_mode: "yandex"`
- `python -m unittest` — green

---

## Фаза 2 — CustomTkinter (DanForge brand)

**Scope:** `cli/gui_ctk.py`, `cli/requirements.txt`, `cli/start_ctk.bat`

### Бренд

| Токен | Значение |
|-------|----------|
| Фон | `#212528` |
| Акцент | `#fba064` |
| Текст | `#e8e8e8` |
| Панель | `#2a2f33` |

### Задачи сессии 1 (scaffold)

- [x] Минимальное окно: sidebar клиентов, форма, кнопка «Сгенерировать»
- [x] Тёмная тема DanForge
- [x] Полный набор кнопок (API check, batch, copy snippet) — сессия 2
- [x] Progress bar при Playwright — сессия 2
- [x] Wizard «только файл» (без API) — сессия 3
- [x] `start.bat` → gui_ctk по умолчанию (после parity с gui.py)

### Структура (целевая, сессия 3+)

```
cli/
├── gui.py           # legacy ttk (до parity CTk)
├── gui_ctk.py       # CustomTkinter entry
├── get_reviews.py
└── gui/             # опционально: panels/ при росте
```

---

## Фаза 3 — Lazy-load Yandex (performance)

**Scope:** `widget/snippet.js`, `widget/tests/source-tabs.test.js`

### Поведение

1. При вкладках и default tab ≠ yandex — Yandex-слайды **не в DOM** (DocumentFragment)
2. `data-yandex-count` сохраняется для счётчиков masonry
3. При первом `switchSourceTab('yandex')` — mount в pool → visibility
4. Без вкладок или default=yandex — без defer (как раньше)

### Задачи

- [x] `stashYandexSlidesLazy` / `mountYandexSlidesLazy`
- [x] `hasReviewSlides` учитывает lazy fragment
- [x] Тесты helper-функций в source-tabs.test.js
- [x] Performance budget test (DOM count) — P3, сессия 3
- [ ] Liquid `<template>` для нулевого HTML payload — опционально v2

### Критерии

- Initial DOM без Yandex-слайдов при insales-first
- `node widget/tests/*.test.js` — green
- Ручной smoke: visibility.html, tab switch

---

## Фаза 4 — Code review + e2e smoke plan

**Scope:** артефакты, Playwright scaffold

### E2E smoke checklist (dual-source)

| # | Сценарий | Ожидание |
|---|----------|----------|
| 1 | Страница с виджетом, tabs ON, default insales | Видны только InSales, Yandex не в DOM |
| 2 | Клик вкладка «Яндекс» | Слайды появляются, layout не ломается |
| 3 | Masonry + tab counts | Счётчики insales/yandex корректны до/после mount |
| 4 | Slider + load-more InSales | AJAX не дублирует yandex |
| 5 | hide_yandex ON | Вкладка скрыта, lazy не mount |
| 6 | Editor preview: смена layout | Rescan без утечки DOM |

### Инфраструктура (сессия 2–3)

- [x] `widget/tests/e2e/dual-source.spec.js` (Playwright)
- [x] Fixture HTML с insales + yandex markup
- [x] CI step в README (локальный `npx playwright test`)
- [ ] Code Reviewer gate после CTk parity

### Code review prep

- [x] Заполнить `templates/insales-widget-checklist.md` для v1.2.1
- [x] Diff summary: gui + lazy-load
- [ ] Bugbot / security-review по запросу Jarvis

---

## Оценка по сессиям

| Сессия | Фокус | Часы |
|--------|-------|------|
| **1 (сегодня)** | Audit GUI + CTk scaffold + lazy-load | 4–6 |
| 2 | CTk parity + e2e scaffold | 6–8 |
| 3 | Wizard manual + progress + PyInstaller smoke | 4–6 |

---

## Зависимости

- Виджет v1.2.0 задеплоен на пилоте — не блокирует CLI
- `customtkinter` — pip install на ПК DanForge
- Playwright уже в `widget/tests/node_modules`

---

## Артефакты спринта

| Файл | Назначение |
|------|------------|
| `04-plan.md` | этот план |
| `05-progress-report.md` | отчёт сессии 1 |
| `reviews/e2e-smoke-plan.md` | фаза 4, сессия 2 |
