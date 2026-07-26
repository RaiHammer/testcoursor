# Review: Code Review — df_quick_search v1.0.10 UX

**ID задачи:** `2026-07-24-df-quick-search-ux-i18n`  
**Дата:** 2026-07-24  
**Ревьюер:** Code Reviewer  
**Версия артефакта:** v1.0.10  
**Основание:** `01-analysis.md` (02-spec / 04-plan отсутствуют — упрощённый конвейер)

## Вердикт

**APPROVED**

## Чеклист

| # | Критерий | Статус | Комментарий |
|---|----------|--------|-------------|
| 1 | Соответствует плану / analysis (#1–2; #3 без кода) | ✅ | Appear CSS + second-image JS/CSS; i18n только анализ |
| 2 | Нет критических багов | ✅ | Graceful single/duplicate image; dual-img только при second URL |
| 3 | Безопасность (XSS / секреты) | ✅ | `escapeHtml` на src; `alt=""` + `aria-hidden` на hover img; секретов нет |
| 4 | Код читаем, минимальный diff | ✅ | Точечные хелперы + CSS; без лишнего рефакторинга |
| 5 | Тесты адекватны | ✅ | `settings.test.js` — second URL / single / duplicates / wrap class; `node …` exit 0 |
| 6 | Error handling | ✅ | `pickProductSecondImage` → null при отсутствии данных |
| 7 | Liquid chrome не тронут | ✅ | gen-2 liquid без hover/appear; CHANGELOG: liquid без изменений |
| 8 | Нет mobile hover flash | ✅ | `@media (hover: hover) and (pointer: fine)` |
| 9 | Perf: только opacity/transform | ✅ | `@keyframes df-quick-search-appear` + opacity crossfade |
| 10 | `prefers-reduced-motion` | ✅ | Appear off; image `transition: none` |
| 11 | Skeleton игнорирует `--hover` | ✅ | `bindProductImages` early-return для `--hover` |
| 12 | Sync gen-4 ↔ gen-2 | ✅ | `pickProductSecondImage` в `widget-gen2/media/df_quick_search.js`; CSS rules в `.css` |
| 13 | inSales: нет default-on show_* | ✅ | Настройки / Liquid bool не менялись |
| 14 | Версия / CHANGELOG | ✅ | v1.0.10 в info*.json, README, FEATURES, CHANGELOG |

## Критические замечания (must fix)

_Нет._

## Рекомендации (should fix)

1. **Bandwidth на touch:** второе `<img loading="lazy">` всё равно попадает в DOM на mobile (не показывается, но может подгружаться). В analysis принято; при жалобах на трафик — грузить hover-src только внутри `(hover:hover) and (pointer:fine)` (JS/CSS media или `src` по pointer). Не блокирует ship.

2. **Сравнение second image по строке URL:** если `first_image.large_url` и `images[0].medium_url` — разные URL одной фотографии, ложный «второй» кадр. На типичном `/products_by_id` объекты полные и `images[0] ≈ first_image` — риск низкий. При багах на витрине — нормализовать по `image.id` / `original_url`.

## Предложения (nice to have)

1. Дублирование `pickProductSecondImage` в `settings.test.js` (как у остальных хелперов) — при дрейфе runtime vs test легко разъехаться; позже вынести shared fixture / require.
2. Доп. assert на `null` / `images: []` (сейчас покрыто веткой `length < 2` косвенно).
3. Hover во время `is-skeleton`: на desktop primary уходит в `opacity: 0` — кратко может мелькнуть второе фото до settle; редкий UX-edge.

## Соответствие scope

| Пункт | Статус |
|-------|--------|
| 1. Appear (products/articles/categories, stagger, reduced-motion) | ✅ `snippet.scss` + gen-2 CSS |
| 2. Desktop hover 2nd image | ✅ `pickProductSecondImage`, dual img, media query, skeleton skip |
| 3. i18n | ✅ код не внедрялся (OK по owner) |
| 4. Sync gen-2 media | ✅ JS/SCSS/CSS |
| 5. v1.0.10 + CHANGELOG + tests | ✅ |

## Следующий шаг

- **APPROVED:** re-upload по CHANGELOG — Gen-4: `snippet.js`, `snippet.scss`, `info.json`; Gen-2: `media/df_quick_search.js` + `media/df_quick_search.css` (liquid не трогать). Затем чеклист превью (desktop hover, mobile no flash, reduced-motion).
