# Research: InSales reviews AJAX без обязательной страницы `/blogs/shop-reviews`

**Дата:** 2026-07-14  
**Проект:** `projects/df_reviews_slider/`  
**Задача:** Может ли DanForge Reviews Slider загружать InSales-отзывы на **любой** странице и в **любом** режиме без отдельной страницы отзывов?

---

## Executive summary

| Вопрос | Ответ |
|--------|-------|
| Нужна ли **отдельная видимая** страница отзывов, чтобы виджет **показывал** InSales-отзывы? | **Нет.** Первая порция отзывов рендерится через `{% prefetch account.reviews_not_spam %}` на любой странице (главная, товар, категория и т.д.). |
| Можно ли **полностью** обойтись без `/blogs/shop-reviews` при **любом** числе отзывов и режиме Masonry? | **Нет** (для load-more сверх prefetch-limit). AJAX-подгрузка требует **якорь пагинации** — URL, где `?page=N` меняет `offset` в prefetch. |
| Обязателен ли `/blogs/shop-reviews` именно? | **Нет.** Это распространённый, но **не платформенный** путь (модуль ValekTro, кастомный блог). Подойдёт любой URL с рабочей пагинацией отзывов. |
| Работает ли `/?page=2` на главной для отзывов? | **Нет** (проверено на armedf.ru). `?page=2` на index пагинирует контент главной, не `account.reviews_not_spam`. |
| Есть ли публичный JSON API отзывов для виджета? | **Нет.** `GET /admin/reviews.json` — только Admin API с ключом; storefront `ajaxAPI.shop.review` — только **отправка** отзыва. |

**Итог для владельца:** отдельная страница **не обязательна для установки виджета**, но **обязательна (или эквивалентный якорь)** для Masonry load-more при `reviews_count > insales-prefetch-limit` (макс. 50). Без якоря — честный fallback: prefetch до 50, скрыть «Загрузить ещё», CTA на страницу отзывов (если есть).

---

## 1. Документированные возможности InSales

### 1.1 Liquid: отзывы магазина

