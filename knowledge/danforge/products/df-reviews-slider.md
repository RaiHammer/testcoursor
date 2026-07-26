# Продукт: Слайдер отзывов (DanForge)



**Статус:** v1.3.1 — armedf.ru пилот; product page mode + вкладки «Сайт»/«Товар» (20.07.2026)

**Страница продукта:** https://danforge.ru/services/modules/reviews-slider-widget  

**Kwork:** https://kwork.ru/website-repair/53538045/zhivie-otzyvy-insales-i-yandeks-karty-v-odnom-bloke-6-maketov-na-vybor  

**Каталог модулей:** https://danforge.ru/services/modules  

**Пилот:** armedf.ru (theme preview / deploy — подтверждено владельцем 15.07)  


**Решения:** `knowledge/strategy/decisions/2026-07-13-df-reviews-slider-gtm.md`  

**Handle:** `danforge_reviews_slider`  

**Папка:** `projects/df_reviews_slider/`  

**Документация:** `projects/df_reviews_slider/README.md`  

**Owner overrides:** `artifacts/2026-07-14-owner-widget-edits/01-owner-changes.md`  

**Совещание 15.07:** `artifacts/2026-07-15-reviews-project-meeting/`  

**Лимиты по режимам:** `artifacts/2026-07-13-reviews-load-limits/05-report.md`  

**Zip:** `projects/df_reviews_slider/dist/danforge-reviews-slider.zip`



## Состав



| Часть | Путь |

|-------|------|

| Виджет gen-4 | `projects/df_reviews_slider/widget/` — 6 макетов, dual-source |
| Виджет gen-2 | `projects/df_reviews_slider_gen2/widget/` — Yandex-only, slider + list (v0.1) |

| CLI | `cli/get_reviews.py` — Yandex-only pipeline, CTk GUI |

| Дистрибутив | `dist/danforge-reviews-slider.zip` |



## Архитектура данных



- **InSales** — Liquid prefetch в виджете + AJAX load-more (Masonry, нужен pagination anchor)

- **Яндекс** — CLI → `danforge_reviews_yandex.liquid` в теме (Карты: полный набор; Магазин: digest API ~31)

- **Legacy** — `danforge_reviews_slides.liquid` (fallback)



## Макеты



slider · masonry (Мансори) · grid · list · spotlight (Режим фокуса) · marquee



Masonry: боковые вкладки со счётчиками, floating CTA (`floating-offset`), «Читать полностью» по `text-lines`, фото inline после текста — **рекомендуется для страницы блога/отзывов**.

**v1.3.1 (20.07):** страница товара — только `product.reviews`, Яндекс на месте; вкладки «Сайт» / «Товар»; `product-empty-message`.

**v1.3.0 (20.07):** блок товара InSales, `hide_write_btn`, `review-text-align`, оформление `.df-reviews__product`, CLI Yandex Shop.

**Gen-2:** `projects/df_reviews_slider_gen2/` — **in progress** (Yandex-only, generation 2). Prep: `03-gen2-prep.md`, nivona analysis: `04-gen2-nivona-analysis.md`. Пилот-кандидат: **nivona.ru** (Яндекс Магазин, Swiper 3.4).



## Цена



**Модель A** (утверждено 2026-07-13): разовая установка + сопровождение.



| Пакет | Разово | Ежемесячно |

|-------|--------|------------|

| **Стандарт** | 12 000 ₽ | 2 000 ₽/мес |

| **Manual** (без API) | 14 000 ₽ | 2 000 ₽/мес |

| **Перенос домена** | +3 000 ₽ | — |



Сопровождение: обновление Яндекса, мелкие правки (обязательно при источнике Яндекс). CLI клиентам не отдаём.



**Manual tier:** DanForge вставляет сниппет; обновления раз в 2 нед. Пакета «InSales only» нет — всегда все источники.



## GTM



**Порядок:** danforge.ru → Kwork.  

**Публикация:** владелец вносит в Tilda/Kwork **сам**.  

**Материалы:** `artifacts/2026-07-14-reviews-slider-gtm/` (обновлены 15.07)  

**Действия:** `artifacts/2026-07-15-reviews-project-meeting/03-site-kwork-actions.md`  

**Скрины:** demo myshop до первой реальной продажи — **не сняты**.  

**Позиционирование:** «подтягиваем с Яндекс Карт» (не «парсинг»).



## Каналы



- [x] Код + CLI + README v1.2.1

- [x] GTM v1.2 — danforge + Kwork + скрины checklist

- [x] Code Reviewer sprint APPROVED

- [ ] danforge страница — **владелец**

- [ ] Kwork опубликовать — **владелец** после danforge

- [ ] Скрины demo P0

- [ ] armedf.ru deploy виджета

- [ ] Первая реальная продажа (Q3 цель: 1–2 установки)



## Defaults: продукт vs продажи



| Настройка | В виджете (owner) | Для demo/скринов |

|-----------|-------------------|------------------|

| `source-tabs` | `false` | включить `true` |

| Default tab | `yandex` | по сценарию скрина |

| `insales-prefetch-limit` | `20` | 20 |

| `display_mode` | slider | masonry для hero-скрина |

| `yandex_limit` (CLI) | 30 (продажи) | 30 |



## CLI



**Только внутренний** — клиентам не отдаём. CTk GUI + manual wizard. `start.bat` → `gui_ctk.py`. Обновления Яндекса: владелец на своём ПК. Playwright — по кнопке.



## Тесты (2026-07-15)



| Suite | Результат |

|-------|-----------|

| Widget unit | **179 checks** |

| CLI unittest | **27 tests** |

| Playwright e2e | **6/6** |



## Пилот: armedf.ru



| Параметр | Статус |

|----------|--------|

| CLI Yandex | ✅ 63 отзыва uploaded 14.07 |

| AJAX якорь | ✅ `/blogs/shop-reviews` |

| Виджет на сайте | ⏳ не задеплоен |

| Рекомендация | masonry + tabs на `/blogs/shop-reviews` |



## Sprint backlog



1. ~~CLI rebuild (CustomTkinter + manual workflow)~~ — **done**

2. ~~Code review + e2e smoke dual-source~~ — **APPROVED**

3. ~~Lazy-load Yandex~~ — done

4. ~~Owner edits preservation~~ — documented

5. ~~Jul 15 editor fixes (marquee, parseLayout, settings_form)~~ — done

6. **GTM publish** — владелец

7. **armedf deploy** — следующий техшаг

8. PyInstaller — v2 backlog



## Сервер



Не нужен. CLI на ПК DanForge (internal only).



## Артефакты



- `artifacts/2026-07-09-reviews-slider/` — MVP

- `artifacts/2026-07-13-reviews-sources-refactor/` — dual-source

- `artifacts/2026-07-14-reviews-slider-sprint/` — CLI sprint

- `artifacts/2026-07-14-owner-widget-edits/` — owner overrides

- `artifacts/2026-07-14-reviews-ajax-research/` — AJAX constraints

- `artifacts/2026-07-15-reviews-project-meeting/` — strategic meeting


