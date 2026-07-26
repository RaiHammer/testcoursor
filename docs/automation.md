# Автоматизация (Фаза 6)

## Hooks — настроено

Файл `.cursor/hooks.json`:
- **subagentStop (programmer)** — напоминание запустить code-reviewer gate
- **stop** — напоминание сохранить артефакты и обновить strategy

## Git — инициализировать

```bash
cd "D:\Важное\Личный джарвис"
git init
git add .
git commit -m "Initial commit: ИИ-команда Личный джарвис"
```

## Cursor Automations — SEO-мониторинг (опционально)

Создайте в **Agents Window** через Automations:

| Поле | Значение |
|------|----------|
| **Название** | SEO-мониторинг danforge.ru |
| **Триггер** | Cron: каждый понедельник 9:00 |
| **Инструкция** | Провести краткий SEO-чек danforge.ru через browser. Сравнить с artifacts/2026-07-06-seo-audit/seo-audit.md. Если новые проблемы — записать в knowledge/danforge/content-backlog.md и уведомить владельца. |
| **Tools** | Browser MCP (если доступен в automation) |

> Automations с browser MCP требуют настройки в Cursor Dashboard. Используйте skill `automate` в Agents Window для создания.

## Рекомендуемый ритм

| Частота | Действие |
|---------|----------|
| Еженедельно | Проверка roadmap, 1 операционная задача |
| Раз в 2 месяца | Ретроспектива с Jarvis |
| По необходимости | expand-team для новых ролей |
