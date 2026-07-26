# План работ: gen-2 поставка df_quick_search (theme-snippet)

**ID задачи:** `2026-07-23-df-quick-search-gen2`  
**Дата:** 2026-07-23  
**Автор:** Планировщик  
**Статус:** на ревью  
**База:** `03-architecture.md` (APPROVED) + should-fix из `reviews/arch-review.md`  
**Конвейер:** inSales theme-snippet → после APPROVED Plan Reviewer → Programmer → Code Reviewer → чеклист

---

## 1. Цель и Definition of Done

### Цель

Собрать primary-пакет `projects/df_quick_search/widget-gen2/` — theme-snippet поставка быстрого поиска для inSales gen-2 (паттерн nivona): 21 настройка в `settings.html`, Liquid-адаптер `settings.df_qs_*` → gen-4-совместимые `data-*`, JS/CSS в `media/`, документация установки. Working gen-4 `widget/` не трогать.

### Definition of Done

- [ ] Дерево `widget-gen2/` по архитектуре §3 создано.
- [ ] `snippets/df_quick_search.liquid` пишет полный контракт `data-*` (§6); checkbox по §7; **строковые `data-*` через `| escape`** (should-fix Arch).
- [ ] Default-ON checkbox в Liquid в явном виде: `{% if settings.df_qs_* == '1' %}true{% else %}false{% endif %}` + обязательные `"1"` в `settings_data.keys.json`.
- [ ] Default `trigger_selectors` = gen-4 + nivona (§6.1).
- [ ] `media/df_quick_search.js` = копия `widget/snippet.js` (без форка логики).
- [ ] `media/df_quick_search.css` = стили из `snippet.scss` **+ critical overlay/panel** из gen-4 `<style>` в `snippet.liquid` (DoD-чекбокс Arch).
- [ ] `config/settings_fieldset.html` — все 21 поле; `settings_data.keys.json` — согласованные дефолты.
- [ ] `docs/install.md` + клиентский чеклист (§6 ниже); заметка про sync JS после релиза gen-4.
- [ ] Корневой `projects/df_quick_search/README.md` указывает primary gen-2 = `widget-gen2/`.
- [ ] `widget/` (snippet.*, settings_form, info*.json) **не изменён**.
- [ ] Unit-тесты gen-4 парсеров зелёные; smoke-чеклист nivona-паттерна заполнен/пройден по плану §5.
- [ ] Code Reviewer: APPROVED.

---

## 2. Зависимости

| Тип | Путь / условие |
|-----|----------------|
| Архитектура | `artifacts/2026-07-23-df-quick-search-gen2/03-architecture.md` — **APPROVED** |
| Arch review | `reviews/arch-review.md` — must-fix нет; should-fix учесть в задачах 3, 6 |
| Анализ / матрица 21 | `01-analysis.md` §4 |
| Эталон markup + data-* | `projects/df_quick_search/widget/snippet.liquid` |
| SSOT JS / SCSS | `widget/snippet.js`, `widget/snippet.scss` |
| Референс темы | `projects/Пример 2 поколения/nivona.ru/` |
| Блокеры | **нет** — можно в реализацию сразу после Plan APPROVED |

---

## 3. Задачи

