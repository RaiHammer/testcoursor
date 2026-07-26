# Анализ: адаптивные колонки и пагинация df_reviews_slider

**Дата:** 2026-07-13  
**Виджет:** DanForge Reviews Slider (`danforge_reviews_slider`)

## Запрос пользователя

1. **Адаптивные колонки** для режимов Masonry и Сетка — на телефоне 1–2 колонки вместо десктопных 3, настраиваемо через редактор.
2. **Адаптивный page-size** — отдельное число отзывов на странице для мобильного в grid/masonry/list.
3. Оба параметра в `settings_form.json` и `settings_data.json`.
4. **Исправить прыжок скролла** при «Показать ещё» — страница не должна уезжать вверх и возвращаться.

## Текущее состояние (до изменений)

| Компонент | Проблема |
|-----------|----------|
| `layout-columns` | Одно значение для всех экранов |
| `page-size` | Одно значение для всех экранов |
| `snippet.scss` | Жёсткие media queries 991px/639px переопределяют колонки |
| `snippet.js` | `prepareStaticLayout()` ставит inline `gridTemplateColumns` по одному `data-columns` — перебивает CSS |
| `loadMoreReviews()` | По умолчанию `scroll: 'auto'` → вызывает `scrollToWidget()` |

## Паттерн для подражания

Группа «Слайдер и Spotlight» уже имеет `slides-mobile`, `slides-tablet`, `slides-per-view` с breakpoints 639/991.

## Breakpoints

- **Mobile:** ≤639px  
- **Tablet:** 640–991px  
- **Desktop:** ≥992px  

## Scope

- Режимы: Masonry, Сетка (колонки); Masonry, Сетка, Лента (page-size mobile)
- Без изменений: Slider, Spotlight, Marquee
