# Чеклист скриншотов: df_reviews_slider v1.2

**Источник:** demo myshop (`myshop-cxk958.myinsales.ru` — уточните URL и страницу с виджетом)  
**До первой реальной продажи:** все маркетинговые скрины — с demo. После пилота — заменить на клиентские.

**Папка для файлов:** `artifacts/2026-07-14-reviews-slider-gtm/screenshots/` *(создайте при съёмке)*

---

## Перед съёмкой

- [ ] Виджет установлен на demo (главная и/или страница отзывов)
- [ ] CLI прогнан: отзывы Яндекс в сниппете, inSales prefetch работает
- [ ] В настройках виджета для скринов с вкладками: `source-tabs` = true; для обычного demo — false (owner default)
- [ ] Браузер: Chrome, масштаб 100%, без панели закладок (F11 для fullscreen при необходимости)
- [ ] Убрать лишние элементы devtools, курсор не на hover-кнопках (кроме специальных кадров)

---

## Имена файлов и что снимать

| # | Имя файла | Что снять | Viewport | Приоритет |
|---|-----------|-----------|----------|-----------|
| 1 | `01-masonry-tabs-desktop.png` | Masonry + боковые вкладки InSales/Яндекс со счётчиками, несколько карточек | 1440×900 | **P0 — главный** |
| 2 | `02-slider-desktop.png` | Режим slider, 2–3 слайда в кадре, пагинация | 1440×900 | P0 |
| 3 | `03-grid-desktop.png` | Режим grid, сетка карточек | 1440×900 | P1 |
| 4 | `04-spotlight-desktop.png` | Режим spotlight, крупная карточка + миниатюры | 1440×900 | P1 |
| 5 | `05-list-desktop.png` | Режим list, вертикальный список | 1440×900 | P2 |
| 6 | `06-marquee-desktop.png` | Режим marquee, бегущая строка (широкий кадр) | 1440×900 | P2 |
| 7 | `07-masonry-mobile.png` | Masonry на телефоне, вкладки сверху или сбоку | 390×844 | P0 |
| 8 | `08-slider-mobile.png` | Slider на телефоне | 390×844 | P1 |
| 9 | `09-lightbox-photo.png` | Lightbox: открыто фото из отзыва | 1440×900 | P1 |
| 10 | `10-cta-floating.png` | Masonry: плавающая кнопка CTA «Оставить отзыв» (если включена) | 1440×900 | P2 |
| 11 | `11-load-more.png` | Masonry: кнопка «Показать ещё» после первой порции | 1440×900 | P2 |
| 12 | `12-source-tab-yandex.png` | Активна вкладка «Яндекс», видны отзывы о компании | 1440×900 | P1 |

**Обложки (отдельно):**

| Файл | Размер | Назначение |
|------|--------|------------|
| `kwork-reviews-slider-cover-660x440.png` | 660×440 | Обложка Kwork |
| `danforge-reviews-slider-hero-v2.png` | ~1200×630 или 16:9 | Hero danforge.ru |

---

## Как переключать макеты на demo

В админке inSales → виджет `danforge_reviews_slider` → настройка **«Режим отображения»** (`display_mode`):

| Скрин | Значение |
|-------|----------|
| 01, 07, 10, 11, 12 | `masonry` |
| 02, 08 | `slider` |
| 03 | `grid` |
| 04 | `spotlight` |
| 05 | `list` |
| 06 | `marquee` |

После смены режима — обновить страницу магазина (Ctrl+F5).

---

## Порядок для danforge.ru (галерея на странице)

Минимальный набор (7 скринов):

1. `01-masonry-tabs-desktop.png` — **первый, крупный**
2. `02-slider-desktop.png`
3. `03-grid-desktop.png`
4. `04-spotlight-desktop.png`
5. `07-masonry-mobile.png`
6. `08-slider-mobile.png`
7. `09-lightbox-photo.png`

Опционально добавить: list, marquee, load-more, tab-yandex.

**Hero-изображение:** `01-masonry-tabs-desktop.png` или отдельный кроп `danforge-reviews-slider-hero-v2.png`.

---

## Порядок для Kwork (галерея)

Kwork показывает первый скрин крупно — ставьте лучший кадр:

1. `01-masonry-tabs-desktop.png` ← **первый в галерее Kwork**
2. `02-slider-desktop.png`
3. `07-masonry-mobile.png`
4. `03-grid-desktop.png`
5. `09-lightbox-photo.png`
6. `12-source-tab-yandex.png`
7. `04-spotlight-desktop.png`

Обложка карточки: `kwork-reviews-slider-cover-660x440.png` (не дублировать как скрин в галерее, если уже обложка).

---

## Технические советы

**Desktop:** DevTools → Toggle device toolbar OFF → ширина окна 1440px.  
**Mobile:** DevTools → iPhone 12/13 Pro (390×844) или Responsive 390px.

**Чистый кадр:**
- Заголовок виджета читаем («Отзывы покупателей» или ваш текст)
- В кадре 3+ карточки с звёздами и текстом
- Вкладки: видны оба источника и счётчики (masonry)
- Не обрезать CTA внизу блока

**Lightbox:** кликнуть по фото в отзыве с галереей → снять overlay.

**Именование при экспорте:** PNG, без сжатия с артефактами. Можно `.webp` для Tilda после загрузки.

---

## После первой реальной продажи

- [ ] Повторить набор P0–P1 на клиентском магазине
- [ ] Заменить скрины на danforge и Kwork
- [ ] Добавить отзыв клиента на Kwork
- [ ] Убрать пометку «демо» со страницы danforge (блок 7 в `01-danforge-page.md`)

---

## Быстрый чеклист владельца

| Шаг | Действие |
|-----|----------|
| 1 | Открыть demo, проверить отзывы inSales + Яндекс |
| 2 | Снять P0: masonry desktop, slider desktop, masonry mobile |
| 3 | Снять P1: grid, spotlight, lightbox, tab-yandex |
| 4 | Собрать hero и обложку Kwork |
| 5 | Загрузить на danforge по порядку выше |
| 6 | Загрузить на Kwork по порядку выше |
| 7 | Опубликовать danforge → затем Kwork |
