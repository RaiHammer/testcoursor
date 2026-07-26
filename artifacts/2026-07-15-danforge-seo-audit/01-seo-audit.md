# SEO-аудит: danforge.ru

**Дата:** 2026-07-15  
**Исполнитель:** SEO-специалист  
**Метод:** live-проверка через HTTP + WebFetch (browser MCP недоступен в сессии; данные meta/H1/schema извлечены программно из HTML)  
**Платформа:** Tilda — рекомендации только для ручного внесения

---

## Резюме

1. **База on-page в порядке:** уникальные title/description, canonical, viewport, один H1 на страницу, JSON-LD `@graph` на главной (WebSite, Organization, Service, FAQPage).
2. **Критично:** `sitemap.xml` и `sitemap-feeds.xml` отдают **500** — поисковики могут терять новые URL (в т.ч. будущий reviews-slider).
3. **Страница продукта reviews-slider отсутствует** (`/services/modules/reviews-slider-widget` → 404); материалы для Tilda готовы, но не опубликованы.
4. **Продуктовые страницы** (dynamic-cart, table-builder, pdf-catalog) живые и с хорошим контентом, но без Product/SoftwareApplication schema и с пустыми alt у скриншотов галереи.
5. **Внутренняя перелинковка слабая:** страницы услуг не ведут на каталог модулей; модули не ссылаются друг на друга; SeoZilla без целевых landing под фразы даст размытый эффект.

---

## Проверенные страницы

| URL | Статус | Title (симв.) | H1 | Schema |
|-----|--------|---------------|-----|--------|
| `/` | 200 | 60 ✅ | Профессиональная разработка… inSales | Organization + @graph (WebSite, Service, FAQPage) |
| `/services/modules` | 200 | 67 ⚠️ | Модули и решения | Organization |
| `/services/create-online-store` | 200 | 57 ✅ | Создание интернет-магазина… | Organization |
| `/services/migrate-to-insales` | 200 | 68 ⚠️ | Переезд на InSales… | Organization |
| `/services/technical-support/` | 200 | 62 ✅ | Техническая поддержка**интернет-магазинов** (склейка слов) | Organization |
| `/services/modules/dynamic-cart-widget` | 200 | 41 ⚠️ короткий | Динамичная корзина для inSales | Organization |
| `/services/modules/table-builder-widget` | 200 | 65 ✅ | Виджет «Сборка таблицы товаров»… | Organization |
| `/services/modules/pdf-catalog-widget` | 200 | 59 ✅ | Виджет «Каталог в PDF»… | Organization |
| `/services/modules/reviews-slider-widget` | **404** | — | — | — |
| `/services/modules/individual-development` | 200 | 71 ⚠️ | Индивидуальная разработка**функционала** (склейка) | Organization |
| `/portfolio` | 200 | 64 ⚠️ | Наши проекты и кейсы… | Organization + @graph |
| `/blogs` | 200 | 59 ✅ | Блог…**интернет-магазинов** (склейка) | Organization + @graph |
| `/about`, `/contacts` | 200 | OK | OK | Organization |

---

## On-page SEO (детально)

### Meta title / description

| Страница | Title | Description | Замечание |
|----------|-------|-------------|-----------|
| Главная | 60 симв., ключ «InSales под ключ» | 174 симв. | Description >160; CTA «бесплатная консультация» |
| Модули | 67 симв. | 119 симв. | Title чуть длинный; H1 слабее title |
| Создание | 57 симв. | 172 симв. | Description >160 |
| Миграция | 68 симv. | 156 симv. | Title на грани |
| Dynamic cart | 41 симv. | 131 симv. | Title короткий — место для «виджет корзины inSales» |
| Reviews slider | — | — | **Страница не существует** |

**Canonical:** проставлен на всех проверенных страницах ✅  
**Open Graph:** не проверялся отдельно (Tilda обычно дублирует title/description)  
**Viewport:** есть на всех страницах ✅  
**HTTPS:** да ✅

### Заголовки (H1–H3)

