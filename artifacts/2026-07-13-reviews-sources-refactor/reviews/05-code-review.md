# Review: Code Reviewer — DanForge Reviews Slider Phase 2 dual-source

**ID задачи:** `2026-07-13-reviews-sources-refactor`  
**Дата:** 2026-07-13  
**Ревьюер:** Code Reviewer  
**Версия артефакта:** Phase 2 implementation (`05-report.md`)

## Вердикт

**APPROVED**

Реализация соответствует **решениям владельца** (`00-owner-decisions.md`): dual-source без вкладки «Все», InSales через Liquid prefetch, Яндекс через CLI-only snippet, сортировка по дате DESC. Критических багов и уязвимостей не обнаружено. Есть предупреждения по документации, spike-артефакту и edge-case вкладок — не блокируют merge при условии ручного smoke на пилоте.

---

## Чеклист

| # | Критерий | Статус | Комментарий |
|---|----------|--------|-------------|
| 1 | Соответствие плану и spec (с учётом owner decisions) | ✅ | Owner override: нет «Все», нет `mergeAllSourcesByDate`; dual-source, date DESC — выполнено |
| 2 | Нет критических багов | ✅ | Tab visibility через `.is-hidden` + CSS `!important`; pagination снимает inline `display`, класс сохраняется |
| 3 | Безопасность (XSS, инъекции, секреты) | ✅ | CLI: `liquid_escape()` на user content; Liquid inSales — платформенный контент (как до рефактора); fetch same-origin |
| 4 | Код читаем, именование понятное | ✅ | `switchSourceTab`, `loadInsalesPage`, `sample_yandex_reviews` — ясные границы |
| 5 | Минимальный diff, без лишнего рефакторинга | ✅ | Фокус на dual-source; legacy path сохранён |
| 6 | Тесты адекватны изменениям | ⚠️ | JS/CLI unit green; `source-tabs.test.js` дублирует helpers, не импортирует `snippet.js` |
| 7 | Error handling на месте | ✅ | AJAX: disable/hide on fail; empty states; legacy fallback |
| 8 | `insales-widgets.md` учтён | ✅ | `hide_*` only-on-true; hyphen/underscore keys; `min_rating` help обновлён |
| 9 | Нет default-on show_* без явного true | ✅ | `df_hide_* = 'false'` unless explicit true |
| 10 | `widget/tests/*.test.js` проходит | ✅ | 6+11+14+26+16 checks OK (локальный прогон 2026-07-13) |
| 11 | CLI standard run без inSales API | ✅ | `run(..., fetch_insales=False)` по умолчанию; `--insales-backup` opt-in |
| 12 | Нет `random.shuffle` в Yandex pipeline | ✅ | `sample_yandex_reviews`: sort DESC, slice; shuffle только в legacy `weighted_sample` |
| 13 | Документация / checklist (задача 7) | ⚠️ | `CHANGELOG`, `README`, `INSTRUCTION.md` не синхронизированы с dual-source |
| 14 | Spike / AJAX fallback (задача 0) | ⚠️ | `spike-paginate-report.md` отсутствует; есть `insales-ajax-url` + prefetch limit |

---

## Соответствие owner decisions и spec

### Owner decisions (`00-owner-decisions.md`) — выполнено

| Решение | Реализация | Файл |
|---------|------------|------|
| Prefetch на любой странице | `{% prefetch account.reviews_not_spam ... sort: 'date_desc' %}` | `widget/snippet.liquid:455–519` |
| Нет вкладки «Все» | Только `data-source-tab="insales"` / `"yandex"` | `snippet.liquid:321–329` |
| Нет merge | `switchSourceTab` — visibility only; `showAll = !source` при tabs off | `snippet.js:2335–2366`, `2307–2324` |
| CLI только Яндекс | `SNIPPET_INNER_NAME = danforge_reviews_yandex.liquid`, `sample_yandex_reviews` | `cli/get_reviews.py:25,607–616,1001–1003` |
| Phase 1 пропущен | sort + tabs в Phase 2 | — |

### Spec deltas (ожидаемые)

| Spec ID | Статус | Комментарий |
|---------|--------|-------------|
| FR-T1, FR-T7, FR-A1–A4 | **N/A (owner override)** | Вкладка «Все» и client merge намеренно не реализованы |
| FR-I1–I5, I8 | ✅ | prefetch, min_rating Liquid, hide_insales, reviews_enabled |
| FR-Y1–Y6 | ✅ | Yandex-only CLI, sort DESC, `data-sort-ts`, legacy fallback |
| FR-S1–S4 | ✅ (без FR-S3) | Server/client DESC per source; no shuffle in production path |
| `lazy_yandex` | Out of scope | Не в settings — согласовано с plan G2 |

---

## Проверка по файлам

### Widget Liquid (`snippet.liquid`)

**Сильные стороны:**
- Dual blocks: prefetch inSales + include Yandex; legacy fallback при пустом yandex snippet (`246–256`, `443–447`).
- `data-source`, `data-sort-ts`, `data-review-id` на inSales-карточках.
- `min_rating` фильтр до рендера (`461`).
- Default tab: insales если есть count + enabled (`258–263`).
- AJAX markup `[data-df-insales-loadmore]` при `df_insales_count > df_insales_limit` (`571–577`).

**Замечания:**
- `data-insales-ajax-enabled="true"` захардкожен (`407`) — в плане задача 1 предполагала checkbox `insales_ajax_loadmore`.
- Вкладка Яндекс рендерится без проверки `df_yandex_trimmed != blank` (`327–330`) — при пустом snippet таб виден, контент пустой.
- Вкладка InSales не скрывается при `df_insales_count == 0` (только `reviews_enabled?`) — plan §2.8.

