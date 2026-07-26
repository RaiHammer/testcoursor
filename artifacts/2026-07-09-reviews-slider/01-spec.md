# ТЗ: Слайдер отзывов inSales + Яндекс (MVP)

**Task ID:** 2026-07-09-reviews-slider  
**Handle:** `danforge_reviews_slider`  
**Статус:** упаковка завершена

---

## Цель

Слайдер на главной магазина с отзывами о товарах (inSales) и о компании (Яндекс). Обновление без постоянного сервера — CLI на ПК исполнителя.

---

## Архитектура

```
┌─────────────────┐     ┌──────────────────┐
│  get_reviews.py │────▶│ danforge_reviews │
│  (ваш ПК)       │     │ _slides.liquid   │
└────────┬────────┘     └────────┬─────────┘
         │                       │
         ▼                       ▼
  inSales API              Тема магазина
  Яндекс org URL                │
                                ▼
                    ┌───────────────────────┐
                    │ danforge_reviews_     │
                    │ slider (виджет)       │
                    └───────────────────────┘
```

---

## Компоненты

| # | Комponent | Путь | Статус |
|---|-----------|------|--------|
| 1 | Виджет слайдера | `widget/` | ✅ |
| 2 | CLI генератор | `cli/get_reviews.py` | ✅ |
| 3 | Конфиг | `cli/config.example.json` | ✅ |
| 4 | Demo output | `output/` | ✅ |

---

## Функциональные требования

### CLI
- [x] GET /admin/reviews.json, только published
- [x] Парсинг Яндекс org URL
- [x] Fallback: yandex_reviews_file (JSON)
- [x] Случайный срез sample_count
- [x] Смешивание insales + yandex (insales_ratio)
- [x] Генерация Liquid-слайдов
- [x] Кэш reviews_cache.json
- [x] Upload сниппета `-u`
- [ ] Загрузка аватаров в Files (v1.1)

### Виджет
- [x] Swiper, 1 слайд, pagination
- [x] Аватар / placeholder, звёзды, текст, источник
- [x] Настройки: заголовок, CTA, autoplay
- [x] Пустое состояние до генерации

---

## Нефункциональные

- Без VPS для клиента
- Брендинг DanForge в коде
- Python 3.10+, requests

---

## Пилот

Чеклист: `02-pilot-checklist.md`

---

## v1.1 (после пилота)

- Надёжный парсер Яндекс (Playwright)
- Upload аватаров в Files
- Kwork + danforge страница
- Cron-инструкция / услуга обновления
