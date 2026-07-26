# Совещание: df_reviews_slider — итог для владельца

**Дата:** 2026-07-15  
**Режим:** стратегический (операционный → стратегия)  
**Проект:** `projects/df_reviews_slider/`

---

## Коротко

Виджет **готов к пилоту и GTM**. За 14–15 июля закрыты спринт CLI (CTk + wizard manual), сохранены ваши ручные правки виджета, исправлены marquee/spotlight/masonry в редакторе, исследован AJAX для armedf.ru. **179 unit-проверок** виджета + **27 CLI-тестов** + **6/6 e2e** — зелёные. Code Reviewer спринта: **APPROVED**.

**Главный блокер до продаж:** публикация danforge.ru и Kwork (материалы готовы, скрины — нет).

---

## Что сделано (по темам)

| Тема | Статус |
|------|--------|
| Dual-source v1.2 (6 макетов, lazy Yandex) | ✅ shipped |
| CLI rebuild (CTk, yandex-only, wizard manual) | ✅ done, APPROVED |
| Ваши правки виджета 14.07 | ✅ задокументированы, не откатывать |
| Marquee: popup, dedupe, offset, overflow | ✅ fixed 15.07 |
| Spotlight/Masonry: русские label в parseLayout | ✅ fixed 15.07 |
| settings_form: select [label, value] | ✅ fixed 15.07 |
| AJAX research (armedf.ru) | ✅ якорь `/blogs/shop-reviews` подтверждён |
| armedf.ru CLI | ✅ 63 отзыва Яндекс загружены в тему 14.07 |
| GTM тексты (danforge + Kwork) | ✅ готовы к ручной публикации |
| Скрины demo | ⏳ не сняты |
| Виджет на armedf.ru | ⏳ не задеплоен |
| Первая продажа | ⏳ Q3 цель 1–2 установки |

---

## Решения на совещании (предлагаю обсудить)

1. **GTM приоритет:** danforge.ru → скрины demo → Kwork (как в решении 13.07).
2. **armedf.ru:** следующий шаг — деплой виджета + masonry на `/blogs/shop-reviews` (не на главную для server load-more).
3. **Defaults:** в продукте `source-tabs=false`, активная вкладка Яндекс — ваш выбор; для маркетинговых скринов включить вкладки вручную.
4. **Цены:** Модель A без изменений — 12 000 / 14 000 / 2 000 ₽/мес.
5. **Отложено:** PyInstaller, probe якоря AJAX при init, guard hide_yandex+default tab.

---

## Артефакты этой сессии

| Файл | Содержание |
|------|------------|
| `01-work-report.md` | Хронология, статус виджета, тесты, armedf |
| `02-docs-audit.md` | Аудит документации, что обновлено |
| `03-site-kwork-actions.md` | Инструкции Tilda/Kwork, приоритеты |

---

## Ваши следующие шаги (по приоритету)

1. Снять P0-скрины на demo myshop (`03-screenshots-checklist.md`).
2. Опубликовать страницу danforge.ru (`01-danforge-page.md` в GTM).
3. Опубликовать Kwork (`02-kwork-listing.md`).
4. Задеплоить виджет на armedf.ru (masonry + вкладки на странице блога).
5. Первая заявка / outreach.

---

## Ссылки

- Продукт KB: `knowledge/danforge/products/df-reviews-slider.md`
- Ваши правки: `artifacts/2026-07-14-owner-widget-edits/01-owner-changes.md`
- GTM: `artifacts/2026-07-14-reviews-slider-gtm/`
- AJAX: `artifacts/2026-07-14-reviews-ajax-research/01-research.md`
