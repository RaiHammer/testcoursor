# Roadmap — план работ

> Обновлено на стратегическом совещании 2026-07-13 (df_reviews_slider GTM).  
> **Последнее обновление:** 2026-07-20 (widget v1.3.1 + gen-2 старт)

## Период

**С:** 2026-07-06  
**По:** 2026-09-06 (2 месяца)

## Миссия периода

Сезон затишья (июль–август): создать **продукт для продажи** — виджет/функционал ИЛИ шаблон inSales. Сайт и Директ — без радикальных изменений.

## KPI (заполнить фактами)

| Метрика | Текущее | Цель | Как измеряем |
|---------|---------|------|--------------|
| Заявки с сайта / месяц | _уточнить_ | +30% | Форма danforge.ru |
| Опубликованные статьи | 0 | 3 | Блог |
| SEO-рекомендации внедрены | частично (H1, JSON-LD Product, sitemap OK) | 5 | Чеклист аудита 15.07 |
| Готовый продукт (виджет) | 2 (корзина + отзывы) | 1 MVP | projects/ |
| Установки df_reviews_slider (Q3) | 1+ pilot armedf | 1–2 | Kwork + danforge |

## Приоритет 1: Сайт danforge.ru

| # | Задача | Оценка | Ответственный | Статус |
|---|--------|--------|---------------|--------|
| 1 | Sitemap 500 | S | вы | ✅ OK 15.07 (открывается стабильно) |
| 2 | Fix H1 (склейка) | S | вы | ✅ done 15.07 |
| 3 | Product JSON-LD на модулях | S | вы | ✅ done 15.07 |
| 4 | Перелинковка «Другие модули» | S | SEO предложил | ❌ **отменено** — услуги самостоятельные |
| 5 | Alt у скринов | S | вы | **отложено** (слабый ROI) |
| 6 | Склейка Kwork ↔ кнопки reviews | S | вы | ❌ **не делаем** |
| 7 | Опубликовать 3 статьи в блог | L | SEO + вы | 1/3 — otzyvy-insales-2026 live 20.07 |
| 9 | Статья «Отзывы на сайте inSales: что работает в 2026» | M | SEO + вы | ✅ готово 20.07, APPROVED → публикация |
| 8 | Hero + CTA на кейсах | S | Designer + вы | pending |

## Приоритет 2: Поиск клиентов

| # | Задача | Оценка | Ответственный | Статус |
|---|--------|--------|---------------|--------|
| 1 | SeoZilla карта + 6 product-фраз | M | вы | ✅ done 15.07 |
| 2 | Обновить Kwork-профиль с кейсами | S | Analyst + вы | pending |
| 3 | Исследовать 5 конкурентов inSales | M | Analyst + SEO | pending |
| 4 | _(отложено)_ лид-магнит | — | — | cancelled |
| 5 | Партнёрский one-pager для valektro (черновик) | S | Jarvis + Analyst | ✅ done 20.07 (draft) |

## Приоритет 3: Разработка продуктов

| # | Задача | Оценка | Ответственный | Статус |
|---|--------|--------|---------------|--------|
| 1–12 | Корзина + отзывы v1.2.1 + GTM | — | — | ✅ done |
| 13 | Деплой виджета на armedf.ru | M | вы | ✅ **готово 15.07** |
| 14 | Git snapshot v1.2.1 + dist zip | S | Programmer | pending |
| 15 | Первая **платная** продажа reviews | L | вы | Q3 цель |
| 16 | CLI: поддержка доп. Яндекс-источников (в т.ч. Яндекс Магазин) | M | Programmer | ✅ v1.3.0 (digest API) |
| 17 | Widget v1.3.0: UX (блок товара, masonry, настройки) | M | Programmer | ✅ 20.07 |
| 17b | Widget v1.3.1: страница товара, вкладки Сайт/Товар | S | Programmer | ✅ 20.07 |
| 18 | Gen-2 виджет (`df_reviews_slider_gen2`, Yandex-only) | L | Architect + Programmer | 🔄 analysis nivona done → Swiper3 patch + pilot |
| 19 | Yandex-only версия для партнёрского канала | M | отложено | hold (до идей в основном виджете) |
| 20 | **Quick Search live** (danforge + Kwork) | M | вы | ✅ URL live 24.07 · 🔄 выровнять цены A/B/C 5/8/12k |

## Приоритет 4: Метрики и доход

| # | Задача | Статус |
|---|--------|--------|
| 1 | Заполнить kpi-targets.md реальными цифрами | pending |
| 2 | Первая запись в monthly-log.md (конец июля) | pending |
| 3 | Ретроспектива 2026-09 | pending |

## Завершено

- [x] ИИ-команда, SEO-аудиты, корзина GTM
- [x] Reviews v1.2.1 + danforge + Kwork + SeoZilla remap
- [x] Widget v1.3.1 product page + tab labels
- [x] Gen-2 scaffold (`df_reviews_slider_gen2` v0.1.0)

## Блокеры

- нет критичных
- Alt / перелинковка / Kwork-кнопки — сознательно сняты владельцем

## Решения

- `knowledge/strategy/decisions/2026-07-06-initial-roadmap.md`
- `knowledge/strategy/decisions/2026-07-13-df-reviews-slider-gtm.md`
- **2026-07-15:** см. `artifacts/2026-07-15-danforge-seo-audit/05-owner-decisions-handoff.md`
- `knowledge/strategy/decisions/2026-07-20-reviews-strategy-pivot.md`
- `knowledge/strategy/decisions/2026-07-20-valektro-partner-onepager-draft.md`
