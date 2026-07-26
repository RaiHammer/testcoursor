# Ретро: багфикс df_reviews_slider (14–15.07.2026)

**Дата:** 2026-07-15  
**Проект:** `projects/df_reviews_slider/`  
**Версия:** v1.2.1 (post-owner + Jul 15 fixes)  
**Контекст:** сессии после спринта CLI/e2e (14.07) и правок владельца в админке inSales; фиксы 15.07 по макетам, marquee и AJAX на armedf.ru.

---

## 1. Что получилось

### Исправленные баги (15.07)

| # | Симптом | Решение | Файлы |
|---|---------|---------|-------|
| 1 | Spotlight / Masonry не переключаются в редакторе | `parseLayout` + Liquid `contains`: алиасы «Режим фокуса», «Мансори» | `snippet.js`, `snippet.liquid` |
| 2 | В select админки видны английские ключи (`masonry`, `spotlight`) | Порядок options → `[label, value]` по спецификации gen-4 | `settings_form.json` |
| 3 | Marquee: popup обрезается shell overflow | `shouldApplyShellOverflowHidden`: marquee не скрывает overflow при открытом overlay | `snippet.js`, `snippet.scss` |
| 4 | Marquee: дубли слайдов при смене вкладок | Дедупликация по `reviewId` (`getSlideDedupeKey`) | `snippet.js` |
| 5 | Marquee: пустой старт слева, сброс анимации при tab switch | Восстановление `animation-delay`, offset, пересборка track без лишних clone | `snippet.js` |
| 6 | Marquee ломает горизонтальную вёрстку страницы | `min-width: 0` на flex-цепочке, `layout:has(.df-reviews--layout-marquee)` + containment | `snippet.scss` |
| 7 | armedf: AJAX load-more на главной не работает | Подтверждено исследованием: `/?page=2` ≠ пагинация отзывов; fallback `/blogs/shop-reviews` — корректен | liquid+js (ранее), `01-research.md` |

### Сохранение правок владельца (14.07)

- Зафиксирован эталон в `artifacts/2026-07-14-owner-widget-edits/01-owner-changes.md`.
- Критичные team fixes (AJAX URL auto, lazy Yandex, pagination JS) **не откачены** при merge owner edits.
- Продуктовые overrides приняты: `source-tabs: false`, default tab yandex, prefetch 20, вкладка «Описание», layout-* поля, floating CTA.

### Рост покрытия тестами

| Метрика | До (14.07) | После (15.07) |
|---------|------------|---------------|
| Widget unit checks | 142 | **179** (+37) |
| Новые файлы | — | `settings-form.test.js` (10), `marquee.test.js` (19) |
| Обновлены | — | `layouts.test.js`, `settings-sync.test.js` (русские алиасы) |
| CLI unittest | 27 | 27 (`test_theme_id.py` из спринта 14.07) |
| Playwright e2e | 6/6 | 6/6 (**не перезапускался** после 15.07) |

### Документация и KB

- README, CHANGELOG → v1.2.1; `knowledge/danforge/products/df-reviews-slider.md` обновлён.
- GTM-материалы: FAQ про masonry/якорь, русские названия режимов (`02-docs-audit.md`).
- AJAX-архитектура задокументирована: двухуровневая модель (universal tier + masonry anchor).

---

## 2. Что не получилось / отложено

| # | Пункт | Причина / решение владельца | Приоритет |
|---|-------|----------------------------|-----------|
| 1 | **AJAX anchor probe** при init (автоскрытие load-more без якоря) | Outline в research; **не реализован** — ждёт явного APPROVED, не «универсальный probe» без оценки UX | P2 |
| 2 | **Деплой виджета на armedf.ru** | CLI залил Yandex-сниппет 14.07; сам виджет на витрине **не установлен** на момент research | P0 |
| 3 | **Скрины для GTM** | Чеклист есть, папка `gtm/screenshots/` пуста | P0 |
| 4 | **dist zip** v1.2.1 | Не пересобран после Jul 15 fixes | P1 |
| 5 | Guard `hide_yandex=true` + default tab `yandex` | Рекомендация code review; не блокер | P3 |
| 6 | PyInstaller / one-file CLI | v2 backlog | P3 |
| 7 | Запрос в InSales про storefront reviews API | Spike backlog | — |
| 8 | E2E после marquee/parseLayout фиксов | Отложено; unit покрывает логику, не полный DOM | P1 |

