# Чеклист: виджет inSales перед заливкой / отдачей

**Проект:** df_reviews_slider  
**Handle:** danforge_reviews_slider  
**Версия:** v1.3.1  
**Дата:** _______________

## Файлы

- [ ] `info.json` (generation: 4)
- [ ] `settings_form.json` — типы полей корректны (range/color/select/checkbox)
- [ ] `settings_data.json` — ключи = `name` из формы
- [ ] `snippet.liquid`, `snippet.js`, `snippet.scss`
- [ ] `widget/tests/settings-matrix.test.js` — `node …` exit 0
- [ ] `widget/tests/layouts.test.js` — `node …` exit 0
- [ ] `widget/tests/source-tabs.test.js` — lazy-load + DOM budget exit 0
- [ ] `widget/tests/e2e/dual-source.spec.js` — 6 сценариев Playwright green
- [ ] `widget/tests/visibility.html` — PASS в браузере

## Настройки (каждый пункт — ON и OFF в редакторе)

| Настройка | data-* в HTML | Визуально OK |
|-----------|---------------|--------------|
| hide_source | | ☐ |
| hide_date | | ☐ |
| hide_avatar | | ☐ |
| hide_write_btn | кнопка «Оставить отзыв» скрыта | ☐ |
| hide_insales / hide_yandex | | ☐ |
| display_mode (select) — **6 layouts** | `df-reviews--layout-*` + `data-layout` | ☐ |
| layout-columns (1–4) | класс `df-reviews--cols-N` | ☐ |
| text-lines | обрезка `.df-reviews__text`, «Читать полностью» | ☐ |
| review-text-align (left / center / right) | `--df-reviews-text-align` | ☐ |
| floating-offset | sticky CTA / вкладки | ☐ |
| product-thumb-ratio / product-bg-color / product-text-color | блок `.df-reviews__product` | ☐ |
| insales-shop-avatar + товарный отзыв | инициалы в аватаре, товар под рейтингом | ☐ |
| source-tabs + hide_insales | вкладка «Сайт» / «Товар» скрыта | ☐ |
| source-tabs + hide_yandex | вкладка Яндекс скрыта, lazy не mount | ☐ |
| source-tabs + masonry | боковые вкладки **со счётчиками** (Сайт/Товар + Яндекс) | ☐ |
| source-tabs + slider/grid | вкладки **без** счётчиков | ☐ |
| min_rating (0 / 4 / 5) | число, не текст | ☐ |
| title-align (left / center) | класс `df-reviews--title-*` | ☐ |
| cta-text / cta-url | текст и href в DOM | ☐ |
| autoplay, arrows, accent-color | | ☐ |

### Dual-source (v1.2.1)

- [ ] Вкладки ON, default Яндекс — при lazy InSales не в DOM до клика «Сайт»
- [ ] Клик «Яндекс» — слайды mount, layout не ломается
- [ ] Masonry + tab counts — счётчики до/после mount корректны
- [ ] Slider + InSales load-more — AJAX **не дублирует** yandex
- [ ] hide_yandex ON — вкладка скрыта, lazy не mount

### Страница товара (v1.3.1)

- [ ] На карточке товара вкладка **«Товар»** — только `product.reviews`
- [ ] Вкладка **«Яндекс»** видна и работает
- [ ] Нет отзывов на товар — `product-empty-message` + кнопка «Оставить отзыв»
- [ ] Форма отзыва POST → `product.url/reviews`, `review[product_id]`
- [ ] Класс `df-reviews--product-page` на shell
- [ ] Masonry: «Читать полностью» только при обрезке текста; фото **после** текста в карточке
- [ ] Masonry popup: фото **перед** полным текстом
- [ ] Смена layout в превью редактора — rescan без утечки DOM

## HTML-контроль (DevTools)

- [ ] На `.df-reviews` — модификаторы `df-reviews--hide-*` соответствуют чекбоксам
- [ ] Нет лишнего `style="display: none !important"` при выключенном hide
- [ ] После loop Swiper дубликаты слайдов тоже скрыты/показаны верно
- [ ] `data-yandex-count` сохраняется при lazy-stash

## CLI DanForge (internal only)

- [ ] `cli/gui_ctk.py` — CustomTkinter, DanForge brand
- [ ] `start.bat` → gui_ctk по умолчанию
- [ ] CLI **не передаётся клиентам** — только сниппет + инструкция
- [ ] Ручной режим (без API): wizard → output/ → копировать сниппет вручную
- [ ] `python -m unittest` в `cli/tests/` — green

## Документация

- [ ] README / INSTRUCTION: шаги заливки всех файлов (не только настройки в админке)
- [ ] INSTRUCTION: сценарий «ручной режим» для manual tier
- [ ] Примечание: после смены `name` в settings_form — **сохранить виджет заново**

## Подпись

- Programmer: ___
- Code Reviewer: APPROVED / NEEDS_REVISION
- Jarvis: готово к клиенту ☐