- **H1:** один на страницу (два hero-блока ПК/моб — намеренно, не SEO-дубль по решению владельца).
- **Проблемы склейки слов в H1** (Tilda, перенос строки):
  - `/services/technical-support/` — «поддержкаинтернет-магазинов»
  - `/services/modules/individual-development` — «разработкафункционала»
  - `/blogs` — «продвиженииинтернет-магазинов»
- **Иерархия:** H2 логичны на услугах; на `/blogs` **0 H2** — статьи без структурных подзаголовков в разметке.
- **H3:** отсутствуют на большинстве страниц — для длинных продуктовых блоков (таблицы «Что умеет виджет») можно добавить H3 в Tilda.

### Контент и ключевые слова

| Приоритет KW | Покрытие на сайте |
|--------------|-------------------|
| разработка inSales | ✅ главная, услуги |
| интернет-магазин inSales | ✅ create, migrate |
| миграция inSales | ✅ migrate |
| виджеты inSales | ⚠️ modules + 3 продукта; reviews-slider — gap |
| техподдержка inSales | ✅ support (H1 с багом) |
| inSales партнёр | ✅ about, главная |

**Уникальность:** дублирования между услугами нет; блок «Отзывы» повторяется на многих страницах — допустимо для Tilda-шаблона, но увеличивает boilerplate.

### Внутренние ссылки

**Есть:**
- Главная → все 4 услуги + modules + portfolio + blogs
- `/services/modules` → 4 карточки модулей (dynamic-cart, table-builder, pdf-catalog, individual)

**Нет / слабо:**
- Страницы услуг (create, migrate, support) **не ссылаются** на `/services/modules`
- Продуктовые страницы **не перекрёстно** ссылаются друг на друга («Другие модули»)
- `/portfolio` не линкует на релевантные услуги/модули из кейсов
- `/blogs` — нет явных SEO-якорей на money-pages

### Alt у изображений

| Страница | Всего img | Без alt | Пустой alt="" |
|----------|-----------|---------|---------------|
| Главная, услуги | 7 | 2 | 2 |
| dynamic-cart-widget | 11 | 2 | **6** |
| table-builder-widget | 10 | 2 | **5** |
| pdf-catalog-widget | 11 | 2 | **6** |

Шаблонные 2 img без alt — на всех страницах (вероятно декор/иконки). **Галереи продуктов** — основная зона для alt с ключами («виджет корзины inSales desktop» и т.д.).

### Schema.org

**Главная (@graph):** WebSite, Organization, Service, FAQPage — соответствует заявлению владельца ✅  
**Дублирование:** отдельный блок Organization + @graph Organization — не критично, но избыточно.

**Страницы услуг и модулей:** только Organization — **нет**:
- `Product` / `SoftwareApplication` на продуктовых страницах
- `Service` с `offers` на страницах create/migrate/support
- `BreadcrumbList` (хлебные крошки визуально есть, в schema — нет)
- `FAQPage` на create/migrate (FAQ на странице есть, schema — нет)

**SearchAction** в WebSite указывает на `/?s={search_term_string}` — на Tilda полноценного поиска нет; риск предупреждения в validator (низкий приоритет).

### Mobile

- Viewport meta ✅
- Адаптивные hero (ПК/моб) ✅
- Bottom sheet / mobile UX описаны на product pages ✅
- Core Web Vitals: без CDP в этой сессии; субъективно Tilda + отзывы/слайдеры — следить в Метрике

### Конверсия

- CTA «Хочу сайт» / «Заказать» — на месте ✅
- Формы заявки — на главной и услугах ✅
- Отзывы, портфолио, FAQ — на месте ✅

---

## Критичные проблемы

1. **Sitemap 500** — `https://danforge.ru/sitemap.xml` и `sitemap-feeds.xml` недоступны (robots.txt на них ссылается).
2. **404 reviews-slider-widget** — продукт готов к GTM, landing отсутствует; потеря long-tail и риск для SeoZilla-фраз без URL.
3. **Склейка слов в H1** на 3 страницах — ухудшает UX и сниппеты.
4. **Пустые alt на скриншотах** продуктов — упущенный image/long-tail трафик.

---

## Рекомендации (Tilda-actionable)

### Высокий приоритет