| # | Задача | Оценка (ч) | Зависит от | DoD задачи |
|---|--------|------------|------------|------------|
| 1 | Scaffold `widget-gen2/`: пустые dirs + `README.md` (отличие от gen-4, правило sync JS/CSS, ссылка на `docs/install.md`) | 0.5 | — | Дерево §3 на месте (без содержимого media/snippets пока) |
| 2 | Sync JS: скопировать `widget/snippet.js` → `media/df_quick_search.js` | 0.25 | 1 | Файлы идентичны по содержимому; в README одна строка «при релизе gen-4 — копировать» |
| 3 | Собрать `media/df_quick_search.css` из `snippet.scss` + **обязательно** перенести critical overlay/panel/`html.df-quick-search-open` из gen-4 `<style>`; опц. `df_quick_search.scss` как копия источника | 2.0 | 1 | Нет зависимости от inline `<style>` в gen-2 liquid; overlay/z-index работают |
| 4 | `config/settings_fieldset.html` — fieldset «Быстрый поиск DanForge», все 21 поле (матрица анализа) | 1.5 | 1 | Labels/name/`type`/`select option` совпадают с матрицей; nivona table-pattern |
| 5 | `config/settings_data.keys.json` — дефолты `df_qs_*` для merge в `presets.current` | 0.5 | 1 | Default-ON = `"1"`; default-OFF absent; trigger_selectors = §6.1; числа/строки как в §6 |
| 6 | `snippets/df_quick_search.liquid`: адаптер settings → data-*; markup панели; `<link>` CSS + `<script defer>` JS; articles JSON + cache fallback | 2.5 | 2, 3, 5 | Паритет атрибутов с gen-4; `| escape` на строках; checkbox §7 (явный if); без огромного inline style |
| 7 | `patches/layouts.layout.include.liquid.txt` — фрагмент include перед `scripts` | 0.25 | 1 | Готовый copy-paste для `layouts.layout.liquid` |
| 8 | `docs/install.md` (6 шагов + sync-заметка + out-of-scope checkout) и клиентский чеклист (§6) | 1.5 | 4, 5, 6, 7 | Клиент может установить без чтения архитектуры |
| 9 | Обновить `projects/df_quick_search/README.md`: секция Gen-2 → primary `widget-gen2/` | 0.5 | 1, 8 | Нет путаницы с `info.gen2.json` как primary |
| 10 | Прогнать unit-тесты gen-4; при необходимости добавить короткий fixture/checklist сверки имён `data-*` (без форка парсеров) | 1.0 | 6 | `node widget/tests/*.test.js` exit 0; контракт data-* сверен |
| 11 | Smoke по nivona-паттерну (локально по файлам темы + ручной gate на магазине — владелец) | 1.0 | 6, 8 | Чеклист §5.2 отмечен; блокеры зафиксированы если магазин недоступен |

**Сумма:** **11.5 ч** (≈ 1.5 рабочих дня).  
**Число задач:** **11**.

Параллелизация после #1: #2 ‖ #3 ‖ #4 ‖ #5 ‖ #7; затем #6; затем #8 → #9; #10 ‖ #11.

---

## 4. Порядок выполнения

```
1 Scaffold
 ├── 2 JS sync
 ├── 3 CSS (+ critical)
 ├── 4 Fieldset
 ├── 5 settings_data keys
 └── 7 Layout patch txt
        ↓
6 Liquid adapter (escape, checkbox, assets)
        ↓
8 install.md + чеклист клиента
 ├── 9 Root README
 ├── 10 Unit / контракт
 └── 11 Smoke nivona
```

### Файлы к созданию / изменению (из архитектуры §17)

| Путь | Действие | Задача |
|------|----------|--------|
| `projects/df_quick_search/widget-gen2/README.md` | создать | 1 |
| `projects/df_quick_search/widget-gen2/docs/install.md` | создать | 8 |
| `projects/df_quick_search/widget-gen2/snippets/df_quick_search.liquid` | создать | 6 |
| `projects/df_quick_search/widget-gen2/config/settings_fieldset.html` | создать | 4 |
| `projects/df_quick_search/widget-gen2/config/settings_data.keys.json` | создать | 5 |
| `projects/df_quick_search/widget-gen2/media/df_quick_search.js` | создать (копия) | 2 |
| `projects/df_quick_search/widget-gen2/media/df_quick_search.css` | создать | 3 |
| `projects/df_quick_search/widget-gen2/media/df_quick_search.scss` | опционально | 3 |
| `projects/df_quick_search/widget-gen2/patches/layouts.layout.include.liquid.txt` | создать | 7 |
| `projects/df_quick_search/README.md` | обновить секцию Gen-2 | 9 |

### Что НЕ делать

- Не менять `widget/snippet.js`, `snippet.liquid`, `snippet.scss`, `settings_form.json`, `settings_data.json`, `info.json` / `info.gen4.json` / `info.gen2.json`.
- Не форкать логику поиска в `df_quick_search.js`.
- Не менять handle gen-4 `danforge_quick_search` без отдельного ADR.
- Не вливать CSS в `theme.css` / `theme.scss` клиента.
- Не ставить include в checkout / client_account layouts.
- Не делать hybrid SimpleWidget + widget_lists как primary.
- Не писать ZIP/CI publish в этом релизе.
- Не править разметку `.header_search` темы — только селекторы + JS intercept.

