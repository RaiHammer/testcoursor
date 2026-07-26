# Установка: быстрый поиск DanForge (gen-2 theme-snippet)

**Пакет:** `projects/df_quick_search/widget-gen2/`  
**Тема:** inSales generation 2 (референс — nivona-like)  
**Не для:** checkout / client_account layouts

Primary канал gen-2 — **этот пакет**. `widget/info.gen2.json` (SimpleWidget) — запасной вариант для магазинов с рабочими widget zones.

---

## Что не входит в scope

| Зона | Почему |
|------|--------|
| Checkout / account layouts | Поиск в шапке storefront не нужен на чекауте |
| Правка разметки `.header_search` темы | Достаточно селекторов + JS intercept |
| Вливание CSS в `theme.css` | Отдельный `df_quick_search.css` в media |
| Форк `df_quick_search.js` | Только копия gen-4 `snippet.js` |

---

## Шаги установки (6)

### 1. Snippet

Скопировать в тему:

```
snippets/df_quick_search.liquid  ← из widget-gen2/snippets/
```

В liquid есть critical `<style>`: overlay/panel (`display:none` + `position:fixed`) **и** chrome (× / input / recent·popular chips). Без актуального liquid при 404 CSS панель открывается «голой».

### 2. Assets (media)

```
media/df_quick_search.js
media/df_quick_search.css
```

из `widget-gen2/media/`.

**Всегда заливать liquid + CSS парой** (js — если менялся). После заливки: DevTools Network → `df_quick_search.css` **200**, hard refresh / disable cache. Число строк SCSS (~973) > compiled CSS (~813–825) — это нормально (nesting), не усечение.

### 3. Fieldset настроек

Вставить содержимое `config/settings_fieldset.html` в `config/settings.html` темы (отдельный `<fieldset>` «Быстрый поиск DanForge»).

### 4. Дефолты settings_data

Смержить ключи из `config/settings_data.keys.json` в `presets.current` → `config/settings_data.json`.

Default-ON чекбоксы обязаны быть `"1"`. Ключи `df_qs_show_articles` и `df_qs_hide_zero_price` **не** добавлять (default OFF = absent).

Default `df_qs_trigger_selectors` уже включает gen-4 (armedf) + nivona (`.header_search`, `#header-search`, form, button).

### 5. Include в layout

В `templates/layouts.layout.liquid` — после `modals`, **перед** `scripts`:

```liquid
{% include "modals" %}
{% include "df_quick_search" %}
{% include "scripts" %}
```

Готовый фрагмент: `patches/layouts.layout.include.liquid.txt`.

- Ровно **один** include.
- **Не** добавлять в `layouts.checkout*.liquid` / account.

### 6. Опубликовать тему

Сохранить и опубликовать. Smoke:

1. Клик по поиску в шапке → fullscreen-панель.
2. Ввод ≥2 символов → live-выдача.
3. Escape / × / overlay закрывают.
4. Enter → `/search?q=…`.
5. В DevTools: один `[data-df-quick-search-root]`, `df_quick_search.css` **200**; × / input / chips стилизованы (не «голые»).
6. «Включить быстрый поиск» OFF → панель/перехват не активны.

---

## Sync после релиза gen-4

При обновлении `widget/snippet.js`:

1. Скопировать → `widget-gen2/media/df_quick_search.js`.
2. При смене стилей — пересобрать `df_quick_search.css` из scss **и сохранить critical overlay/panel** (`display:none` + `position:fixed` + `.is-open`). SCSS (~973 строк) → CSS (~813–825) — ожидаемо.
3. Сверить critical `<style>` в `snippets/df_quick_search.liquid`: overlay/panel **+ chrome** (× / input / chips). Полный паритет layout с gen-4 `widget/snippet.liquid` + gen-2 chrome-страховка.
4. Залить клиенту: **liquid + css** (минимум); js — если менялся. DevTools → CSS **200**, hard refresh.

Без sync gen-2 отстаёт от gen-4 по фичам.

---

## Preview checklist (v1.1.3 — hover fix + toggle)

После заливки **js + css + liquid** (+ fieldset/keys при новой установке):

- [ ] Desktop (в т.ч. touch-laptop): hover на фото с ≥2 images → плавный crossfade
- [ ] Настройка «Второе фото при наведении» OFF → одно `<img>`, нет `has-hover-image`
- [ ] Mobile / touch: нет sticky flash второго фото
- [ ] Цены `$` / EN titles без регресса (v1.1.0–1.1.2)

## Preview checklist (v1.1.0 — appear + hover 2nd image)

После заливки **js + css** (liquid: panel/locale + data-ui-locale):

- [ ] DevTools Network: `df_quick_search.css` / js → **200**; hard refresh
- [ ] Результаты поиска: товары / чипы категорий / статьи плавно появляются (не рывком)
- [ ] Desktop: hover на фото с ≥2 images → плавный переход на второе; уход курсора → первое
- [ ] Товар с 1 фото — без артефактов / пустого hover-слоя
- [ ] Mobile / touch: нет flash второго фото при тапе
- [ ] Chrome × / input / chips без регресса (v1.0.9)