**Решение владельца (зафиксировано):** Masonry server load-more **не обещать** без pagination anchor; на главной — prefetch до 50, кнопка скрыта. Отдельная витринная страница отзывов **не обязательна**, якорь может быть техническим блогом.

---

## 3. Корневые причины проблем

### Паттерн A: inSales сохраняет label, не value

Уже известен с 11.07 (`2026-07-11-df-reviews-slider-settings-analysis.md`), но **рецидив** после переименования владельцем:

- `display_mode`: «Режим фокуса» / «Мансори» вместо `spotlight` / `masonry`.
- Парсеры покрывали EN + частичные RU («колон», «фокус»), но **не точные owner labels** до фикса 15.07.

**Урок:** любое изменение `label` в `settings_form.json` = обязательное обновление Liquid `contains` + JS `parseLayout` + unit-тест.

### Паттерн B: неверный порядок select options

Команда использовала `[value, label]`; gen-4 inSales ожидает **`[label, value]`**. Симптом: в UI видны ключи `masonry`, `spotlight`.

**Урок:** автотест `settings-form.test.js` на порядок options — обязателен для каждого select в форме.

### Паттерн C: marquee — недотестированный «сложный» макет

Marquee сочетает CSS animation, JS clone track, dual-source tabs и modal overlay. Баги всплыли **пакетом** при реальном использовании, не в редакторе slider/spotlight.

| Подпроблема | Причина |
|-------------|---------|
| Popup clip | Глобальный `overflow: hidden` на shell |
| Tab duplication | Clone track не фильтровал уже загруженные `reviewId` |
| Пустой старт / restart animation | Смена вкладки пересобирала track без сохранения offset/delay |
| Horizontal overflow | Flex children без `min-width: 0`; marquee track шире viewport |

### Паттерн D: платформенная модель пагинации InSales

`paginate.current_page` на главной пагинирует **контент страницы**, не `account.reviews_not_spam`. Это не баг виджета, а **ограничение платформы** — подтверждено curl на armedf.ru.

### Паттерн E: owner rename side effects

Владелец переименовал labels и defaults **в админке** (14.07) без предварительного sync с командой. Технические фиксы сохранены, но:

- GTM-тексты (13.07) расходятся с owner defaults (`source-tabs`, prefetch).
- Русские labels сломали parseLayout до 15.07.
- Репозиторий **без git-коммитов** — diff только через артефакты и timestamps файлов.

### Паттерн F: отсутствие smoke «все 6 макетов + RU labels»

Чеклист v1.2.1 требует 6 layouts, но **ручной smoke в inSales editor** после owner rename не выполнялся до появления багов.

---

## 4. Где были проблемы в процессе

| # | Проблема | Проявление | Влияние |
|---|----------|------------|---------|
| 1 | **Множественные итерации** на одной теме (marquee — 4+ подфикса за сессию) | ADR 2026-07-10: «стоп после 2+ итераций → ретро» — **не сработал** до 15.07 | Повторная работа, усталость |
| 2 | **Нет git-коммитов** в `df_reviews_slider` | `git diff` пуст; сравнение через артефакты и mtime | Риск потери истории, сложный merge |
| 3 | **Параллельные subagents** | Спринт 14.07: CLI, e2e, AJAX research, owner edits — пересечение контекста | Дублирование, риск отката чужих фиксов |
| 4 | **Owner edits mid-sprint** | 6 файлов widget изменены владельцем 14.07 без PR/чеклиста | Нужен отдельный артефакт `01-owner-changes.md` постфактум |
| 5 | **E2E не гонялся** после 15.07 | Unit 179 green, e2e статус «6/6 со спринта» | Пробел в регрессии marquee в браузере |
| 6 | **Документация отставала** | GTM/KB на 13.07 vs owner 14.07 — закрыто только на совещании 15.07 | Риск неверных обещаний клиенту |

**Что сработало в процессе:**

- Быстрое AJAX-исследование с live curl (armedf) вместо догадок.
- Явный артефакт owner overrides — снижает риск отката при следующих задачах.
- Новые unit-тесты сразу после фикса (settings-form, marquee).

---

## 5. Как предотвратить в будущем

### Процесс (см. ADR 2026-07-10-quality-process)

1. **Триггер ретро:** после 2-й итерации багфикса на одной задаче — **стоп код**, ретро + KB, затем продолжение (теперь выполнено этим документом).
2. **Git-коммиты** в `projects/df_reviews_slider/` после каждой логической порции (owner sync, bugfix batch, test add).
3. **Owner edit protocol:** владелец меняет widget в админке → сразу заливка в repo + строка в `01-owner-changes.md` (или bump секции) **до** следующего Programmer.
4. **Параллельные subagents:** Jarvis не запускает Programmer на `widget/*`, пока не закрыт owner-diff артефакт.

