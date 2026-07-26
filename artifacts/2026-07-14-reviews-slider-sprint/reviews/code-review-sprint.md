# Review: Code Reviewer — df_reviews_slider sprint (sessions 1–3, re-review)

**ID задачи:** 2026-07-14-reviews-slider-sprint  
**Дата:** 2026-07-13  
**Ревьюер:** Code Reviewer  
**Версия артефакта:** sprint sessions 1–3, post-session-3 fixes  
**Основание:** `04-plan.md`, `07-progress-report-session3.md`, `08-diff-summary-for-review.md`, прямой просмотр кода + прогон тестов

## Вердикт

**APPROVED**

## Чеклист

| # | Критерий | Статус | Комментарий |
|---|----------|--------|-------------|
| 1 | Реализация соответствует плану и spec | ✅ | Фазы 1–4 выполнены: audit, CTk parity, lazy-load, wizard manual, e2e 6/6, checklist v1.2.1 |
| 2 | Нет критических багов | ✅ | `import io` в `gui.py` / `gui_ctk.py`; `--gui` → `gui_ctk` с fallback; импорт smoke OK |
| 3 | Безопасность: нет XSS, инъекций, секретов в коде | ✅ | `.gitignore` закрывает `clients/` и `config.json`; `liquid_escape` / `escapeAttr`; wizard — internal-only |
| 4 | Код читаем, именование понятное | ✅ | `ManualWizardDialog` следует паттернам основного CTk-app; `validate_manual_config` изолирован |
| 5 | Минимальный diff, нет лишнего рефакторинга | ✅ | Session 3 — целевые файлы по scope |
| 6 | Тесты адекватны изменениям | ✅ | Unit 114 + CLI 13 + e2e **6/6** — green (прогон 2026-07-13) |
| 7 | Error handling на месте | ✅ | Wizard worker try/except + `validate_manual_config`; lazy-load guards сохранены |

## Исправления с прошлого gate (NEEDS_REVISION → закрыто)

| # | Было Critical/Warning | Статус |
|---|----------------------|--------|
| 1 | `NameError: io` в gui.py / gui_ctk.py | ✅ `import io` добавлен, `import gui_ctk; import gui` — OK |
| 2 | `--gui` → legacy ttk | ✅ `get_reviews.py`: `from gui_ctk import run_gui` + fallback `gui` |
| 3 | E2E сценарии 4 и 6 отсутствуют | ✅ `dual-source.spec.js` + fixture секции `w-slider-loadmore`, `w-layout-rescan` |
| 4 | Сессия 3 backlog (wizard, checklist, DOM budget) | ✅ `ManualWizardDialog`, `validate_manual_config`, checklist v1.2.1, +5 budget checks |

## Критические замечания (must fix)

_Нет._

## Рекомендации (should fix, не блокируют)

1. **Конфликт `data-default-source-tab="yandex"` + `data-hide-yandex="true"`**

   `getDefaultSourceTab()` в `snippet.js` возвращает preset без учёта hide-флагов. При противоречивых атрибутах Yandex может остаться в DOM. Добавить guard: если `hide_yandex`, preset `yandex` игнорировать.

2. **API key открытым текстом в CTk**

   Маскируется только `password`. Для демонстрации экрана — риск утечки. Рекомендация: маскировать оба поля с toggle «показать».

3. **Unit-тесты lazy-load — mirror-хелперы, не `snippet.js`**

   `source-tabs.test.js` дублирует логику локально. E2E 6/6 компенсирует для smoke; при желании — интеграционный тест через jsdom/Playwright fixture.

## Предложения (nice to have)

1. **PyInstaller** — spec/bat не в репо; smoke-план задокументирован в session 3 для v2.

2. **`ManualWizardDialog` (~280 строк)** — при росте вынести в `cli/gui/manual_wizard.py`.

3. **`prefer_with_avatar`** — только в legacy ttk; удалить при полном отказе от ttk.

4. **Layout class sync** при смене `data-layout` в editor — отдельный путь (`watchVisibility`); e2e проверяет DOM leak, не CSS class assertion.

## Детали по фокусным областям

### Session 3 — Manual wizard

| Проверка | Результат |
|----------|-----------|
| Кнопка «Ручной режим (без API)» в шапке CTk | ✅ |
| 4 шага: клиент → yandex → генерация → инструкция | ✅ |
| `validate_manual_config()` — без API, требует url/file | ✅ + 2 unit-теста |
| `upload=False` всегда | ✅ |
| Threading: `after(0)` для UI, daemon worker | ✅ |
| Инструкция: CLI internal only | ✅ `MANUAL_INSERT_INSTRUCTION` |

### Безопасность (API keys)

| Проверка | Результат |
|----------|-----------|
| `clients/`, `config.json` в `.gitignore` | ✅ |
| `config.example.json` — плейсхолдеры | ✅ |
| Wizard: пустые api_key/password при создании клиента | ✅ |
| Liquid — `liquid_escape()`; виджет — `escapeAttr()` | ✅ |

### Lazy-load edge cases

| Сценарий | E2E | Оценка |
|----------|-----|--------|
| tabs ON, default insales — Yandex не в DOM | ✅ #1 | ✅ |
| Клик «Яндекс» — mount | ✅ #2 | ✅ |
| Masonry tab counts | ✅ #3 | ✅ |
| hide_yandex ON | ✅ #4 | ✅ |
| Slider load-more — AJAX не дублирует yandex | ✅ #5 | ✅ |
| Editor layout change — rescan без утечки | ✅ #6 | ✅ |
| default=yandex + hide_yandex=true (конфликт) | — | ⚠️ см. рекомендацию 1 |

### Тесты (фактический прогон 2026-07-13)

| Suite | Результат |
|-------|-----------|
| `node widget/tests/*.test.js` (6 файлов) | **114 checks** — OK |
| `python -m unittest discover -s cli/tests` | **13 tests** — OK |
| `npx playwright test` (dual-source.spec.js) | **6 passed** (4.8s) |
| `import gui_ctk` / `import gui` | OK |

## Следующий шаг

- **APPROVED** — спринт готов к merge/deploy виджета v1.2.1 и CTk CLI.
- Опционально v2: PyInstaller packaging, guard hide_yandex+default, маскировка api_key.
- Jarvis: закрыть gate в `04-plan.md`, передать на пилот/клиента по чеклисту.
