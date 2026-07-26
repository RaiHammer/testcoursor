# SEO: Быстрый поиск inSales (danforge_quick_search v1.0.9)

**Task ID:** `2026-07-24-df-quick-search-packaging-pages`  
**Роль:** SEO-специалист  
**Дата:** 2026-07-24  
**Статус:** готово к вставке в `02-site-page.md` / Tilda Page Settings  
**Продукт:** `danforge_quick_search` **v1.0.9** (stable) · Gen-4 SimpleWidget + Gen-2 theme-snippet  
**Пилот (маркетинг):** armedf.ru · sushivenik.ru — **не** в публичных текстах до ответа владельца  
**База:** `artifacts/2026-07-21-df-quick-search-packaging/02-seo-draft.md` + бриф `01-brief.md` + `projects/df_quick_search/FEATURES.md`  
**Цены (утверждены):** A 5 000 / B 8 000 / C 12 000 ₽  
**`02-site-page.md`:** на момент SEO-pass отсутствует — достаточно этого файла

---

## Резюме (для Jarvis)

1. URL/canonical без изменений: `/services/modules/quick-search-widget`.
2. Meta и ядро обновлены под v1.0.9: Layout B, SKU, RU↔EN, live-поиск, полный индекс блога, Gen-2/Gen-4 — без stuffing и без «100 статей».
3. Product + AggregateOffer JSON-LD на 3 пакета (5k/8k/12k) — цены уже публичные в оффере.
4. Alt готовы для hero/OG/карточки + плейсхолдеров `shot-*`.
5. Чеклист Tilda + блок «Что НЕ писать» — обязателен перед публикацией.

---

## Поля для Tilda (копипаст)

| Поле | Текст |
|------|-------|
| **URL** | `services/modules/quick-search-widget` |
| **Canonical** | `https://danforge.ru/services/modules/quick-search-widget` |
| **Title** | Быстрый поиск inSales — live-поиск с фото и SKU \| DanForge |
| **Description** | Полноэкранный live-поиск для inSales Gen-2 и Gen-4: фото, цены, артикул, Layout B и исправление раскладки. Опционально — поиск по блогу. Установка под ключ. |
| **H1** | Быстрый поиск для inSales |
| **og:title** | = Title |
| **og:description** | = Description |
| **og:image** | файл `og-quick-search-1200x630.png` (после загрузки в Tilda — URL CDN) |
| **og:type** | `website` |
| **Скрытое поле формы** | `product=quick-search` |
| **UTM на CTA** | `?utm_source=danforge&utm_medium=product&utm_campaign=quick-search` |

**Длина (ориентир):** Title ≈ 62 символа · Description ≈ 160 символов.

**Почему URL `quick-search-widget`:** единообразие с `dynamic-cart-widget`, `reviews-slider-widget`. Не использовать handle `danforge_quick_search` в slug.

---

## 1. URL + canonical

| Параметр | Значение |
|----------|----------|
| Путь | `/services/modules/quick-search-widget` |
| Полный URL | `https://danforge.ru/services/modules/quick-search-widget` |
| Canonical | тот же URL (без query, без trailing slash) |
| Sitemap | добавить после первой публикации |
| Редирект | черновик `danforge-quick-search` → 301 на `quick-search-widget` |

**Tilda:** Page → Settings → URL = `services/modules/quick-search-widget` · Canonical = полный URL.

---

## 2. Title + Meta Description (+ запасные)

### Основной (рекомендуемый)

**Title:**  
`Быстрый поиск inSales — live-поиск с фото и SKU | DanForge`

**Meta Description:**  
`Полноэкранный live-поиск для inSales Gen-2 и Gen-4: фото, цены, артикул, Layout B и исправление раскладки. Опционально — поиск по блогу. Установка под ключ.`

### Запасной A (акцент на раскладку / B2B)

**Title:**  
`Виджет поиска inSales — SKU, фото и раскладка RU↔EN | DanForge`

**Description:**  
`Live-поиск вместо dropdown: сетка с фото и ценой, поиск по артикулу, сортировка в панели. Исправление раскладки клавиатуры. Gen-2 theme-snippet и Gen-4 виджет.`