### Чеклист (`templates/insales-widget-checklist.md`) — дополнить

- [ ] Каждый `select`: `node settings-form.test.js` — порядок `[label, value]`
- [ ] Каждый `display_mode` option: парсится и в Liquid, и в JS (EN key + RU label + owner alias)
- [ ] Smoke **все 6 макетов** в inSales editor после смены labels
- [ ] Marquee: tab switch InSales↔Yandex, popup, горизонтальный scroll страницы
- [ ] Masonry: load-more только при anchor URL; на главной без якоря — кнопка скрыта

### Тесты — добавить / поддерживать

| Тест | Назначение | Статус |
|------|------------|--------|
| `settings-form.test.js` | Порядок options, parseLayout на RU labels | ✅ 15.07 |
| `marquee.test.js` | Dedupe, overflow policy, animation restore | ✅ 15.07 |
| e2e: marquee tab + popup | DOM-регрессия | ⏳ добавить в `dual-source.spec.js` |
| Liquid parse test (опц.) | `_layout_raw contains` для owner labels | backlog |

### KB — обновления

| Файл | Действие |
|------|----------|
| `knowledge/strategy/decisions/2026-07-15-insales-label-parsing.md` | **Создан** — ADR snippet паттерна label parsing |
| `knowledge/platforms/insales-widgets.md` | Ссылка на ADR; правило owner-rename |
| `artifacts/2026-07-14-owner-widget-edits/01-owner-changes.md` | Источник истины для merge — не удалять |

---

## 6. Action items

| # | Действие | Владелец | Срок | P |
|---|----------|----------|------|---|
| 1 | Установить виджет на armedf `/blogs/shop-reviews`, smoke load-more | Programmer + владелец | эта неделя | P0 |
| 2 | Снять demo-скрины (6 макетов, dual-source) | Владелец | до Kwork | P0 |
| 3 | Пересобрать `dist/danforge-reviews-slider.zip` v1.2.1 | Programmer | после armedf smoke | P1 |
| 4 | Прогнать e2e + ручной marquee smoke в inSales | Programmer | до zip | P1 |
| 5 | Первый git commit в `df_reviews_slider` (v1.2.1 snapshot) | Владелец / Jarvis | сразу | P1 |
| 6 | `artifacts/armedf-pilot/01-deploy-runbook.md` после деплоя | Analyst | post-deploy | P2 |
| 7 | Решение: AJAX anchor probe — делать или нет | Владелец | backlog | P2 |
| 8 | Guard `hide_yandex` + default tab yandex | Programmer | v1.2.2 | P3 |
| 9 | e2e сценарий marquee (tabs + popup) | Programmer | v1.2.2 | P2 |
| 10 | Client one-pager post-sale (без CLI) | Analyst + Designer | до первой продажи | P2 |

---

## Метрики (оценочно)

| Метрика | 10.07 (ретро #1) | 15.07 (это ретро) |
|---------|------------------|-------------------|
| Итераций багфикса настроек/макетов | 5+ | 3 волны (11.07 settings, 14.07 AJAX+owner, 15.07 marquee+labels) |
| Unit checks | ~10 (settings) | **179** |
| Время на баги vs фичи (оценка) | ~60% | ~40% (тесты снижают повторы) |
| Цель на v1.3 / следующий виджет | ≤1 итерация после CR | ≤1 + обязательный owner-diff артефакт |

---

## Связанные артефакты

- `artifacts/2026-07-14-owner-widget-edits/01-owner-changes.md`
- `artifacts/2026-07-14-reviews-ajax-research/01-research.md`
- `artifacts/2026-07-15-reviews-project-meeting/01-work-report.md`
- `artifacts/2026-07-11-df-reviews-slider-settings-analysis.md`
- `artifacts/retrospectives/2026-07-10-df-reviews-slider-retro.md`
- `knowledge/strategy/decisions/2026-07-10-quality-process.md`
- `knowledge/strategy/decisions/2026-07-15-insales-label-parsing.md`

---

## Вывод

Вторая волна багов — не «плохой код», а **предсказуемые платформенные и процессные рецидивы**: label вместо value, owner rename без тестов, сложный макет без e2e. Фиксы 15.07 закрыли симптомы и добавили **превентивные тесты**; главный оставшийся риск — **отсутствие деплоя и git-истории**, а не логика виджета.
