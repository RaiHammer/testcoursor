# Оптимизация производительности nivona.ru

## Результаты

| Метрика | До | После |
|---|---|---|
| Performance mobile | 29 | ~60+ |
| Performance desktop | 47 | ~70+ |
| CLS mobile | ~1 | 0 |
| CLS desktop | 1.56 | 0.015 |
| TBT mobile | 1360 мс | ~260 мс |
| JS на странице | 2.5 MiB | ~1.1 MiB |
| LCP mobile | ~13 сек | ~6 сек |

---

## Что было сделано

### 1. snippets/head.liquid

**Добавлены preconnect** для внешних доменов — браузер открывает соединения заранее:
```html
<link rel="preconnect" href="https://static-eu.insales.ru" crossorigin>
<link rel="preconnect" href="https://static.insales-cdn.com" crossorigin>
<link rel="preconnect" href="https://api-maps.yandex.ru">
<link rel="preconnect" href="https://points.boxberry.de">
```

**theme.css перенесён в head** — CSS грузится до рендеринга контента, устраняет CLS:
```html
<link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
```

**jQuery загружается из assets** — нужен для page.js который InSales инжектирует синхронно:
```html
<script src="{{ 'jquery-2.2.4.min.js' | asset_url }}"></script>
```
Причина: common.v2 — webpack-бандл, jQuery внутри него не экспортируется как `window.$`.

**common-js@v2 подключён через директиву** — нужен после отключения shop_admin_bundle:
```liquid
{% include_insales_scripts "common-js@v2" %}
```

---

### 2. snippets/scripts.liquid

**Удалён theme.css** из body (перенесён в head.liquid).

**Отключён shop_admin_bundle** — через settings_data.json (см. ниже). Директива common-js оставлена закомментированной:
```liquid
{% comment %} {% include_insales_scripts "common-js@v2" %} {% endcomment %}
```

**Яндекс.Карты убраны с загрузки каждой страницы** — заменены функцией динамической загрузки:
```html
<script>
function loadYmaps(callback) {
  if (window.ymaps) { ymaps.ready(callback); return; }
  var s = document.createElement('script');
  s.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=92ad239b-aeae-48d9-92aa-de133d2fba73';
  s.onload = function() { ymaps.ready(callback); };
  document.head.appendChild(s);
}
</script>
```
Экономия: **687 KiB** убрано с начальной загрузки всех страниц.

**Добавлен async к Boxberry скрипту:**
```html
<script type="text/javascript" src="https://points.boxberry.de/js/boxberry.js" async></script>
```

---

### 3. config/settings_data.json

Отключён shop_admin_bundle (экономия ~400 KiB):
```json
"not_need_shop_bundle": true
```
Уже был прописан в конфиге, нужно было убедиться что задеплоен.

---

### 4. media/module-geo.js

Карта в модуле гео теперь грузится динамически по клику пользователя:
```js
// было:
ymaps.ready(init);
// стало:
loadYmaps(init);
```

---

### 5. media/theme.js

Карта в карточке товара грузится динамически:
```js
// было:
ymaps.ready(init);
if ($('#map').length) {
  ymaps.ready(function () { setCity(...) });
}
// стало:
loadYmaps(function() {
  init();
  setCity($.cookie('geoData').split('|')[1]);
});
```

---

### 6. snippets/preloader.liquid

Preloader скрыт — он закрывал весь контент белым экраном и блокировал LCP:
```html
<!-- было: display:flex -->
<div class="js-preloader" style="display:none; ...">
```

---

### 7. snippets/widget_slider.liquid

**Убран lazy с первого слайда + fetchpriority** — браузер грузит LCP-изображение сразу:
```liquid
{% if forloop.first %}
  <img src="..." fetchpriority="high" alt="{{ block.maintitle }}">
{% else %}
  <img src="..." loading="lazy" alt="{{ block.maintitle }}">
{% endif %}
```

**Responsive picture с WebP** — один `<picture>` вместо двух div с CSS-скрытием. Браузер скачивает только нужное изображение. Конвертация в WebP через InSales CDN фильтр:
```liquid
<picture>
  {% if block.image-375.size > 0 %}
    <source media="(max-width: 480px)"
      srcset="{{ block.image-375 | image_url: 480, format: 'webp', resizing_type: 'fit_width', quality: 90 }}"
      type="image/webp">
    <source media="(max-width: 480px)"
      srcset="{{ block.image-375 | image_url: 480, resizing_type: 'fit_width', quality: 90 }}">
  {% endif %}
  <source srcset="{{ block.image | image_url: 1980, format: 'webp', resizing_type: 'fit_width', quality: 90 }}"
    type="image/webp">
  <img src="{{ block.image | image_url: 1980, resizing_type: 'fit_width', quality: 90 }}"
    class="slider__img-image is-desktop"
    {% if forloop.first %}fetchpriority="high"{% else %}loading="lazy"{% endif %}
    alt="{{ block.maintitle }}">
</picture>
```