### Запасной B (акцент на блог / пакет C)

**Title:**  
`Быстрый поиск inSales — товары и статьи в одной панели | DanForge`

**Description:**  
`Полноэкранный поиск для inSales: товары с фото и SKU плюс полный индекс блога в панели. Desktop split, mobile вкладки. Установка + настройка поиска по статьям.`

**Правило выбора:** основной — для общей страницы и карточки каталога; A — если усиливается B2B-трафик; B — если в hero/CTA доминирует content+commerce (не менять URL).

---

## 3. H1 / рекомендуемые H2

**H1 (один на странице):** Быстрый поиск для inSales

**Подзаголовок hero (не H1):**  
Полноэкранная панель вместо dropdown: фото, цены, наличие и артикул ещё до каталога. Layout B на desktop и вкладки на mobile, исправление раскладки RU↔EN. Виджет Gen-4 и theme-snippet Gen-2 — без правок Liquid темы. 21 настройка в админке.

### H2 (порядок блоков)

| # | H2 | Блок |
|---|-----|------|
| 1 | Почему штатного поиска мало | Проблема → решение |
| 2 | Что умеет быстрый поиск | Возможности (только FEATURES) |
| 3 | Как это выглядит | Галерея `shot-*` |
| 4 | Для кого этот виджет | Каталог / content+commerce / B2B·SKU |
| 5 | Как подключить на inSales | 3 шага; Gen-4 виджет / Gen-2 сниппет |
| 6 | Пакеты и цены | A 5k / B 8k / C 12k |
| 7 | Частые вопросы | FAQ |
| 8 | Другие модули DanForge | Перелинковка |

**Опциональный H2:** `Живой пример` — ссылка на **armedf.ru** (разрешён).

**H3 внутри «Что умеет» (по желанию):**  
Поиск и раскладка · Карточки и сортировка · Категории и статьи · Настройки и совместимость

---

## 4. Ключевые фразы (v1.0.9)

Без keyword stuffing: primary — Title/H1/hero/1× в Description; secondary — H2 и body 1–2×; LSI — FAQ, alt, анкоры.

### Primary

| Ключ | Куда |
|------|------|
| быстрый поиск inSales | Title, H1, hero |
| live-поиск inSales / live поиск inSales | Title, возможности |
| виджет поиска inSales | Description, карточка каталога |

### Secondary

| Ключ | Заметка |
|------|---------|
| поиск по артикулу inSales | USP vs AjaxSearch |
| поиск по SKU inSales | B2B-синоним |
| ajax search inSales | сравнение со штатным dropdown |
| полноэкранный поиск inSales | UI USP / Layout B |
| виджет поиска товаров inSales | карточка + FAQ |
| поиск с фото inSales | alt + возможности |
| inSales Gen-2 / inSales Gen-4 | совместимость, не в Title оба сразу |

### LSI / long-tail

| Ключ |
|------|
| исправление раскладки поиска inSales |
| раскладка RU EN поиск интернет-магазин |
| Layout B поиск товары категории статьи |
| поиск по товарам и статьям блога inSales |
| theme-snippet поиск inSales Gen-2 |
| заменить AjaxSearch на полноэкранный поиск |
| установка виджета поиска inSales без правки темы |
| сортировка в поиске inSales цена популярность |
| виджет live search inSales с категориями |

**Не таргетировать:** «elasticsearch», общий «поиск по сайту», «AI-поиск», фичи из ideas-отчёта (ATC, фильтр категорий в панели и т.п.).

### Карточка `/services/modules` (сниппет)

**Название:** Быстрый поиск для inSales  
**Текст:** Полноэкранный live-поиск: фото, цены, SKU, Layout B. Опционально — полный индекс блога. Gen-2 и Gen-4, без правок темы.  
**CTA:** Подробнее → `/services/modules/quick-search-widget`  
**Превью:** `catalog-quick-search-card-800x800.png`

---

## 5. Alt-тексты (hero / OG / галерея / shot-*)

Правило: описывать *что на экране* + ключ «быстрый поиск inSales» или «live-поиск» **не чаще 1 раза** на alt. Без «картинка», «скриншот».

