# Коммерческий пакет: `danforge_quick_search` v1.0.9

**Handle:** `danforge_quick_search`  
**Версия:** **v1.0.9** (stable)  
**Лицензия:** один магазин inSales — одна лицензия  
**Код:** `projects/df_quick_search/`  
**Документация:** FEATURES.md · README.md · CHANGELOG.md  
**Бриф:** `01-brief.md` · решения цен/C: `artifacts/2026-07-21-df-quick-search-packaging/06-decisions.md`

---

## 1. Что входит в коммерческую поставку

### 1.1 Каналы поставки (выбрать по поколению темы клиента)

| Поколение | Канал | Источник в репо |
|-----------|--------|-----------------|
| **Gen-4** | SimpleWidget | `projects/df_quick_search/widget/` |
| **Gen-2** | **theme-snippet** (primary) | `projects/df_quick_search/widget-gen2/` |

Запасной SimpleWidget gen-2 (`info.gen2.json`) — только если theme-snippet неудобен; в оффере по умолчанию — theme-snippet.

### 1.2 Файлы Gen-4 (SimpleWidget)

Из `widget/` в zip клиенту:

| Файл | Назначение |
|------|------------|
| `info.gen4.json` → `info.json` | Манифест Gen-4 |
| `snippet.liquid` | Разметка + Liquid-индекс статей |
| `snippet.js` | Логика / UI |
| `snippet.scss` | Стили |
| `settings_form.json` | Форма настроек (21 параметр) |
| `settings_data.json` | Defaults |

Опционально: краткая `README-INSTALL.md`, `FEATURES.md`, `LICENSE-NOTE.txt`.

### 1.3 Файлы Gen-2 (theme-snippet)

Из `widget-gen2/` (сверять с `widget-gen2/docs/install.md` и README):

| Путь | Назначение |
|------|------------|
| `snippets/df_quick_search.liquid` | Сниппет |
| `media/df_quick_search.js` | JS (синхрон с snippet.js) |
| `media/df_quick_search.css` (+ scss при необходимости) | Стили; **заливать вместе с liquid** |
| `config/settings_fieldset.html` | Настройки в теме |
| `config/settings_data.keys.json` | Ключи defaults |
| `patches/layouts.layout.include.liquid.txt` | Патч include в layout |
| `docs/install.md` | Инструкция установки Gen-2 |

**Критично для Gen-2:** liquid + CSS (+ JS) одной поставкой; critical chrome (× / input / chips) зависит от CSS-asset (см. CHANGELOG v1.0.7–1.0.9).

### 1.4 Не отдавать клиенту без нужды

- Папку `Пример/`, внутренние UX-артефакты команды  
- Сырой `artifacts/` команды  
- Тесты — опционально как proof of quality  

### 1.5 Права

- Использование на **одном** домене/магазине inSales  
- Обновления — **по политике DanForge** (модель R1 рекомендована, **владелец ещё не утвердил**; см. `06-decisions.md`)  
- Major / крупные фичи — отдельно  

---

## 2. Пакеты A / B / C

| Пакет | Цена | Работы DanForge |
|-------|------|-----------------|
| **A. Лицензия** | 5 000 ₽ | Zip + инструкция. Без установки. |
| **B. Установка** | 8 000 ₽ | A + загрузка, триггеры, базовая выдача, смоук. **Primary CTA.** |
| **C. Установка + поиск по статьям + донастройка** | 12 000 ₽ | B + `show_articles` и конфиг блога, подгонка, приёмка. **Не** написание статей. |

**Допы:** перенос лицензии ~3 000 ₽; кастом вне настроек 2 500 ₽/ч; второй магазин = новая лицензия.

---

## 3. Zip для клиента (сборка)

### Gen-4 — имя: `danforge-quick-search-v1.0.9-gen4.zip`

```
danforge-quick-search/
├── README-INSTALL.md
├── LICENSE-NOTE.txt
└── widget/
    ├── info.json                 ← из info.gen4.json
    ├── snippet.liquid
    ├── snippet.js
    ├── snippet.scss
    ├── settings_form.json
    └── settings_data.json
```

### Gen-2 — имя: `danforge-quick-search-v1.0.9-gen2-theme-snippet.zip`

```
danforge-quick-search-gen2/
├── README-INSTALL.md             ← или docs/install.md
├── LICENSE-NOTE.txt
├── snippets/df_quick_search.liquid
├── media/df_quick_search.js
├── media/df_quick_search.css
├── config/settings_fieldset.html
├── config/settings_data.keys.json
└── patches/layouts.layout.include.liquid.txt
```

**Перед упаковкой:**

- [ ] Версия **v1.0.9** в README / FEATURES / CHANGELOG; description в манифесте актуальна  
- [ ] Gen-4: `info.gen4.json` → `info.json`  
- [ ] Gen-2: liquid **и** CSS в одном zip; сверить JS с gen-4 parity  
- [ ] Не класть `.git`, `node_modules`, внутренние артефакты  
- [ ] LICENSE-NOTE: «1 магазин = 1 лицензия»; обновления — мягкая формулировка до утверждения R1  

