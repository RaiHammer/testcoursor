# Review: Plan Reviewer — DanForge Reviews Slider Phase 2

**ID задачи:** `2026-07-13-reviews-sources-refactor`  
**Дата:** 2026-07-13  
**Ревьюер:** Plan Reviewer  
**Версия артефакта:** `04-plan.md` (черновик, 2026-07-13)

## Вердикт

**NEEDS_REVISION**

План зрелый: spike-gate, rollback, тест-матрица и декомпозиция задач 0–7 соответствуют `03-recommendation.md`. Блокирующие расхождения — scope `lazy_yandex` vs `02-spec.md`, неполное покрытие `insales-widget-checklist.md` в задаче 7 и отсутствие NFR-1 в DoD. После точечных правок плана (≈30 мин) — повторный gate.

## Чеклист

| # | Критерий | Статус | Комментарий |
|---|----------|--------|-------------|
| 1 | Каждое must-требование spec → хотя бы одна задача | ⚠️ | FR-I1–I8, FR-Y1–Y6, FR-T1–T7, FR-A1–A4, FR-S1–S4 покрыты. `lazy_yandex` (spec §3, §6.1) — в G2 как Phase 3, задачи нет |
| 2 | Зависимости корректны, нет циклов | ✅ | T0→T1/T2/T5, T3→T2, T2→T4→T6, T5→T6→T7; параллель T0∥T3 корректна |
| 3 | Порядок выполнения логичен | ✅ | Spike до Liquid/AJAX; CLI параллельно; JS после Liquid; tests/docs в конце |
| 4 | Тест-план есть (unit / ручная / e2e) | ✅ | §8.1–8.4: unit (JS+CLI), ручная матрица 6 layouts × 3 tabs, platform/Liquid, regression |
| 5 | Definition of Done определён | ⚠️ | §10 полный, но NFR-1 (FCP +20%) не в DoD — только G6 |
| 6 | Нет пропущенных шагов (деплой, документация, миграция) | ✅ | Rollback §9, migration в задаче 7, theme upload, transition fallback |
| 7 | Оценки реалистичны | ✅ | 14–20 ч согласуется с `03-recommendation.md` (12–18 + 2 spike); сумма задач ≈18.5 ч |
| 8 | Spike blocker handling | ✅ | T0 блокирует T1/T2/T5; fallback-матрица; артефакт `spike-paginate-report.md`; внешний блокер (URL пилота) зафиксирован |
| 9 | Rollback strategy | ✅ | §9.1–9.4: быстрый/частичный откат, transition period, backup cache |
| 10 | Settings scope | ⚠️ | Задача 1: `insales_prefetch_limit`, `insales_ajax_loadmore`, `yandex_prefetch_limit` — OK. `lazy_yandex` вынесен без синхронизации spec |
| 11 | inSales widget checklist alignment | ❌ | Задача 7 упоминает checklist, но нет конкретных строк для новых настроек и dual-source поведения |
| 12 | Spec/plan traceability | ⚠️ | Gaps §12 хороший self-review; G10: `02-spec.md` draft v0.1 без Spec Review gate |

## Покрытие требований ТЗ (выборочная матрица)

| Spec ID | Задача(и) | Статус |
|---------|-----------|--------|
| FR-I1–I5, I8 | 0, 2 | ✅ |
| FR-I6 | G1 out of scope | ✅ (явно) |
| FR-I7 | — (без изменений) | ✅ |
| FR-Y1–Y6 | 3, 7 | ✅ |
| FR-T1–T7 | 2.8, 4 | ✅ |
| FR-A1–A4 | 4.3 | ✅ |
| FR-S1–S4 | 2, 3, 4 | ✅ |
| `lazy_yandex` §3, §6.1 | G2 → Phase 3 | ❌ расхождение со spec |
| EventBus reload §8 | G3 → Phase 3 | ✅ (optional, согласовано с recommendation) |
| NFR-1 FCP | G6 только | ⚠️ |
| NFR-2–NFR-5 | 6, 7 | ✅ |

## Критические замечания (must fix)

