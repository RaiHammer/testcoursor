---
name: review-gate
description: Проводит review gate с вердиктом APPROVED или NEEDS_REVISION. Use when spec-reviewer, arch-reviewer, plan-reviewer, or code-reviewer completes a review, or when validating artifact completeness before next pipeline stage.
disable-model-invocation: true
---

# Review Gate

## Вердикты

- **APPROVED** — все обязательные критерии выполнены, можно переходить дальше
- **NEEDS_REVISION** — есть блокирующие замечания, вернуть автору

## Формат отчёта

Используй `templates/review-template.md`. Обязательные секции:

1. Вердикт (APPROVED / NEEDS_REVISION)
2. Чеклист с ✅ / ❌ / ⚠️
3. Критические замечания (must fix)
4. Следующий шаг

## Чеклисты по типам

### Spec Reviewer
- [ ] Цель сформулирована
- [ ] Scope и out-of-scope определены
- [ ] Функциональные требования перечислены
- [ ] Критерии приёмки проверяемы
- [ ] NFR учтены (если применимо)
- [ ] Риски идентифицированы

### Arch Reviewer
- [ ] Соответствует ТЗ
- [ ] Технологии обоснованы
- [ ] Масштабируемость адекватна задаче
- [ ] Безопасность учтена
- [ ] Нет over-engineering

### Plan Reviewer
- [ ] Все требования ТЗ покрыты задачами
- [ ] Зависимости указаны
- [ ] Тест-план есть
- [ ] Definition of Done определён
- [ ] Нет пропущенных шагов

### Code Reviewer
- [ ] Соответствует плану
- [ ] Нет критических багов и уязвимостей
- [ ] Код читаем, минимальный diff
- [ ] Тесты адекватны изменениям

### Code Reviewer (inSales-виджет)
- [ ] `knowledge/platforms/insales-widgets.md` учтён
- [ ] Нет default-on show_* без явного true
- [ ] `widget/tests/settings.test.js` проходит
- [ ] Чекбоксы hide_* / парсинг bool в Liquid и JS

## Правило

NEEDS_REVISION если хотя бы один обязательный пункт ❌. ⚠️ — рекомендация, не блокирует APPROVED.

Сохраняй review в `artifacts/{task-id}/reviews/{type}-review.md`.
