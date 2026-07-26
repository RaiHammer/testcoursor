# inSales — виджеты gen-4 (платформенные ограничения)

**Обязательно читать** перед любым виджетом с `settings_form.json`.  
Обновлено: 2026-07-15 (ретро багфикса `df_reviews_slider`, ADR label parsing).

## Ключи настроек

| Правило | Почему |
|---------|--------|
| В `settings_form.json` — **имена с подчёркиванием** (`hide_source`, `min_rating`) | Гипотеза: hyphen-ключи в Liquid читаются нестабильно |
| Поля контента с дефисами (`cta-text`, `title-align`) — **в Liquid читать hyphen первым** | inSales сохраняет по `name` из формы |
| `settings_data.json` — ключи **точно как `name`** в `settings_form.json` | Иначе дефолты не подхватываются |

```liquid
{% assign cta_text = widget_settings['cta-text'] | default: widget_settings.cta_text %}
```

## Чекбоксы

| Факт | Следствие для кода |
|------|-------------------|
| Выключенный чекбокс часто **отсутствует** в `widget_settings` (не `false`) | **Нельзя** для «включено по умолчанию» делать `else → true` при nil |
| Безопасная модель: **`hide_*` с default `false`** — скрывать только при явном `true` | «Показывать X» → инвертировать в «Скрыть X» |
| Значения могут быть `true`/`false`, `"true"`/`"false"`, `1`/`0`, `""` | Парсить явно в Liquid **и** в JS |

**Запрещено:** обратная совместимость `show_source: false` → `hide_source: true` без миграции — ломает виджеты со старыми сохранёнными настройками.

## Select и button-group

| Тип | Риск |
|-----|------|
| `select` с `options: [["4 звезды", "4"], ...]` — порядок **`[label, value]`** (см. [доку inSales](https://www.insales.ru/collection/vidzhety/product/settings_formjson)) | Перепутанный поряд `[value, label]` показывает в UI **английские ключи** вместо подписей; inSales также может отдать **текст опции**, не value → парсить через `contains` в Liquid/JS |
| **Не использовать `name: layout`** в settings_form | Конфликт с Liquid/inSales — ломает рендер страницы. Использовать `display_mode` |
| `button-group` с 5+ опциями | Часто рендерится как **текстовое поле** → для макета использовать `select` |
| `column-count: var(--x)` | Не работает в SCSS inSales → классы `df-reviews--cols-N` |
| **Предпочтение:** `button-group` с короткими value (`"0"`, `"4"`, `"5"`) | Меньше шансов получить label |
| В JS/Liquid — `parseMinRating()`: сначала `parseInt`, иначе поиск цифры в строке | |
| **Owner rename:** смена `label` в форме → обновить Liquid `contains` + JS `parse*` + unit-тест | См. ADR `knowledge/strategy/decisions/2026-07-15-insales-label-parsing.md` |
| Автотест `settings-form.test.js` на порядок `[label, value]` для каждого select | Пример: `projects/df_reviews_slider/widget/tests/settings-form.test.js` |

## Типы полей в форме

| Значение | Тип в `settings_form.json` |
|----------|---------------------------|
| Числа, слайдер | `range` + `min`/`max`/`step` |
| Цвет | `color` |
| Выбор из 2–5 вариантов | `select` или `button-group` (не `text`) |
| Булево | `checkbox` + `enable_server_reload: true` |

`button-group` в части магазинов рендерится как текстовое поле — иметь fallback `select`.

## Liquid + JS + CSS — тройная защита

1. **Liquid:** классы на `.df-reviews` + корректные `data-*` + inline layout на wrapper (masonry/grid/list)
2. **JS:** `syncSettingsFromLayout()` — читает CSS vars с родителя `.layout` (live preview редактора) и `data-df-*` на shell; `prepareStaticLayout()` — inline-стили + снятие `swiper-slide` в статических режимах; `MutationObserver` на `.layout[style]`
3. **CSS:** плоские селекторы `.df-reviews--layout-* .df-reviews__grid` с `!important` + `.df-reviews--hide-* .df-reviews__*` с `!important`

**Редактор inSales:** настройки без server reload попадают в `style` на `.layout.widget-type_HANDLE` как `--setting-name`. Нельзя полагаться только на `data-*` внутри snippet.

**Не завязывать** видимость только на JS до инициализации Swiper.

## Чеклист перед отдачей клиенту

Шаблон: `templates/insales-widget-checklist.md`

Минимум:
- [ ] Каждый чекбокс: ON и OFF в превью редактора
- [ ] Каждый `range`/`select` меняет `data-*` в HTML
- [ ] `node widget/tests/*.test.js` — зелёный
- [ ] `widget/tests/visibility.html` — PASS в браузере
- [ ] Нет «залипших» inline `display:none` при выключенном hide

## Тестовые файлы (стандарт проекта)

```
widget/
  tests/
    settings.test.js   — парсеры bool/rating
    visibility.html    — smoke в браузере
```

## Типичные ошибки (антипаттерны)

1. `{% if widget_settings['show-x'] == false %}` — string `"false"` в Liquid = truthy
2. Default-on при nil для show-* — чекбокс «выкл» не работает
3. Классы только в JS — редактор не перерисовывает Liquid
4. Переименование `name` в settings_form без инструкции «пересохранить виджет»
5. Исправления без проверки HTML клиента (`data-*` в DevTools)

## Ссылки

- [settings_form.json](https://www.insales.ru/collection/vidzhety/product/settings_formjson)
- [settings_data.json](https://www.insales.ru/collection/vidzhety/product/settings_datajson-2)
- Продукт: `knowledge/danforge/products/df-reviews-slider.md`
- Ретро: `artifacts/retrospectives/2026-07-10-df-reviews-slider-retro.md`
- ADR label parsing: `knowledge/strategy/decisions/2026-07-15-insales-label-parsing.md`
- Ретро багфикс 15.07: `artifacts/2026-07-15-reviews-bugfix-retro/01-retrospective.md`