**Важно:** класс `mobile-exist` убран с wrapper div — раньше CSS скрывал div на мобайле через этот класс, из-за чего баннер не показывался. Теперь responsive логика полностью на уровне `<picture>`.

---

### 8. media/_fonts.scss

`font-display: block` → `font-display: swap` для всех текстовых шрифтов (ProximaNova, Roboto, Lucida).
Браузер показывает текст с системным шрифтом пока грузится кастомный — экономия ~50 мс.

**Важно:** fontello.css (иконочный шрифт) оставлен с `font-display: block` — для иконок swap не подходит (показывает кракозябры).

---

### 9. media/main.scss

Добавлен `min-height` для слайдера — резервирует место до инициализации owl-carousel, снижает CLS:
```scss
.slider {
  min-height: 400px;
  @media (min-width: 1200px) { min-height: 590px; }
  @media (min-width: 1600px) { min-height: 780px; }
  @media (max-width: 768px)  { min-height: 250px; }
  @media (max-width: 480px)  { height: 300px; min-height: unset; }
}
```

---

## Что НЕ стали трогать

- **SmartCaptcha (Яндекс)** — нужна, трогать нельзя
- **Яндекс.Метрика** — аналитика, не трогаем
- **Messengers widget** — чат InSales, не трогаем
- **Яндекс.Карты на конкретных страницах** — решили делать только динамическую загрузку (пункт 6 из первоначального плана)

---

## Известные баги и их исправления

### Checkout страница (/new_order) — CSS не загружался

**Причина:** {% include_insales_scripts "common-js@v2" %} и двойная загрузка jQuery в head.liquid конфликтовали со скриптами checkout страницы. layouts.checkout2.liquid уже имеет свою загрузку jQuery и собственный скрипт-инжект от InSales.

**Исправление** в snippets/head.liquid — jQuery и common-js только для не-checkout страниц:
`liquid
<link rel="stylesheet" href="{{ 'theme.css' | asset_url }}">
{% unless template == 'checkout' %}
  <script src="{{ 'jquery-2.2.4.min.js' | asset_url }}"></script>
  {% include_insales_scripts "common-js@v2" %}
{% endunless %}
`

---

## Что ещё можно улучшить

- **Баннеры в WebP** — перезагрузить изображения через InSales CMS в WebP формате (клиент не согласился). InSales CDN конвертирует на лету через `image_url` фильтр, но первый запрос медленный до прогрева кеша.
- **Рендер-блокирующие ресурсы** — theme.css + jQuery + common.v2 синхронные в head. Это потолок для данной платформы, убрать нельзя без поломки.
- **Неиспользуемый CSS (114 КиБ) и JS (791 КиБ)** — в основном из plugins.js и theme.css. Требует серьёзного рефакторинга всей темы.
- **Google Fonts (Istok Web)** — InSales подключает автоматически из настроек темы. Можно заменить на self-hosted или системный шрифт.

---

## Важные детали платформы InSales

- `shop_admin_bundle` — тяжёлый бандл платформы. При отключении (`not_need_shop_bundle: true`) нужно явно загрузить jQuery (он не экспортируется глобально из common.v2) и common-js@v2.
- `page.js` — инжектируется InSales автоматически, зависит от `window.$`. В оригинале грузился с `defer` вместе с shop_bundle. После отключения бандла грузится синхронно — нужен глобальный jQuery до него.
- `image_url` фильтр — работает в 3-м поколении шаблонов InSales. Синтаксис: `{{ image | image_url: width, format: 'webp', resizing_type: 'fit_width', quality: 90 }}`. Первый запрос медленный (CDN обрабатывает), последующие — из кеша.
- `webp_picture_tag` фильтр — тоже работает, генерирует полный `<picture>` тег, но без поддержки media-queries для responsive.
- Данные CRuX (полевые данные) в PageSpeed обновляются раз в 28 дней — не ждите мгновенного обновления цифр после изменений.

