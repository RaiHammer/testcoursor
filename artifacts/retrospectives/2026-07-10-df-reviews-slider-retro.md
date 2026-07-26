# Ретро: df_reviews_slider — баги настроек виджета

**Дата:** 2026-07-10  
**Статус:** закрыто (работает после фиксов)  
**Участники:** владелец, Jarvis, Programmer (фактически без review gates)

## Что планировали

Виджет отзывов inSales + CLI, настройки в админке (чекбоксы, range, color), фильтры, скрытие элементов.

## Что получилось

- Продукт работает после нескольких итераций
- Появились `widget/tests/`, база знаний `knowledge/platforms/insales-widgets.md`
- Выявлены платформенные ограничения inSales

## Хронология ошибок

| # | Симптом | Корневая причина |
|---|---------|------------------|
| 1 | Чекбоксы show-* не выключаются | nil при снятом чекбоксе + `else → true` (default-on) |
| 2 | `"false"` как строка в Liquid | truthy в `{% if %}` |
| 3 | hide-avatar не скрывает | класс только в JS; ранний exit без Swiper |
| 4 | select min-rating | в data попал label «4 звезды и выше», не `4` |
| 5 | hide_source всегда on | backward compat `show-source:false` из старых настроек |
| 6 | cta-text / title-align | читали underscore первым; inSales хранит hyphen |
| 7 | button-group как текст | форма не обновлена на магазине / тип не поддержан |

## Что сработало

- Запрос HTML от клиента (`data-*`, классы) — быстрая диагностика
- Инверсия show → hide_* для чекбоксов
- Тройная защита Liquid + JS + CSS
- `parseMinRating()` для label в data

## Что не сработало

- Исправления «на глаз» без тест-матрицы настроек
- Пропуск Code Reviewer и Plan Reviewer (задача шла в обход конвейера)
- Нет платформенной KB до начала разработки
- Миграция имён настроек без инструкции пересохранения

## Action items (внедрено)

| # | Действие | Где |
|---|----------|-----|
| 1 | KB inSales виджеты | `knowledge/platforms/insales-widgets.md` |
| 2 | Чеклист перед заливкой | `templates/insales-widget-checklist.md` |
| 3 | Обновить Jarvis / Programmer / orchestration | `.cursor/agents/`, `.cursor/rules/` |
| 4 | ADR по качеству | `knowledge/strategy/decisions/2026-07-10-quality-process.md` |
| 5 | Стандарт тестов в widget/ | `projects/df_reviews_slider/widget/tests/` |

## Метрики (оценочно)

- Итераций фикса настроек: **5+**
- Время на баги vs первичную разработку: **~60%** (оценка владельца)
- Цель на следующий виджет: **≤1** итерация после code review

## Вывод

Проблема не в «плохом коде», а в **отсутствии платформенного чеклиста и review gate**. Каждый inSales-виджет = мини-продукт с матрицей настроек; без неё команда обязательно тормозит.
