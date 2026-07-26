# Анализ: df_quick_search v0.0.18

## Цель

Комплексный аудит виджета `danforge_quick_search` для inSales: UX, производительность, новые фичи, техдолг, SEO/конверсия, особенности gen-2/gen-4 и armedf.ru.

## Контекст

- **Версия:** v0.0.18 (preserve scroll on load more)
- **Тестовый магазин:** armedf.ru (мода/милитари, gen-4 тема с кастомной шапкой)
- **Layout:** реализован Variant B из UX-brief (`artifacts/2026-07-21-df-quick-search-ux/design-layout-options.md`) — desktop split sidebar, mobile tabs
- **Поиск:** гибрид `/search_suggestions` → `/products_by_id` enrich → `/search.json` supplement; client filter `productMatchesQuery`
- **Статьи:** client-side индекс из Liquid, без storefront API

## Stakeholders / ЦА

| Stakeholder | Интерес |
|-------------|---------|
| Владелец DanForge | коммерческий виджет, лицензия на магазин |
| armedf.ru (пилот) | conversion-first, кириллица, статьи как secondary |
| Покупатели | быстрый поиск по SKU/названию, фото, цены, категории |
| Админы inSales | настройки без кода, gen-2/gen-4 совместимость |

## Требования (черновик — покрытие текущей реализацией)

- [x] Fullscreen panel по клику на `trigger_selectors`
- [x] Live search debounce 300ms, min 2 символа
- [x] Фото, цены, old price, категории, hide zero price
- [x] Load more (client-side pagination уже загруженного списка)
- [x] Статьи блога (optional), split layout
- [x] Race protection (`searchSeq` + `AbortController`)
- [ ] Ссылка «Все результаты» на `/search?q=`
- [ ] Enter → переход на страницу поиска
- [ ] Server-side pagination beyond API limits

## Ограничения

- `/search_suggestions` ~10–12 результатов, `limit` недокументирован
- `/search.json` без `per_page` на armedf.ru (HTTP 555 с `per_page`)
- Нет публичного API статей блога
- Liquid `paginate by 100` — max 100 статей на блог в индексе
- inSales scoped CSS — критичные стили дублируются в `snippet.liquid`
- gen-2: нет `header`/`outside` в `widget_list_kinds`

## Риски

1. **Load more обманчив** — кнопка не догружает с API, только раскрывает уже merged list (часто ≤12–24 позиций)
2. **`filterProductsByQuery` fallback** — при 0 совпадений возвращает весь список без фильтра (строки 351–352)
3. **Дублирование listeners** — каждый экземпляр виджета вешает `document` click (capture) + keydown
4. **Тяжёлый JSON статей** — при `show_articles=true` на каждой странице inline JSON всех статей
5. **README/info.json устарели** — v0.0.10, «Scaffold — в разработке»
6. **Ultra-wide max-width** — задокументирован в README, отсутствует в SCSS

## Открытые вопросы

- Нужна ли armedf.ru аналитика кликов из поиска (GA4/Метрика)?
- Включены ли статьи на проде (`show_articles` default false)?
- Планируется ли gen-2 деплой на других клиентах?

## Рекомендации

См. полный структурированный отчёт в ответе аналитика (6 разделов + roadmap 3 фазы).