### Баннеры (готовы в assets 2026-07-21)

| Файл | Alt |
|------|-----|
| `danforge-quick-search-hero-1920x800.png` | Фон страницы быстрого поиска DanForge для inSales — тёмный hero под заголовок |
| `danforge-quick-search-hero-mobile-1080x1350.png` | Мобильный hero модуля быстрого поиска inSales DanForge |
| `og-quick-search-1200x630.png` | Быстрый поиск для inSales — live-панель DanForge |
| `catalog-quick-search-card-800x800.png` | Карточка модуля «Быстрый поиск» в каталоге решений DanForge |
| `kwork-quick-search-cover-660x440.png` | Обложка услуги: быстрый поиск inSales с панелью и SKU |

### Плейсхолдеры галереи (владелец снимает)

| Файл | Alt |
|------|-----|
| `shot-desktop-split-search.png` | Desktop Layout B: sidebar категорий и статей, сетка товаров в быстром поиске inSales |
| `shot-mobile-tabs.png` | Мобильный live-поиск inSales: вкладки Товары и Статьи, лента категорий |
| `shot-desktop-product-cards.png` | Карточки товаров в панели поиска: фото, цена и старая цена в одном ряду |
| `shot-oos-badge.png` | Бейдж «Нет в наличии» на карточке товара в быстром поиске inSales |
| `shot-zero-results.png` | Пустая выдача live-поиска: подсказки категорий и переход на полный поиск |
| `shot-articles-sidebar.png` | Статьи блога в sidebar быстрого поиска inSales рядом с товарами |
| `shot-recent-chips.png` | Чипы недавних и популярных запросов в панели быстрого поиска |

---

## 6. Schema.org Product / Offer (JSON-LD)

Цены публичны → **Product + AggregateOffer** (3 оффера). Дополнительно — Service + FAQPage (как на других страницах DanForge).

**Tilda:** HTML-блок в конце страницы `<script type="application/ld+json">…</script>`. Проверка: [validator.schema.org](https://validator.schema.org).

### Product + 3 Offer (вставить)

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Быстрый поиск для inSales",
  "description": "Полноэкранный live-поиск для интернет-магазина inSales: фото, цены, SKU, Layout B, исправление раскладки RU↔EN, опционально полный индекс блога. Совместим с Gen-2 и Gen-4.",
  "brand": {
    "@type": "Brand",
    "name": "DanForge"
  },
  "sku": "danforge_quick_search",
  "url": "https://danforge.ru/services/modules/quick-search-widget",
  "image": "https://danforge.ru/SERVICES_OG_OR_CDN_PATH/og-quick-search-1200x630.png",
  "category": "Виджеты inSales",
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "RUB",
    "lowPrice": "5000",
    "highPrice": "12000",
    "offerCount": "3",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "DanForge",
      "url": "https://danforge.ru"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Лицензия (пакет A)",
        "description": "Zip файлов gen-4 виджет или gen-2 theme-snippet + инструкция. Без установки DanForge.",
        "price": "5000",
        "priceCurrency": "RUB",
        "availability": "https://schema.org/InStock",
        "url": "https://danforge.ru/services/modules/quick-search-widget"
      },
      {
        "@type": "Offer",
        "name": "Установка под ключ (пакет B)",
        "description": "Лицензия + загрузка, триггеры, базовая выдача товаров. Без статей блога.",
        "price": "8000",
        "priceCurrency": "RUB",
        "availability": "https://schema.org/InStock",
        "url": "https://danforge.ru/services/modules/quick-search-widget"
      },
      {
        "@type": "Offer",
        "name": "Установка + поиск по статьям (пакет C)",
        "description": "Пакет B + включение поиска по блогу и донастройка. Не включает написание статей.",
        "price": "12000",
        "priceCurrency": "RUB",
        "availability": "https://schema.org/InStock",
        "url": "https://danforge.ru/services/modules/quick-search-widget"
      }
    ]
  }
}
```

**После загрузки OG в Tilda:** заменить `image` на реальный CDN-URL файла `og-quick-search-1200x630.png`.

### Service (дополнительно, короткий)

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Быстрый поиск для inSales",
  "serviceType": "Установка виджета live-поиска для интернет-магазина inSales",
  "provider": {
    "@type": "Organization",
    "name": "DanForge",
    "url": "https://danforge.ru"
  },
  "url": "https://danforge.ru/services/modules/quick-search-widget",
  "areaServed": "RU",
  "description": "Полноэкранный live-поиск: фото, цены, артикул, Layout B, раскладка RU↔EN, опционально статьи блога. Gen-2 и Gen-4."
}
```