## Preview checklist (v1.0.9 — critical chrome + CSS recompile)

После заливки **liquid + css** на sushivenik:

- [ ] DevTools Network: `df_quick_search.css` → **200** (не 404); hard refresh / disable cache
- [ ] × абсолютно слева сверху, не plain text в потоке
- [ ] Input крупный italic (не browser default)
- [ ] Recent/popular — чипы с `border-radius` / padding (не «серые кнопки» без стилей виджета)
- [ ] До открытия: нет leak × / «ПОИСК» в потоке страницы
- [ ] Overlay/panel `position: fixed` + `display: none` без `.is-open`
- [ ] Цены в ряду карточек по низу (v1.0.8 сохранён)

## Preview checklist (v1.0.8 — price bottom-align)

После заливки css (gen-2) / scss (gen-4):

- [ ] В ряду карточек с названиями 2–4 строки цены на одной горизонтали у нижнего края
- [ ] Mobile 2-col и desktop grid — то же
- [ ] `show_prices` OFF — карточки без цен, без поломки layout
- [ ] Skeleton-карточки: цены-плейсхолдеры тоже у низа

## Preview checklist (v1.0.7 — critical CSS)

После заливки liquid + css на sushivenik / любую gen-2 тему:

- [ ] До клика по поиску: **нет** видимых × / «ПОИСК» / панели в потоке страницы
- [ ] DevTools: у `.df-quick-search__panel` и `__overlay` без `.is-open` → `display: none`
- [ ] DevTools: `position: fixed` на panel/overlay (из inline `<style>` или CSS)
- [ ] Assets: `df_quick_search.css` → **200** (не 404)
- [ ] Клик по поиску → fullscreen-панель поверх контента, layout страницы **не** ломается
- [ ] Escape / × / overlay закрывают; scroll lock (`html/body.df-quick-search-open`)
- [ ] Desktop + mobile размеры панели ок
- [ ] Gen-4 (armedf) не регрессировал (этот релиз gen-2 only)

---

## Чеклист клиента

**Проект:** df_quick_search gen-2  
**Дата:** _______________

### Файлы

- [ ] `snippets/df_quick_search.liquid`
- [ ] `media/df_quick_search.js`
- [ ] `media/df_quick_search.css`
- [ ] Fieldset в `config/settings.html`
- [ ] Ключи в `presets.current` / `settings_data.json`
- [ ] Include перед `scripts` в `layouts.layout.liquid`
- [ ] Нет include в checkout / account
- [ ] Тема опубликована

### Smoke

- [ ] Клик по поиску шапки → панель
- [ ] `df_qs_enabled` OFF → не активен
- [ ] Enter → `/search?q=…`
- [ ] Desktop + mobile, scroll lock ок
- [ ] Один root, assets 200

### Настройки (ключевые)

- [ ] Фото / цены / категории / сортировка / «Все результаты» / OOS — ON и OFF
- [ ] Статьи: OFF по умолчанию; ON — без падения страницы
- [ ] Триггеры подходят к теме (или обновлены)

### Обновление с gen-4 / релиз gen-2

- [ ] JS скопирован после релиза gen-4 (если менялся)
- [ ] CSS пересобран из scss (с critical overlay/panel + scroll-lock)
- [ ] Critical `<style>` в liquid: overlay/panel **+ chrome** (× / input / chips)
- [ ] Залиты **оба**: `snippets/df_quick_search.liquid` + `media/df_quick_search.css`
- [ ] CSS asset **200**; hard refresh

### Подпись

- Programmer: ___  
- Code Reviewer: APPROVED / NEEDS_REVISION  
- Jarvis / владелец: готово к клиенту ☐

---

## Fail-mode без include

Без `{% include "df_quick_search" %}` панель на сайте **отсутствует** — это ожидаемо. Upload SimpleWidget (`info.gen2.json`) сам по себе на nivona-like темах панель не выведет.

## `{% cache %}` для статей

Сниппет оборачивает индекс статей в `{% cache %}`. Если тема/магазин не поддерживает тег — уберите `{% cache … %}` / `{% endcache %}`, оставьте `<script type="application/json" …>`. Виджет продолжит работать, без серверного кеша индекса.

## v1.1.3 re-upload (gen-2)

**Обязательно:** `media/df_quick_search.js` + `media/df_quick_search.css` + `snippets/df_quick_search.liquid`.  
Новая установка / смена fieldset: `config/settings_fieldset.html` (+ `settings_data.keys.json`).  
Фикс hover 2-го фото (`any-hover`) + настройка `df_qs_hover_second_image`.

## v1.1.2 re-upload (gen-2)

**Обязательно:** `media/df_quick_search.js` (+ bump description в info при публикации).  
Исправляет символ валюты: при USD больше не `0.81 ₽`, а `$0.81`.

## v1.1.0 re-upload (gen-2)
- `media/df_quick_search.js`
- `snippets/df_quick_search.liquid` (locale panel strings + `data-ui-locale`; critical CSS unchanged)