### Should-fix Arch (обязательны в реализации)

1. Строки в `data-*`: `placeholder`, `popular_queries`, `trigger_selectors`, `article_blog_handles`, `articles_blog_url`, `articles-cache-key` — `| escape`.
2. Default-ON образец — явный `if == '1'` / else `'false'` (не `assign true` + `unless`).
3. Critical overlay styles из gen-4 `<style>` → в `df_quick_search.css` (чекбокс DoD).

---

## 5. Тест-план

### 5.1 Unit (reuse gen-4)

Запуск из корня продукта (как сейчас):

```bash
node projects/df_quick_search/widget/tests/settings.test.js
node projects/df_quick_search/widget/tests/fetch.test.js
node projects/df_quick_search/widget/tests/categories.test.js
```

- [ ] Все три — exit 0 после сборки пакета (регрессия SSOT JS не затронута).
- [ ] Отдельный suite для gen-2 **не обязателен**: парсеры читают `data-*`, контракт тот же.
- [ ] Ручная сверка: список `data-*` в gen-2 liquid ≡ gen-4 liquid (имена + `'true'`/`'false'` для bool). Допустимо короткий checklist в `widget-gen2/README.md` или комментарий в PR.

### 5.2 Smoke install (nivona-паттерн)

На копии / пилоте темы gen-2 (референс `nivona.ru`):

| # | Шаг | Ожидание |
|---|-----|----------|
| S1 | Залить snippet + js + css; fieldset; keys; include перед `scripts` | Нет 404 на assets; один root `data-df-quick-search-root` |
| S2 | Клик `.header_search` / `#header-search` / submit form | Открывается fullscreen-панель; форма шапки не уводит на `/search` до закрытия |
| S3 | Ввод ≥2 символов | Live-выдача; Escape / × / overlay закрывают |
| S4 | Enter / «Все результаты» | Переход `/search?q=…` |
| S5 | Desktop + mobile ширина | Split / tabs без поломки scroll |
| S6 | Без include (или убрать) | Панель отсутствует — документированный fail-mode |

Если живой магазин недоступен: Programmer отмечает S1–S6 как «verified against local theme files + logic» и передаёт владельцу ручной gate (nice-to-have Arch).

### 5.3 Матрица checkbox / ключевых настроек (ON/OFF)

Проверка в админке темы → сохранить → reload → DevTools на root + UI.

| # | Ключ | ON | OFF | Проверка |
|---|------|----|-----|----------|
| 1 | `df_qs_enabled` | `"1"` → `data-enabled="true"` | absent → `"false"` | OFF: клик триггера не открывает панель |
| 2 | `df_qs_show_photos` | фото в карточках | без фото | |
| 3 | `df_qs_show_prices` | цены видны | скрыты | |
| 4 | `df_qs_show_out_of_stock_badge` | бейдж OOS | нет бейджа | |
| 5 | `df_qs_show_product_sort` | UI сортировки | скрыт | |
| 6 | `df_qs_show_all_results` | ссылка «Все результаты» | скрыта | |
| 7 | `df_qs_show_categories` | категории | скрыты | |
| 8 | `df_qs_show_articles` | статьи (если блог есть) | нет блока статей | default OFF |
| 9 | `df_qs_articles_lazy_load` | lazy как gen-4 | eager-поведение per JS | default ON |
| 10 | `df_qs_hide_zero_price` | нулевые скрыты | показаны | default OFF |

Тексты / числа / select (smoke выборочно, не каждый бит):

| Ключ | Проверка |
|------|----------|
| `df_qs_placeholder` | placeholder input + `data-placeholder` (escaped) |
| `df_qs_popular_queries` | чипы popular |
| `df_qs_trigger_selectors` | кастомный селектор открывает панель |
| `df_qs_results_limit` / `articles_*` / `cols_*` / `image_ratio` | `data-*` совпадает; сетка/лимит визуально ок |