1. **`lazy_yandex` — scope conflict spec vs plan.**  
   `02-spec.md` §3 и §6.1 описывают `lazy_yandex` как Phase 2; план переносит в Phase 3 (G2) без задачи.  
   **Действие:** выбрать один вариант и зафиксировать в плане §1 + §12:
   - **A)** Amend spec: пометить `lazy_yandex` как Phase 3 (согласовать с `03-recommendation.md`) — предпочтительно; или  
   - **B)** Добавить задачу (напр. 1b + 2b + 4b): checkbox в settings, условный include в Liquid, fetch по клику в JS (+1.5–2 ч к оценке).

2. **`insales-widget-checklist.md` — неполный scope в задаче 7.**  
   Текущий checklist не содержит `insales_prefetch_limit`, `insales_ajax_loadmore`, проверку merge «Все», AJAX load-more. Задача 7 формулировка «пункты dual-source» слишком расплывчата.  
   **Действие:** в задаче 7 перечислить конкретные дополнения:
   - строки в таблице настроек: `insales_prefetch_limit`, `insales_ajax_loadmore` (ON/OFF + data-attrs);
   - секция «Dual-source»: вкладки Все/InSales/Яндекс, tie-break, hide при одном источнике;
   - пункт «Theme snippets»: `danforge_reviews_yandex.liquid` upload + legacy fallback;
   - regression: `source-tabs` + обновлённый `visibility.html`.

3. **NFR-1 не в Definition of Done.**  
   G6 рекомендует Lighthouse, но §10 DoD не включает измерение FCP до/после на пилоте.  
   **Действие:** добавить в §10 или DoD задачи 7: «Lighthouse FCP на пилоте: delta ≤ +20% vs baseline (или задокументированное отклонение с причиной)».

4. **Ручной тест G12 (AJAX + tab «Все») не в матрице §8.2.**  
   Сложный edge (merge после AJAX append) описан только в G12.  
   **Действие:** добавить в §8.2 отдельный сценарий: «masonry/list, tab Все, load-more inSales → порядок merged list корректен, pagination page 1».

## Рекомендации (should fix)

1. **Open question `reviews-page-url` (§12 п.2):** зафиксировать решение до закрытия spike — «без настройки в Phase 2, CTA hardcoded на `/reviews` / `blog.url`» или «добавить optional setting в задачу 1» (+0.5 ч).

2. **Задача 6 — marquee/spotlight:** в DoD задачи 4 указаны 6 layouts; в `source-tabs.test.js` покрыт merge/pagination, но нет явного fixture для marquee reinit. Добавить в задачу 6: обновить `layouts.test.js` fixture с mixed sources для spotlight + marquee.

3. **Spec Review gate (G10):** перед Programmer рекомендуется APPROVED на `02-spec.md` v0.2 с синхронизированным Phase 2/3 scope — иначе programmer будет читать устаревший §3.

4. **Оценка задачи 2 (4 ч):** при выборе theme snippet вместо widget partial (G8) заложить +1 ч buffer или явную decision point после spike в задаче 2.

5. **`data-sort-ts` контракт (G7):** зафиксировать в задаче 2 DoD: «Unix seconds (`date: '%s'`)» — не оставлять на усмотрение programmer без записи в плане.

## Предложения (nice to have)

1. Добавить в §9.1 чеклист отката: «сохранить screenshot/запись visibility.html PASS до деплоя» для сравнения при инциденте.

2. В задаче 0 DoD: явно указать минимальный набор HTML-артефактов (скрин или paste фрагмента prefetch output) для audit trail.

3. После APPROVED плана — создать `05-implementation-notes.md` с решениями spike для programmer (URL, limit, CTA).

## Сильные стороны плана

- Spike как hard gate до Liquid/AJAX — правильная последовательность для inSales gen-4.
- Rollback §9 покрывает widget, theme, CLI и transition period.
- Тест-план §8.2 с 6 layouts × 3 tabs + edge cases (`hide_*`, transition fallback) — адекватен риску regression.
- Gaps §12 — честный self-review; зависимости и параллелизация T0∥T3 продуманы.
- Оценка 14–20 ч реалистична при условии scope Phase 2 = `03-recommendation.md` (без lazy_yandex).

## Следующий шаг

**NEEDS_REVISION** → вернуть Планировщику с пунктами 1–4 (must fix). После правок `04-plan.md`:

1. Повторный Plan Review gate.  
2. При APPROVED → **Programmer** начинает с задачи **0** (spike) и **3** (CLI) параллельно.  
3. Параллельно рекомендуется Spec Review `02-spec.md` v0.2 (синхронизация Phase 2/3 scope).