### FAQPage — вопросы под ключи (ответы по FEATURES)

| Вопрос | Ответ (кратко) |
|--------|----------------|
| Чем быстрый поиск DanForge отличается от штатного AjaxSearch? | Полноэкранная панель Layout B: сетка с фото и ценой, категории, опционально статьи, сортировка, «N из M». AjaxSearch — dropdown с урезанной выдачей. |
| Можно ли искать по артикулу (SKU)? | Да — по SKU всех вариантов товара и по названию. Опционально скрыть нулевые цены. |
| Есть ли исправление раскладки RU↔EN? | Да, всегда включено: при пустой выдаче — повтор в другой раскладке и баннер при успехе. |
| Работает ли на inSales Gen-2 и Gen-4? | Да. Gen-4 — виджет; Gen-2 — primary theme-snippet (`liquid` + CSS вместе). |
| Нужно ли править тему (Liquid/CSS)? | Нет деплоя темы ради поиска: подключение виджета/сниппета и CSS-триггеры в настройках. |
| Можно ли искать по статьям блога? | Опционально: полный индекс указанных блогов (title, tags, related products), «Все статьи →». Пакет C = настройка поиска, не написание контента. |
| Сколько настроек в админке? | 21 настройка в группе «Основные». |

---

## 7. Внутренняя перелинковка

### С этой страницы

| Куда | Анкор | Зачем |
|------|-------|-------|
| `/services/modules` | Модули и решения для inSales | Каталог, крошки |
| `/services/modules/dynamic-cart-widget` | Динамичная корзина для inSales | Соседний UX → заказ |
| `/services/modules/reviews-slider-widget` | Виджет отзывов inSales + Яндекс | Соцдоказательство |
| table-builder / pdf-catalog (если в каталоге) | по названию карточки | Кластер модулей |
| `/services` или создание ИМ | Разработка интернет-магазина на inSales | Апселл услуг |
| Поддержка / индивидуальная | Доработка поиска под тему | Кастом вне 21 настройки |
| Primary CTA | Установка под ключ (пакет B, 8 000 ₽) | Конверсия |
| Secondary CTA | Установка + поиск по статьям (пакет C) | Content+commerce |
| Демо | Смотреть на armedf.ru | Доказательство |

### На эту страницу (входящие)

| Откуда | Действие |
|--------|----------|
| `/services/modules` | Карточка «Быстрый поиск» + ссылка |
| dynamic-cart / reviews-slider | Блок «Другие модули» → «Быстрый поиск для inSales» |
| Главная (блок модулей) | Плитка + URL |
| Услуга «Модули и решения» | 1 абзац + ссылка |
| Блог (будущее) | Статьи про AjaxSearch / UX поиска → продукт |

**Хлебные крошки:** Главная → Услуги → Модули и решения → Быстрый поиск для inSales

---

## 8. Чеклист публикации в Tilda

### Ассеты (путь исходников)

`artifacts/2026-07-21-df-quick-search-packaging/assets/`

| Файл | Куда в Tilda |
|------|----------------|
| `danforge-quick-search-hero-1920x800.png` | Cover desktop |
| `danforge-quick-search-hero-mobile-1080x1350.png` | Cover mobile |
| `og-quick-search-1200x630.png` | Page SEO → Social image / og:image |
| `catalog-quick-search-card-800x800.png` | Карточка на `/services/modules` |
| `shot-*.png` | Галерея (когда снимет владелец) |

### Перед публикацией

