# Политика языка ИИ-команды DanForge

**Решение владельца:** 2026-07-27  
**Правило Cursor:** `.cursor/rules/russian-language.mdc` (always apply)

## Принцип

По возможности **всё на русском**: то, что видит владелец, попадает в git-историю или уходит клиенту.  
Код и технические идентификаторы — на английском, как в экосистеме inSales и веб-разработки.

## Кто за что отвечает

| Роль | На русском |
|------|------------|
| Jarvis | Ответы владельцу, координация, итоги сессий |
| Analyst | `01-analysis.md`, исследования, ретро |
| Spec / Plan / Code reviewers | `reviews/*.md`, комментарии к доработкам |
| Architect | `03-architecture.md`, ADR в `knowledge/strategy/decisions/` |
| Planner | `04-plan.md` |
| Programmer | CHANGELOG, README, labels в настройках виджета; **commit message** |
| SEO / Designer | отчёты, инструкции для ручного внесения на Tilda |

## Git

### Коммиты — только на русском

- Subject (первая строка): что сделано, понятно без контекста чата
- Body (если нужен): зачем, не дублировать diff построчно
- Версию продукта в subject можно оставить: `df_quick_search v1.2.1: …`

### Pull requests

- Title и Summary на русском
- Test plan — чеклист на русском

## Документация проектов

- `CHANGELOG.md` — секции и пункты на русском; версии и имена файлов — как есть
- `README.md`, `FEATURES.md`, `install.md` — русский
- Комментарии в Liquid для владельца магазина — русский
- JSDoc в виджетах — кратко, по необходимости; приоритет — читаемый код

## Исключения (английский нормален)

- Исходный код JS/SCSS/Liquid (идентификаторы)
- Названия веток с conventional commits (`feature/…`) — по желанию владельца; **сообщения коммитов всё равно на русском**
- Gate-метки `APPROVED` / `NEEDS_REVISION`
- Цитаты ошибок API, URL, JSON-ключи платформы

## Примеры

**Хороший коммит:**

```
df_quick_search v1.2.0: слайдер фото и оптимизация превью.

Crossfade по умолчанию; расширенный слайдер до 4 фото по настройке.
```

**Плохой коммит:**

```
df_quick_search v1.2.1: configurable image URL quality in admin.
```

**Хороший label настройки:**

```json
"label": "Качество фото в поиске",
"help": "Какой размер URL брать из inSales. Авто — баланс скорости и чёткости."
```

## Связанные документы

- [owner-playbook.md](../owner-playbook.md) — как работать с командой
- [team-response-format.md](../team-response-format.md) — формат ответов Jarvis
- `.cursor/rules/owner-interaction.mdc` — эскалации и gates
