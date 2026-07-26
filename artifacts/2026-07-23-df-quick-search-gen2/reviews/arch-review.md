# Review: Arch Reviewer — gen-2 поставка df_quick_search

**ID задачи:** `2026-07-23-df-quick-search-gen2`  
**Дата:** 2026-07-23  
**Ревьюер:** Arch Reviewer  
**Версия артефакта:** `03-architecture.md` (2026-07-23)

## Вердикт

**APPROVED**

## Чеклист

| # | Критерий | Статус | Комментарий |
|---|----------|--------|-------------|
| 1 | Архитектура покрывает требования анализа / AC | ✅ | Theme-snippet primary (B), паритет 21, reuse JS, install, triggers nivona+gen-4, SimpleWidget как запасной канал |
| 2 | Технологии обоснованы, stack | ✅ | Liquid + media assets + settings.html; ADR-1…7; альтернативы A/C/hybrid отклонены с причинами |
| 3 | Нет избыточной сложности | ✅ | Отдельный пакет без форка JS; dual-read в одном liquid отклонён; hybrid не primary |
| 4 | Масштабируемость / простота установки | ✅ | Ручная установка адекватна gen-2; 6 шагов; один include в layout |
| 5 | Безопасность (префикс, XSS) | ⚠️ | `df_qs_*` зафиксирован; escape строковых `data-*` как в gen-4 не прописан явно в §6 — см. should fix |
| 6 | Не ломает gen-4 `widget/` | ✅ | ADR-7, out of scope, sync = копия JS; DoD запрещает правки `snippet.*` / `settings_form` |
| 7 | Переиспользование JS / контракт `data-*` | ✅ | Матрица §6 совпадает с `widget/snippet.liquid` (имена + dataset); доп. attrs и root-маркеры указаны |
| 8 | Checkbox-семантика gen-2 | ✅ | `"1"` / absent; default-ON через settings_data + `== '1'`; default-OFF через `if == '1'`; ловушка «absent = ON» осознанно закрыта |
| 9 | Альтернативы рассмотрены | ✅ | §15 + ADR |
| 10 | Структура понятна Programmer | ✅ | §3 дерево, §17 файлы create/не трогать, DoD §13 |
| 11 | DoD реалистичен | ✅ | Без CI/ZIP; smoke-чеклист; unit-тесты парсеров gen-4 |
| 12 | Открытые блокеры | ✅ | §12: блокеров нет |

## Критические замечания (must fix)

Нет.

## Рекомендации (should fix)

1. **Escape строк в контракте Liquid:** в §6 / §7 явно указать, что текстовые поля (`placeholder`, `popular_queries`, `trigger_selectors`, `article_blog_handles`, `articles_blog_url`, cache-key) пишутся в `data-*` через `| escape`, как в gen-4 `snippet.liquid` — чтобы Programmer не выбросил фильтр при копировании адаптера.
2. **Образец default-ON:** переписать пример §7 в явный вид `{% if settings.df_qs_* == '1' %}true{% else %}false{% endif %}` (текущий `assign true` + `unless` корректен, но вводит в заблуждение про «Liquid default ON»).
3. **Синк CSS:** в README/DoD одной строкой зафиксировать источник critical overlay-правил из gen-4 `<style>` → обязательное включение в `df_quick_search.css` (уже в тексте §4, усилить в DoD чекбоксом).

## Предложения (nice to have)

1. В `docs/install.md` — короткая заметка «после обновления gen-4 JS скопировать в `widget-gen2/media/`» (чеклист релиза уже намечен).
2. Опционально позже: скрипт/команда sync JS+CSS, не в scope этой задачи.
3. Smoke на реальной nivona — вне DoD реализации; оставить владельцу / Plan как ручной gate.

## Что хорошо

- Чёткий primary channel (theme-snippet) без копирования hybrid отзывов.
- Контракт `data-*` сверен с gen-4 — reuse `snippet.js` без форка логичен.
- Checkbox-модель gen-2 описана правильно: дефолты `"1"` в `settings_data` обязательны, absent = OFF.
- Границы gen-4 / gen-2 и список файлов Programmer снижают риск регрессии.

## Следующий шаг

Передать **Planner** → `04-plan.md` (упрощённый или полный конвейер по оценке времени). Arch gate закрыт.
