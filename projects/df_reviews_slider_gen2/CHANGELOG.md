# CHANGELOG — df_reviews_slider_gen2

## v0.1.1 — Swiper 3 compat (2026-07-20)

- `snippet.js`: `getSwiperMajorVersion()`, `buildSwiperConfig()`, safe `destroySwiper()` — dual API v3 / v8+
- Конфиг v3 для gen-2 legacy-тем (nivona `insales.ui.swiper.js` **3.4.2**): `nextButton`/`prevButton`, `paginationClickable`, autoplay как delay
- Конфиг v8+ без изменений (`navigation`, `rewind`, `watchOverflow`, `pauseOnMouseEnter`)
- Разметка слайдера: классы `swiper-container` + `swiper`
- SCSS: опциональная обёртка `.section-df-reviews` для Bootstrap-тем
- Документ `docs/nivona-install.md` — hybrid delivery для gen-2 без widget zones

## v0.1.0 — MVP scaffold (2026-07-20)

- Проект `projects/df_reviews_slider_gen2/`, handle `danforge_reviews_slider_g2`
- `generation: 2` в `info.json`
- Yandex-only: `{% include 'danforge_reviews_yandex' %}`
- Макеты: **slider** + **list**
- Настройки: title, accent, limits, min_rating, hide_date/source, text_lines, autoplay, arrows
- Упрощённые `snippet.js` / `snippet.scss` (без InSales, dual-source, masonry)
- Общий CLI-сниппет с gen-4

## Planned

- Smoke на gen-2 пилоте
- Grid-макет (опционально)
- Dist zip + чеклист gen-2
