# Review: Plan Reviewer — gen-2 поставка df_quick_search

**ID задачи:** `2026-07-23-df-quick-search-gen2`  
**Дата:** 2026-07-23  
**Ревьюер:** Plan Reviewer  
**Версия артефакта:** `04-plan.md` (2026-07-23)

## Вердикт

**APPROVED**

## Чеклист

| # | Критерий | Статус | Комментарий |
|---|----------|--------|-------------|
| 1 | Must / AC покрыты задачами | ✅ | AC анализа §7 + Arch DoD §13 → задачи 1–11; паритет 21, install, triggers, reuse JS |
| 2 | Полнота vs архитектура (§3 / §17) | ✅ | Все create/update пути в таблице §4 плана; опц. scss в задаче 3 |
| 3 | Зависимости корректны, нет циклов | ✅ | Параллель 2‖3‖4‖5‖7 → 6 → 8 → 9/10/11 |
| 4 | Порядок выполнения логичен | ✅ | Scaffold → assets/config → liquid → docs → verify |
| 5 | Тест-план есть и конкретен | ✅ | Unit §5.1; smoke S1–S6; матрица checkbox ON/OFF §5.3 + data-* выборочно |
| 6 | Definition of Done определён | ✅ | §1 DoD + DoD по задачам + критерии §8 |
| 7 | Нет пропущенных шагов | ✅ | install.md, escape, checkbox if=='1', critical CSS, keys `"1"`, layout patch |
| 8 | Should-fix Arch учтены | ✅ | Escape / явный if / critical overlay — в DoD и «Should-fix Arch» |
| 9 | Не ломает gen-4 | ✅ | Явный запрет правок `widget/`; sync = копия; риск #9 + Code Reviewer diff |
| 10 | Оценки реалистичны | ✅ | 11.5 ч / 11 задач; liquid 2.5 + CSS 2.0 адекватны |
| 11 | Готовность к Programmer | ✅ | Блокеров нет; порядок и файлы однозначны |

## Критические замечания (must fix)

Нет.

## Рекомендации (should fix)

1. В задаче 6 / DoD одной строкой явно перечислить доп. контракт Arch §6 (не из UI): `data-articles-server-total`, `data-articles-cache-key`, CSS vars `--df-qs-cols-*`, JSON scripts collections/articles — чтобы «паритет» не ужали до только 21 settings.
2. В задаче 3 уточнить способ получения CSS из `snippet.scss` (например `sass` CLI / ручная сборка / копирование уже собранного), т.к. в `widget/` готового `.css` нет.

## Предложения (nice to have)

1. В DoD или задаче 10/11: явный чек `git diff` / status — `widget/` без изменений.
2. В §5.3 минимум для Code Reviewer уже хорош; при live-магазине владельцу можно расширить до полной матрицы 1–10.

## Что хорошо

- Матрица checkbox ON/OFF с ожидаемым `data-*` и UI-эффектом — закрывает главный риск gen-2.
- Should-fix Arch Reviewer вшиты в DoD, а не отложены.
- Клиентский чеклист (§6) адаптирован под theme-snippet, не SimpleWidget upload.
- Чёткие границы «не трогать gen-4» + sync-заметка.

## Следующий шаг

Передать **Programmer** → реализация задач 1→11 по `04-plan.md`. Plan gate закрыт.