**Минимум для Code Reviewer:** enabled ON/OFF + show_photos + show_articles ON + hide_zero_price ON + trigger nivona-default + S2–S4.

---

## 6. Чеклист установки клиента (theme-snippet gen-2)

Адаптация `templates/insales-widget-checklist.md` под **не** SimpleWidget upload.

**Проект:** df_quick_search gen-2  
**Пакет:** `widget-gen2/`  
**Тема:** gen-2 (nivona-like)  
**Дата:** _______________

### Файлы в тему

- [ ] `snippets/df_quick_search.liquid` ← из пакета
- [ ] `media/df_quick_search.js`
- [ ] `media/df_quick_search.css`
- [ ] Fieldset из `config/settings_fieldset.html` вставлен в `config/settings.html`
- [ ] Ключи из `config/settings_data.keys.json` смержены в `presets.current` → `settings_data.json`
- [ ] В `templates/layouts.layout.liquid` после `modals`, **перед** `scripts`: `{% include "df_quick_search" %}`
- [ ] **Не** добавлено в checkout / account layouts
- [ ] Тема опубликована

### Smoke после установки

- [ ] Клик по поиску в шапке → панель
- [ ] `Включить быстрый поиск` OFF → панель/перехват не активны
- [ ] Enter → `/search?q=…`
- [ ] Desktop + mobile — панель открывается, scroll lock ок
- [ ] В DevTools: один `[data-df-quick-search-root]`, assets 200

### Настройки (ключевые)

- [ ] Фото / цены / категории / сортировка / «Все результаты» / OOS-бейдж — ON и OFF проверены
- [ ] Статьи: OFF по умолчанию; ON — индекс/выдача без падения страницы (`{% cache %}` или fallback)
- [ ] Селекторы триггеров подходят к теме (или обновлены)

### Обновление с gen-4

- [ ] После релиза gen-4 JS: скопировать `widget/snippet.js` → `widget-gen2/media/df_quick_search.js` и залить клиенту
- [ ] При смене стилей gen-4: пересобрать `df_quick_search.css` (включая critical overlay)

### Подпись

- Programmer: ___  
- Code Reviewer: APPROVED / NEEDS_REVISION  
- Jarvis / владелец: готово к клиенту ☐

Полный текст шагов — в `widget-gen2/docs/install.md` (задача 8).

---

## 7. Риски

| # | Риск | Митигация |
|---|------|-----------|
| 1 | Checkbox OFF не работает (absent трактуют как ON) | Явный `if == '1'`; дефолты `"1"` только в keys; тест §5.3 #1 |
| 2 | Забыли `| escape` → XSS/битый HTML в data-* | Should-fix в DoD задачи 6; сверка с gen-4 liquid |
| 3 | CSS без critical overlay → панель «под» шапкой / не fullscreen | Задача 3 + DoD чекбокс critical styles |
| 4 | Submit формы шапки уводит на `/search` | Триггеры включают form/button; smoke S2 |
| 5 | Рассинхрон JS gen-4 ↔ gen-2 | Копия + заметка sync в README/install |
| 6 | `{% cache %}` нет на части gen-2 | Fallback без cache в liquid; smoke статей |
| 7 | Два include → два root | Документ: ровно один; JS идемпотентен |
| 8 | Путают SimpleWidget `info.gen2.json` с primary | README root + widget-gen2 README |
| 9 | Регрессия gen-4 при «顺便 поправить» | Явный запрет правок `widget/`; Code Reviewer diff-check |
| 10 | Smoke только на файлах, не на live | Владелец — ручной gate; не блокер сдачи кода при зелёном local |

---

## 8. Критерии готовности плана → Programmer

После **Plan Reviewer APPROVED**:

1. Programmer выполняет задачи 1→11 в порядке §4.
2. Артефакты только в `widget-gen2/` (+ правка корневого README).
3. Сдача: дерево пакета + зелёные unit + заполненный клиентский чеклист (§6) + Code Reviewer.

**Оценка суммарно:** 11.5 ч · **задач:** 11 · **блокеров:** нет · **готовность к Plan Reviewer:** да.