### Widget JS (`snippet.js`)

**Сильные стороны:**
- `filterSlides`: без `.remove()`, только `is-hidden` для Yandex + min_rating (`3222–3250`).
- `switchSourceTab`: visibility → reindex → pagination reset → layout reinit (`2335–2366`).
- `loadInsalesPage`: dedupe по `data-review-id`, scroll preserve, reinit после append (`2414–2489`).
- `updateSourceTabsVisibility`: скрытие панели при одном видимом табе (`2550–2556`).
- Tabs off: `applySourceVisibility(root, null)` — оба источника видны (`2370–2375`).

**Замечания:**
- `loadInsalesPage` fallback-селектор `.df-reviews__slide[data-source="insales"]` без scope на виджет (`2438–2440`) — риск при нескольких блоках на странице ответа.
- `source-tabs.test.js` не покрывает `switchSourceTab` / `loadInsalesPage` в runtime.

### CLI (`get_reviews.py`, `gui.py`)

**Сильные стороны:**
- Standard `run()` → `sample_yandex_reviews` без `fetch_insales_reviews` (`979–1003`).
- Sort: `sorted(..., reverse=True)` + `review_sort_ts` в `render_slide` (`611–616`, `712–716`).
- `--insales-backup` flag (`1178–1180`, `1236`).
- `config.example.json`: `source_mode: "yandex"`, `yandex_limit` — OK.
- GUI fallback yandex → legacy liquid path (`gui.py:423–425`).

**Замечания:**
- `load_config` default `source_mode: "mix"` (`83`) vs `Config.source_mode = "yandex"` (`58`) — для standard run не влияет (fetch_insales=False), но может путать при `--insales-backup`.
- Docstring L3 всё ещё «inSales + Яндекс» — устарело.

### Settings

- `insales-prefetch-limit`, `insales-ajax-url` добавлены с `enable_server_reload: true` — OK.
- `settings_data.json` keys match `name` — OK.
- `min_rating` help обновлён per platform doc (`settings_form.json:58`).

### Tests

```
node widget/tests/settings.test.js          — 6 OK
node widget/tests/settings-matrix.test.js   — 11 OK
node widget/tests/layouts.test.js           — 14 OK
node widget/tests/pagination.test.js        — 26 OK
node widget/tests/source-tabs.test.js       — 16 OK
cd cli && python -m unittest discover -s tests — 10 OK
```

`visibility.html` — без dual-tab fixtures (report подтверждает); ручной smoke остаётся обязательным.

---

## inSales widget checklist (pre-deploy)

| Пункт | Авто | Ручная проверка |
|-------|------|-----------------|
| hide_insales / hide_yandex | ✅ Liquid + JS | ☐ редактор ON/OFF |
| source-tabs InSales \| Яндекс (без «Все») | ✅ markup | ☐ 6 layouts × 2 tabs |
| insales-prefetch-limit → data attr | ✅ | ☐ server reload |
| insales-ajax-url | ✅ | ☐ load-more на странице отзывов |
| Theme: `danforge_reviews_yandex.liquid` upload | — | ☐ обязательно |
| Legacy fallback `danforge_reviews_slides` | ✅ Liquid | ☐ transition client |
| Swiper loop duplicates + hide | ⚠️ не в unit | ☐ checklist §HTML |

---

## Критические замечания (must fix)

*Нет.*

---

## Рекомендации (should fix)

1. **Документация (задача 7)** — `README.md`, `cli/INSTRUCTION.md`, `CHANGELOG.md` всё ещё описывают mix-mode / `danforge_reviews_slides` как primary. Обновить workflow: CLI → только Yandex snippet; InSales → prefetch виджета. Spec acceptance #5.

2. **Скрытие пустых вкладок** — `snippet.liquid:327–330` и `updateSourceTabsVisibility` не учитывают count/slide presence. Plan §2.8: скрыть InSales tab при count=0; Yandex tab при пустом include.

3. **`insales_ajax_loadmore` setting** — вместо hardcoded `data-insales-ajax-enabled="true"` (`snippet.liquid:407`) добавить checkbox per plan §5.1 или явно задокументировать «always on».

4. **Spike artifact** — `spike-paginate-report.md` не создан; перед production зафиксировать поведение prefetch/AJAX на главной vs `/product/shop-reviews`.

5. **`loadInsalesPage` selector scope** — ограничить парсинг ответа контейнером `[data-danforge-widget="danforge_reviews_slider"]` (`snippet.js:2438–2440`).

6. **`visibility.html`** — добавить fixture с `data-source-tabs="true"` и двумя табами для smoke dual-source.

---

## Предложения (nice to have)

1. Синхронизировать docstring `get_reviews.py:3` и `load_config` default `source_mode` → `"yandex"`.
2. Экспортировать pure functions из `snippet.js` для тестов вместо дублирования в `source-tabs.test.js`.
3. Убрать неиспользуемый класс `df-reviews__slide--source-hidden` или добавить CSS rule.
4. Раздельные empty states per source (plan §2.5) — сейчас один общий empty slide.

---

## Следующий шаг

**APPROVED** → перед заливкой клиенту:

1. Ручная матрица: `{slider, masonry, grid, list, spotlight, marquee}` × `{insales, yandex}` × `{desktop, mobile}`.
2. Smoke AJAX load-more на странице с paginate.
3. Upload `snippets/danforge_reviews_yandex.liquid` + пересохранение виджета в редакторе.
4. Обновить README / INSTRUCTION / CHANGELOG (можно отдельным commit до release tag).
5. Jarvis: подписать `templates/insales-widget-checklist.md` после pilot smoke.
