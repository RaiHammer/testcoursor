---
name: tilda-live-check
description: Check live danforge.ru and Kwork pages without Tilda code access. Use for SEO verification, post-publish checks, pricing/page drift after manual Tilda edits.
---

# Tilda Live Check

danforge.ru на Tilda — код недоступен. Проверяем **live URL**, не репозиторий.

## Когда применять

- После публикации страницы/статьи
- SEO-аудит danforge
- Сверка цен/текстов с `knowledge/danforge/products/*.md`
- Проверка Kwork ↔ danforge склейки

## Workflow

1. Прочитать эталон: `knowledge/danforge/products/{product}.md` или артефакт упаковки
2. Fetch live URL (WebFetch или browser MCP если доступен)
3. Сверить чеклист ниже
4. Результат: `artifacts/{task-id}/live-check.md` или обновить существующий `07-live-publish-check.md`

## Чеклист live-check

```markdown
# Live check: {URL}
**Дата:** YYYY-MM-DD
**Эталон:** knowledge/… или artifacts/…

| # | Проверка | Ожидание | Факт | OK |
|---|----------|----------|------|-----|
| 1 | Title / H1 | … | … | |
| 2 | Meta description | … | … | |
| 3 | Цены пакетов A/B/C | … | … | |
| 4 | CTA → Kwork URL | … | … | |
| 5 | JSON-LD Product (если модуль) | есть | … | |
| 6 | Мобильная вёрстка (визуально) | … | … | |
| 7 | Битые ссылки | 0 | … | |
```

## Инструменты (по приоритету)

1. **browser MCP** — если подключён (полный DOM, скрин)
2. **WebFetch** — title, текст, ссылки
3. **curl** — headers, redirects

## Расхождения

- **Критично** (цены, битый CTA) → эскалация владельцу, правка в Tilda вручную
- **Средне** (meta, alt) → SEO-рекомендация в артефакт
- Не править Tilda через Programmer — только инструкции Designer/SEO

## Типовые URL

- Danforge модули: `https://danforge.ru/services/modules/{slug}`
- Kwork: см. `knowledge/danforge/products/*.md`
