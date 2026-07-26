# Как работает переключение языка и валюты в df_quick_search

**Task-id:** `2026-07-24-df-quick-search-ux-i18n`  
**Версия виджета:** v1.1.2  
**Дата:** 2026-07-24  
**Аудитория:** владелец / поддержка

---

## 1. Перезагрузка страницы при `?lang=en` / `?lang=ru`

На типичной витрине inSales (пример: bimbobooks.ru) смена языка — это **полная перезагрузка страницы**, а не SPA.

1. Пользователь кликает ссылку с `?lang=en` или `?lang=ru`.
2. Сервер отдаёт HTML уже в нужной локали (Liquid, `language.locale`, meta `shop-config`).
3. JS виджета загружается заново и заново определяет язык.

Отдельный слушатель клика по языку **не нужен**: контракт — reload. После reload виджет читает актуальный locale из config / DOM / URL.

---

## 2. Как виджет определяет язык (locale)

Цепочка (первый непустой результат побеждает):

| # | Источник | Комментарий |
|---|----------|-------------|
| 1 | `Shop.config.locale` / meta `shop-config` | Может быть **строкой** (`"en"`) или **объектом** (`{ code: "en", … }`) |
| 2 | `Site.language.locale` / `Site.language` | Тема |
| 3 | `<html lang="…">` | |
| 4 | `meta[name="default-locale"]` | |
| 5 | URL `?lang=` | `URLSearchParams` |
| 6 | `data-ui-locale` на корне виджета | Liquid SSR |
| 7 | Fallback | `'ru'` |

**Важно (v1.1.1):** `normalizeLocaleString()` никогда не делает `String(object)` → `"[object Object]"`. Из объекта берётся `.code` / `.locale` / `.iso` / `.iso_code` / `.lang` / … Иначе `/search_suggestions?locale=%5Bobject%20object%5D` давал HTTP 500.

Для UI chrome и API:

- `detectApiLocale()` → primary-часть (`en-US` → `en`);
- `detectUiLocale()` → `'en'` только если API-локаль `en`, иначе `'ru'` (словарь chrome).

---

## 3. Что переводится автоматически

| Что | Как |
|-----|-----|
| **Названия товаров** | `/search_suggestions?locale=…` + enrich `/products_by_id/…?lang=…` (параметр именно `lang`, не `locale`) |
| **Категории** | Liquid JSON коллекций на SSR — язык страницы после reload |
| **Статьи** | Liquid-индекс с ключом кэша по `language.locale` (если переводы заведены в админке) |
| **UI chrome виджета** | Словари `STRINGS.ru` / `STRINGS.en` + `t()`: секции, пустые состояния, сортировка, «Показать ещё», OOS, подсказки |

Merge enrich (v1.1.0): заголовок `product.title \|\| full.title` (не затирать EN suggestion RU-ответом enrich); цена — из enrich (см. валюту).

---

## 4. Что НЕ переводится само

| Что | Почему |
|-----|--------|
| **Placeholder** поля поиска (из настроек виджета) | Одна строка в админке — мерчант задаёт RU или EN текст сам |
| **Популярные запросы** (`popular_queries`) | То же: один список строк, без мультиязычных полей |
| **Языки кроме RU/EN** | Неизвестный locale → русские строки chrome |
| **Контент темы вне виджета** | Хедер/футер темы — ответственность темы |

---

## 5. Валюта отдельно от языка

Язык (`?lang=`) и валюта (`site_currency_code`) — **разные механизмы**.

1. Тема шлёт форму `POST /site_currencies/update_current` (часто `<select name="site_currency_code">` в `.header-currency`).
2. Сессия (cookie) запоминает выбранную валюту.
3. `/products_by_id` отдаёт **уже сконвертированные** цены.
4. `/search_suggestions` `price_min` обычно остаётся в **базовой** валюте магазина (RUR) — поэтому виджет берёт цену из enrich, не из suggestion.
5. Символ/формат: `detectCurrencyCode()` → `Shop.config.currency_code` → selected option в `.header-currency` → эвристика по `money.unit`; затем preset (`$0.81`, `12.50 €`, `227 ₽`).

**v1.1.2:** если `Shop.config.get(key)` на теме отдаёт весь config вместо значения ключа, виджет больше не принимает это за `money_with_currency_format` (иначе залипал дефолт `₽` при сумме уже в USD).

---

## 6. Остаточные ограничения

- Смена валюты без обновления `Shop.config` / без reload: тема обычно submit→reload; если тема сделает «тихий» AJAX без обновления config, виджет опирается на DOM-select и preset по коду.
- Если API магазина игнорирует `lang` на `products_by_id`, названия enrich могут остаться в языке по умолчанию (на bimbobooks `lang` проверен).
- Если enrich упал, fallback-цены из suggestions могут быть в базовой валюте.
- Admin placeholder / popular — один язык на выбор мерчанта.
- Не-EN локали UI → русские строки.

---

## Краткая шпаргалка для проверки

1. Открыть `/?lang=en` → chrome «Products» / «Search», titles EN.  
2. В шапке выбрать USD → reload → в поиске цены вида `$0.81`, не `0.81 ₽`.  
3. Вернуть `/?lang=ru` + RUR → «Товары», цены с `₽`.