---

## 4. Чеклист поставки клиенту (пакет B / C)

### До начала

- [ ] URL магазина  
- [ ] Поколение: Gen-2 / Gen-4  
- [ ] Доступ в админку (или клиент ставит сам — A)  
- [ ] Согласован пакет A / B / C  
- [ ] Для C: handles блогов + URL блога  

### Установка Gen-4

- [ ] Загружены файлы SimpleWidget  
- [ ] Виджет на страницах (header / outside)  
- [ ] `enabled` = ON  
- [ ] `trigger_selectors` открывают панель  
- [ ] Базовые: фото, цены, категории по согласованию  
- [ ] При C: `show_articles` ON + handles + `articles_blog_url` + server reload  

### Установка Gen-2 (theme-snippet)

- [ ] Сниппет + CSS + JS залиты  
- [ ] Include в layout по патчу  
- [ ] Settings fieldset подключены  
- [ ] Триггеры / enabled  
- [ ] Network: CSS 200 (chrome панели не «голый»)  
- [ ] При C: статьи + reload  

### Смоук (обязательно перед сдачей)

- [ ] Открытие по триггеру; закрытие: оверлей, ×, Escape  
- [ ] Кириллица ≥2 символа → результаты  
- [ ] Поиск по артикулу (если есть SKU)  
- [ ] Фото / цена / old price (если включены)  
- [ ] «Все результаты» / Enter → `/search?q=…`  
- [ ] Mobile: панель + сетка читаемы; tabs при статьях  
- [ ] *(желательно)* RU↔EN: запрос в «не той» раскладке → retry  
- [ ] *(C)* Статьи в sidebar / tab; «Все статьи →» при необходимости  
- [ ] *(C)* Zero-results не ломает UI  

### Передача клиенту

- [ ] Как выключить / сменить placeholder / триггеры  
- [ ] 1 магазин = 1 лицензия  
- [ ] Ссылка на страницу продукта danforge  
- [ ] *(опц.)* Имена dataLayer: `df_qs_search`, `df_qs_product_click`, `df_qs_zero_results`, `df_qs_category_click`, `df_qs_layout_fix`  

---

## 5. Границы оффера (фиксировать в переписке / на сайте)

**Не входит:**
- Редизайн шапки / темы  
- Написание / редактура статей блога (даже в пакете C)  
- Полнотекстовый поиск по телу статьи (только title, tags, related products)  
- Elastic / внешний поисковый движок  
- Ежемесячное сопровождение  
- Второй магазин без новой лицензии  
- Полная настройка GTM-кабинета клиента  

**Честные caveats статей:** полный Liquid-индекс → вес HTML на странице; cache key по `articles.size` (правка title без смены size может «залипнуть»); «Все статьи →» для UX большого блога.

---

## 6. GTM-чеклист продажи (владелец)

### Материалы команды (2026-07-24)

- [x] `01-brief.md` — scope, пакеты, дельта v1.0.9  
- [x] `02-site-page.md` — тексты Tilda  
- [x] `02b-seo.md` — SEO / schema / alt  
- [x] `03-kwork-page.md` — объявление Kwork  
- [x] `04-package-checklist.md` (этот файл)  
- [x] Баннеры P0 — `artifacts/2026-07-21-df-quick-search-packaging/assets/`  

### Сделать вручную

- [ ] Снять P0 скрины с armedf → `shot-*.png` (инструкция в site-page / banners 2026-07-21)  
- [ ] Собрать страницу Tilda по `02-site-page.md` + meta из `02b-seo.md`  
- [ ] Карточка на `/services/modules` + `catalog-quick-search-card-800x800.png`  
- [ ] Опубликовать Kwork по `03-kwork-page.md` + обложка  
- [ ] Склеить URL Kwork ↔ кнопки на danforge  
- [ ] *(опц.)* Клиентские zip gen-4 / gen-2  
- [ ] Утвердить политику обновлений (R1)  
- [ ] Разрешить ли светить sushivenik.ru  

### После первой продажи

- [ ] Отзыв на Kwork  
- [ ] Обновить `knowledge/danforge/products/df-quick-search.md`  
- [ ] Отметить в `knowledge/metrics/monthly-log.md`  

---

## 7. Связанные артефакты

| Файл | Содержание |
|------|------------|
| `01-brief.md` | Бриф Analyst |
| `02-site-page.md` | Tilda copy-paste |
| `02b-seo.md` | SEO-pass |
| `03-kwork-page.md` | Kwork listing |
| `../2026-07-21-df-quick-search-packaging/assets/` | Баннеры P0 |
| `../2026-07-21-df-quick-search-packaging/06-decisions.md` | Цены, C, armedf, обновления |
| `projects/df_quick_search/FEATURES.md` | Источник правды по фичам |