| Объект / механизм | Документация | Статус |
|-------------------|--------------|--------|
| `account.reviews_enabled?`, `account.reviews_moderated?` | [Переменная account](https://www.insales.ru/collection/peremennye/product/account) | Официально |
| `product.reviews`, `product.reviews_count` | [insales_frontend_template_llms.txt](https://static.insales-cdn.com/files/1/5969/89356113/original/insales_frontend_template_llms.txt) | KB платформы |
| `account.reviews_not_spam`, `account.reviews_not_spam_count` | **Не в публичной доке account** | Неофициально; используется в темах ValekTro и в `test/snippet.liquid` |
| `{% prefetch ... limit, offset, sort %}` | **Нет отдельной страницы в docs** | Неофициально; empiric из ValekTro gen-4 |
| `paginate.current_page`, `paginate.next.url` | [theme_template pagination.liquid](https://github.com/insales/theme_template/blob/master/blocks/pagination/pagination.liquid), [llms.txt](https://static.insales-cdn.com/files/1/5969/89356113/original/insales_frontend_template_llms.txt) | Официально для списков (товары, статьи блога) |
| `on_reviews_page` | [Настройки отзывов](https://www.insales.ru/collection/doc-otzyvy-na-tovary/product/nastroyki-otzyvov) | Флаг для `/product/{handle}/reviews` (отзывы **товара**) |
| RS-6 «Отзывы товаров» | [Главная — виджеты](https://www.insales.ru/collection/nastrojki-vidzhetov/product/glavnaya-stranitsa), [Настройки отзывов](https://www.insales.ru/collection/doc-otzyvy-na-tovary/product/nastroyki-otzyvov) | Системный виджет; **не** тот же механизм, что `reviews_not_spam` + prefetch |

### 1.2 Страницы отзывов в экосистеме

- **Отзывы товара:** `site.ru/product/jeans/reviews` — [Настройки отзывов](https://www.insales.ru/collection/doc-otzyvy-na-tovary/product/nastroyki-otzyvov).
- **Все отзывы магазина на одной странице:** в официальной доке — RS-6 или кастомная вёрстка; **ValekTro** продаёт модуль «Страница отзывов» с пагинацией и AJAX ([valektro.ru/blogs/development](https://valektro.ru/blogs/development)).
- `/product/shop-reviews` — **не** стандартный маршрут InSales; в формах ValekTro используется как `action` POST, но как GET часто **404**.

### 1.3 JavaScript / API

| Endpoint / API | Назначение | Для load-more? |
|----------------|------------|----------------|
| `POST /products/{id}/reviews.json` | Создание отзыва | Нет |
| `ajaxAPI.shop.review(review, productUrl)` | Отправка отзыва | Нет ([ajaxAPI.md](https://github.com/liquid-hub/insales-common-js-v2-api/blob/master/ajaxAPI.md)) |
| `GET /admin/reviews.json` | Список отзывов | Только Admin API ([api.insales.ru](https://api.insales.ru/)) — CORS/auth, не для витрины |
| Gen-4 widget partial AJAX | — | **Не документирован** (в отличие от Shopify `?section_id=`) |

### 1.4 Gen-4 виджеты

- [info.json](https://www.insales.ru/collection/vidzhetov/product/infojson): `page_kinds: ["all"]`, `generation: 4` — виджет **может** стоять на любой странице.
- Prefetch-параметры (`limit`, `offset`, `sort`) — **не** часть `info.json`; задаются в `snippet.liquid` тегом `{% prefetch %}`.
- `enable_server_reload: true` в settings — пересборка Liquid при смене prefetch-limit ([практика проекта](projects/df_reviews_slider/widget/settings_form.json)).

---

## 2. Текущая реализация проекта

### 2.1 Liquid (`widget/snippet.liquid`)

```liquid
{% prefetch account.reviews_not_spam limit df_insales_limit, offset: reviews_start, sort: 'date_desc' %}
```

- `reviews_start` = `(paginate.current_page - 1) * df_insales_limit`, если `paginate.current_page` доступен; иначе `0`.
- AJAX URL (авто): `blog.url` / `page.url` с `shop-reviews` → иначе `/blogs/shop-reviews` на главной.
- `/product/shop-reviews` в настройках **сбрасывается** (404 guard).
- Masonry server pagination: `data-insales-server-pagination="true"` при `count > prefetch-limit`.

### 2.2 JavaScript (`widget/snippet.js`)

- `loadInsalesPage` / `fetchInsalesServerPage`: `fetch(url)` → парсинг HTML → извлечение слайдов.
- Источники в ответе (приоритет):
  1. `.df-reviews__slide[data-source="insales"]` (свой виджет на якорной странице)
  2. `.masonry-reviews-list .masonry-reviews-item` (legacy ValekTro) → `masonryItemToSlide()`
- Кнопка load-more: `[data-df-insales-loadmore]` или `.loadmore_button[data-url]`.
- Fallback AJAX base в JS: `/blogs/shop-reviews`, если pathname `/` или невалидный.

### 2.3 Эталон ValekTro (`test/snippet.liquid` + `test/snippet.js`)

- Страница **блога** shop-reviews; load-more: `blog.url?page={{ paginate.current_page | plus: 1 }}`.
- JS: `$.get(url)` → append `.masonry-reviews-list` + replace `.pagination_container`.
- **Контекст:** виджет на **странице отзывов**, не на главной.

### 2.4 Live-проверки (curl, 2026-07-14)

| URL | armedf.ru | Вывод |
|-----|-----------|-------|
| `/product/shop-reviews` | **404** | Не использовать для AJAX |
| `/blogs/shop-reviews` | **200**, ValekTro masonry, `loadmore` → `/blogs/shop-reviews?page=2` | Якорь пагинации **есть** |
| `/blogs/shop-reviews?page=2` | **200**, другой набор `.masonry-reviews-item` | Пагинация отзывов **работает** |
| `/?page=2` | **200**, **нет** `.masonry-reviews-item` | Не источник отзывов для AJAX |
| Главная + DanForge widget | виджет **не задеплоен** на armedf на момент проверки | — |

**Вывод armedf:** проблема не в отсутствии `/blogs/shop-reviews`, а в том, что **главная с `?page=2` не отдаёт следующую порцию отзывов**. Текущий fallback на `/blogs/shop-reviews` для главной — **корректен**, если страница существует (на armedf — да).

---

## 3. Оценка альтернатив (A–F)

### A. Fetch current page + `?df_reviews_page=2` (кастомный query)

| | |
|--|--|
| **Поддержка InSales** | **Не документирована.** Платформа не описывает произвольные query-параметры для offset prefetch. |
| **Вердикт** | ❌ Не viable без серверной доработки платформы / прокси |

### B. JSON API отзывов из JS

| | |
|--|--|
| **Поддержка** | Только `GET /admin/reviews.json` (auth, rate limit 500/5min) |
| **CORS** | Не предназначен для браузера витрины |
| **Вердикт** | ❌ Не viable для универсального виджета |

### C. Увеличить prefetch / несколько prefetch в Liquid

| | |
|--|--|
| **Лимит** | `insales-prefetch-limit` clamp **1–50** в виджете |
| **Несколько prefetch** | Offset без `paginate.current_page` не меняется на произвольной странице |
| **Вердикт** | ✅ Viable для магазинов с **≤50** InSales-отзывами; ⚠️ partial для больших каталогов |

### D. Same-page AJAX: `currentUrl?page=N`

| Контекст | Работает? |
|----------|-----------|
| Главная `/` | ❌ `paginate` не связан с `reviews_not_spam` |
| Категория / товар | ❌ `paginate` для товаров, не отзывов аккаунта |
| `/blogs/shop-reviews` (виджет на той же странице) | ✅ Self-referential AJAX |
| Страница с ValekTro masonry | ✅ Через legacy extract |

**Вердикт:** ✅ Только если виджет стоит **на якорной странице**; ❌ для главной/каталога без внешнего якоря.

### E. Dedicated widget AJAX endpoint (gen-4)

| | |
|--|--|
| **Документация** | Отсутствует аналог Shopify Sections API |
| **Вердикт** | ❌ Не viable |

### F. `account.reviews` + offset через URL на любой странице

| | |
|--|--|
| **Механизм** | Offset в проекте завязан на `paginate.current_page`, не на произвольный URL param |
| **Вердикт** | ❌ Без paginate на странице offset всегда 0 |

---

## 4. Рекомендуемая архитектура (ранжирование)

| # | Подход | Универсальность | Load-more | Усилия |
|---|--------|-----------------|-----------|--------|
| **1** | **Prefetch-only** (limit до 50) + скрыть load-more без якоря | ★★★★★ | Только ≤50 | Малые (UX + probe) |
| **2** | **Внешний якорь** `/blogs/shop-reviews` или `insales-ajax-url` (как сейчас) | ★★★★☆ | Полный | Уже реализовано |
| **3** | **Self-ajax** когда виджет на странице shop-reviews | ★★★☆☆ | Полный на якоре | Уже в liquid auto-url |
| **4** | **Legacy extract** с ValekTro masonry на якоре | ★★★☆☆ | Полный без дубля виджета | Уже в snippet.js |
| **5** | Установка **минимального блога-якоря** (скрытая/техническая страница) | ★★★★☆ | Полный | Операционный шаг установщика |
| **6** | Admin API / backend proxy | ★★☆☆☆ | Полный | Вне scope виджета |

### Рекомендация DanForge

**Двухуровневая модель:**

1. **Universal tier (без требований к странице):**
   - Виджет на любой `page_kinds: all`.
   - InSales: до `insales-prefetch-limit` (макс. 50) через prefetch.
   - Режимы slider / spotlight / marquee / grid / list: клиентская пагинация в пределах загруженных слайдов.

2. **Masonry server load-more tier (опционально):**
   - Требуется **pagination anchor** — URL с рабочим `?page=N` для offset prefetch.
   - Авто: `blog.url` → `/blogs/shop-reviews` → ручной `insales-ajax-url`.
   - Если якорь недоступен (404 / дубликаты в ответе): **скрыть** `[data-df-insales-loadmore]`, показать подсказку в редакторе, рекомендовать prefetch-limit=50 или создать блог shop-reviews.

**Отдельная «витринная» страница отзывов для пользователя не обязательна** — якорь может быть техническим (блог без пункта меню) или уже существующим модулем ValekTro.

---

## 5. Outline реализации (не делать без APPROVED; малый diff)

### 5.1 JS — probe якоря при инициализации (≈30–50 строк)

```text
onInit(root):
  if !shouldShowInsalesLoadMore → return
  url = buildInsalesPageUrl(root, 2)
  fetch(url, HEAD or GET)
  if 404 OR extractInsalesSlides empty OR all review-ids already loaded
    → data-insales-ajax-enabled="false"
    → hide load-more
    → optional data-df-insales-ajax-status="no-anchor"
```

### 5.2 Liquid — без изменений логики prefetch

Текущая схема offset + auto-url **корректна**; менять только при появлении официальной доки по кастомному param.

### 5.3 `settings_form.json`

Обновлён help для `insales-ajax-url` (см. diff в репозитории).

### 5.4 Документация / чеклист установщика

- Пункт: «Для Masonry >50 отзывов: убедиться, что `/blogs/shop-reviews` отвечает 200 и `?page=2` отдаёт другие отзывы».
- Альтернатива: указать `insales-ajax-url` вручную.
- Если якоря нет: `insales-prefetch-limit=50`, режимы без server load-more.

---

## 6. Честные лимиты и UX fallback

| Ситуация | Поведение |
|----------|-----------|
| Нет блога shop-reviews, ≤50 отзывов | Виджет работает полностью в slider/grid/list/masonry без server load-more |
| Нет якоря, >50 отзывов, Masonry | Показать первые 50 (prefetch max); скрыть «Загрузить ещё»; счётчик вкладки показывает полный `reviews_not_spam_count` |
| Редактор inSales | Help-текст + (опц.) `editor_mode?` notice: «Для подгрузки >N нужен URL пагинации» |
| `/product/shop-reviews` в CTA/форме | Форма отзыва в виджете всё ещё POST на `/product/shop-reviews/reviews` — **отдельная** тема; на armedf может работать при 404 GET |
| Yandex | Не затронут; CLI pipeline без изменений |

---

## 7. Открытые вопросы / spike backlog

1. **Официальный запрос в InSales:** есть ли публичный storefront endpoint или documented `{% prefetch %}` для `account.reviews_not_spam`?
2. **Smoke на demo myshop** после деплоя виджета: главная vs `/blogs/shop-reviews?page=2`.
3. **Авто-создание блога shop-reviews** через Theme API — вне scope виджета, но снижает трение установки.

---

## 8. Ссылки

- [account (official)](https://www.insales.ru/collection/peremennye/product/account)
- [Настройки отзывов](https://www.insales.ru/collection/doc-otzyvy-na-tovary/product/nastroyki-otzyvov)
- [review variable](https://www.insales.ru/collection/peremennye/product/review)
- [Виджеты gen-4](https://www.insales.ru/collection/vidzhety)
- [info.json](https://www.insales.ru/collection/vidzhetov/product/infojson)
- [ajaxAPI.shop.review](https://www.insales.ru/collection/doc-js/product/modul-dlya-raboty-s-api-magazina)
- [InSales API reviews (admin)](https://api.insales.ru/)
- [theme_template pagination](https://github.com/insales/theme_template/blob/master/blocks/pagination/pagination.liquid)
- [Frontend template llms.txt](https://static.insales-cdn.com/files/1/5969/89356113/original/insales_frontend_template_llms.txt)
- ValekTro: [Страница отзывов](https://valektro.ru/blogs/development)
- Проект: `projects/df_reviews_slider/test/snippet.liquid`, `widget/snippet.liquid`, `widget/snippet.js`

---

**Вердикт:** отдельная страница `/blogs/shop-reviews` **не обязательна для работы виджета**, но **обязательна (или эквивалент)** для **server AJAX load-more** в Masonry при большом числе отзывов. Универсальное решение без якоря = **prefetch до 50** + graceful degradation.