| # | Действие | Где в Tilda | Сложность |
|---|----------|-------------|-----------|
| 1 | **Опубликовать страницу reviews-slider-widget** | Страницы → дублировать table-builder-widget → URL `reviews-slider-widget`; тексты из `artifacts/2026-07-14-reviews-slider-gtm/01-danforge-page.md` | 2–3 ч |
| 2 | **Починить sitemap** | Настройки сайта → SEO → проверить генерацию sitemap; при ошибке — поддержка Tilda или переопубликовать сайт | 30 мин – 1 ч |
| 3 | **Исправить H1 (пробелы)** | Страницы support, individual-development, blogs → блок заголовка → убрать лишний `<br>` / разбить на два span без переноса внутри слова | 15 мин |
| 4 | **Добавить JSON-LD Product на 3–4 модуля** | Настройки страницы → SEO → HTML-код в `<head>`: Product/SoftwareApplication с name, description, offers (цена), brand DanForge | 1–2 ч |
| 5 | **Перелинковка модулей** | На каждой product page — блок «Другие модули» (3 карточки + ссылка на `/services/modules`); на create/migrate — текстовая ссылка «Готовые виджеты» | 1 ч |

### Средний приоритет

| # | Действие | Сложность |
|---|----------|-----------|
| 6 | Заполнить **alt** у скриншотов галереи (dynamic-cart, table-builder, pdf-catalog) | 30 мин |
| 7 | Укоротить **description** главной и create до 150–160 символов; убрать/заменить «бесплатная консультация» на «расчёт стоимости» (по предпочтению владельца) | 15 мин |
| 8 | Усилить **H1** на `/services/modules`: «Модули и виджеты для inSales» (сейчас слабее title) | 10 мин |
| 9 | Расширить **individual-development** — сейчас thin page (1 H2); добавить кейсы, примеры задач, FAQ | 2–3 ч |
| 10 | **FAQPage schema** на create-online-store и migrate-to-insales (FAQ уже на странице) | 1 ч |

### Низкий приоритет

| # | Действие | Сложность |
|---|----------|-----------|
| 11 | BreadcrumbList JSON-LD на внутренних страницах | 1 ч |
| 12 | H2 для списка статей на `/blogs` | 30 мин |
| 13 | Удлинить title dynamic-cart: «Динамичная корзина для inSales — виджет \| DanForge» | 5 мин |
| 14 | Проверить SearchAction в WebSite schema или убрать | 15 мин |

---

## Ключевые слова (карта страниц)

| Кластер | Целевая страница | Статус |
|---------|------------------|--------|
| разработка inSales под ключ | `/` | ✅ |
| создание интернет-магазина inSales | `/services/create-online-store` | ✅ |
| переезд / миграция inSales | `/services/migrate-to-insales` | ✅ |
| виджеты / модули inSales | `/services/modules` | ⚠️ H1 слабый |
| корзина inSales виджет | `/services/modules/dynamic-cart-widget` | ✅ |
| КП / таблица товаров inSales | `/services/modules/table-builder-widget` | ✅ |
| каталог PDF inSales | `/services/modules/pdf-catalog-widget` | ✅ |
| отзывы слайдер inSales | `/services/modules/reviews-slider-widget` | ❌ 404 |
| техподдержка inSales | `/services/technical-support/` | ⚠️ H1 баг |

---

## Конкуренты (кратко)

Полное исследование не проводилось. В нише inSales-разработки типичные конкуренты закрывают:
- отдельные landing под каждый виджет/услугу;
- кейсы с UTM и schema Review;
- блог с long-tail («как перенести с … на inSales»).

DanForge силён в отзывах и сертификации партнёра; отстаёт по **количеству product landings** и **sitemap**.

---

## Следующие шаги

1. Владелец: опубликовать reviews-slider + починить sitemap (блокеры для SeoZilla).
2. Обсудить интеграцию SeoZilla → `02-seo-zilla-discussion.md`.
3. После правок — переобход в Яндекс.Вебмастер / Google Search Console.
4. Через 4–6 недель — повторный аудит позиций по 10–15 целевым фразам.

---

## Источники данных

- `_seo_data.json` — машинная выборка meta/H1/schema (эта папка)
- `knowledge/danforge/site-profile.md`
- GTM materials: `artifacts/2026-07-14-reviews-slider-gtm/`
