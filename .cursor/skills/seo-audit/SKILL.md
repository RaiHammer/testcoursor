---
name: seo-audit
description: Чеклист SEO-аудита сайта через browser MCP — meta, headings, schema, Core Web Vitals, keywords. Use when seo-specialist audits danforge.ru or any live website.
disable-model-invocation: true
---

# SEO Audit

## Подготовка

1. Browser MCP: `browser_navigate` → URL
2. `browser_snapshot` — структура страницы
3. При необходимости `browser_take_screenshot`

## Чеклист on-page

### Meta
- [ ] Title: уникальный, 50–60 символов, ключевое слово
- [ ] Description: 150–160 символов, CTA
- [ ] Canonical (если видно)
- [ ] Open Graph / Twitter cards

### Заголовки
- [ ] Один H1 на страницу, с ключевым словом
- [ ] Логичная иерархия H2–H3
- [ ] Нет пропусков уровней (H1 → H3)

### Контент
- [ ] Ключевые слова inSales/ecommerce естественно в тексте
- [ ] Уникальный контент (не дубли)
- [ ] Внутренние ссылки на услуги/кейсы
- [ ] Alt у изображений

### Техническое
- [ ] HTTPS
- [ ] Mobile-friendly (viewport)
- [ ] Скорость загрузки (субъективно / CDP metrics)
- [ ] Schema.org (Organization, LocalBusiness, FAQ)

### Конверсия
- [ ] CTA «Хочу сайт» / «Заказать» видны
- [ ] Форма работает (не проверять submit без разрешения)
- [ ] Отзывы, портфолио, FAQ на месте

## Ключевые слова (danforge.ru)

| Приоритет | Ключевое слово |
|-----------|----------------|
| Высокий | разработка inSales, интернет-магазин inSales |
| Средний | миграция на inSales, виджеты inSales |
| Средний | техническая поддержка inSales |
| Низкий | inSales партнёр, создание магазина под ключ |

## Output

Сохрани отчёт в `artifacts/{task-id}/seo-audit.md`. Обнови `knowledge/danforge/competitors.md` при исследовании конкурентов.

## 5 улучшений (стандартный deliverable)

Минимум 5 конкретных рекомендаций с приоритетом и сложностью внедения в Tilda.