- [ ] URL `services/modules/quick-search-widget` + canonical
- [ ] Title + Description (основной или выбранный запасной)
- [ ] Один H1; H2 по таблице §3
- [ ] og:image = загруженный `og-quick-search-1200x630.png` (CDN URL в JSON-LD)
- [ ] Alt на hero, карточке, всех `shot-*`
- [ ] Блок цен A/B/C совпадает с JSON-LD (5000 / 8000 / 12000)
- [ ] Primary CTA = пакет B; secondary = C; A — строкой «только файлы»
- [ ] Карточка на `/services/modules` + входящие ссылки с корзины/отзывов
- [ ] JSON-LD Product (AggregateOffer) + опционально Service / FAQPage
- [ ] Форма: `product=quick-search`; UTM на кнопках
- [ ] Демо-ссылка только на **armedf.ru** (sushivenik — после ОК)
- [ ] Публикация → **sitemap** (известна проблема 500 у sitemap — проверить после фикса)
- [ ] Яндекс.Вебмастер: переобход URL после индексации
- [ ] Не публиковать Kwork раньше живой страницы сайта

---

## 9. Что НЕ писать

| Запрет | Почему |
|--------|--------|
| «До 100 статей на блог» / «снятие лимита 100» | Устарело; в v1.0.9 — **полный** Liquid-индекс |
| «19 настроек» | Сейчас **21** |
| v0.0.24 / «ориентир v1.0.0» как актуальная версия | Актуальная **v1.0.9** |
| Gen-2 только как «манифест SimpleWidget» | Primary поставка Gen-2 — **theme-snippet** `widget-gen2/` |
| ATC, фильтр по категории в панели, accent color и др. из ideas 2026-07-23 | Не в продукте / не в оффере v1.0.9 |
| «Пакет C = напишем статьи / контент» | C = **настройка** поиска по блогу |
| Elastic / полнотекст тела статьи | Нет; только title, tags, related products |
| «Лёгкий HTML при большом блоге» | Вес индекса в странице остаётся |
| Утверждённая политика обновлений «навсегда v1.x» | R1 ещё не утверждён владельцем |
| sushivenik.ru в маркетинге | Только после явного ОК владельца |
| «Заменяет AjaxSearch полностью» как факт API | Своя панель по CSS-триггерам; совместимость с path/data AjaxSearch, не подмена ядра темы |
| Бесплатный аудит как лид-магнит | Политика сайта DanForge |

**Честный FAQ вместо «100»:** полный индекс указанных блогов; при большом блоге — вес HTML + кнопка «Все статьи →»; cache key по `articles.size` (правка title без смены size может кешироваться).

---

## Вставка в `02-site-page.md` (шаблон для Jarvis)

Когда появится `02-site-page.md`, вставить блок:

```markdown
## SEO

| Поле | Текст |
|------|-------|
| **URL** | `/services/modules/quick-search-widget` |
| **Canonical** | `https://danforge.ru/services/modules/quick-search-widget` |
| **Title** | Быстрый поиск inSales — live-поиск с фото и SKU \| DanForge |
| **Description** | Полноэкранный live-поиск для inSales Gen-2 и Gen-4: фото, цены, артикул, Layout B и исправление раскладки. Опционально — поиск по блогу. Установка под ключ. |
| **H1** | Быстрый поиск для inSales |
| **og:image** | `og-quick-search-1200x630.png` → CDN после загрузки |

**Ключевые фразы:** быстрый поиск inSales, виджет поиска inSales, live-поиск inSales, поиск по артикулу / SKU inSales, раскладка RU↔EN, Layout B

**Полный SEO-pass:** `artifacts/2026-07-24-df-quick-search-packaging-pages/02b-seo.md`
```

JSON-LD и alt — из §5–§6 этого файла; FAQ — из §6.

---

## Идеи в content-backlog (обновить статусы)

1. Чем AjaxSearch отличается от полноэкранного live-поиска *(уже в бэклоге)* — добавить акцент Layout B + RU↔EN.
2. Поиск по артикулу для B2B на inSales *(уже)*.
3. **Новое:** Опечатки раскладки в поиске магазина: зачем RU↔EN retry.
4. **Новое:** Товары и статьи в одной панели поиска (content+commerce на inSales).

---

*SEO DanForge · v1.0.9 · 2026-07-24 · не коммитить*
