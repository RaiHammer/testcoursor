---
name: expand-team
description: Создаёт нового subagent для ИИ-команды после одобрения владельца. Use when Jarvis identifies a role gap, user approves new team member, or user asks to add a new agent like copywriter or marketer.
disable-model-invocation: true
---

# Expand Team

## Когда применять

- Повторяющиеся задачи без подходящей роли
- Владелец одобрил предложение Jarvis о новой роли
- Явный запрос: «создай агента-копирайтера»

## Процесс

1. **Предложение** (если инициатива Jarvis):
   - Имя роли (lowercase-hyphen)
   - Зачем нужна
   - Примеры задач (3–5)
   - Ждать одобрения владельца

2. **Создание** (после одобрения):
   - Файл `.cursor/agents/{name}.md` с frontmatter:
     ```yaml
     ---
     name: role-name
     description: Specific trigger description. Use proactively when...
     ---
     ```
   - System prompt: роль, workflow, output format, ограничения

3. **Обновить документацию:**
   - `AGENTS.md` — добавить строку в таблицу
   - `.cursor/rules/team-orchestration.mdc` — если нужна маршрутизация

4. **Сообщить владельцу:** роль добавлена, пример вызова

## Кандидаты (не создавать без запроса)

- `copywriter` — статьи, кейсы, тексты
- `marketer` — воронки, офферы, A/B
- `sales-assistant` — КП, follow-up
- `insales-expert` — Liquid, API inSales

## Именование

- Только lowercase и дефисы: `copywriter`, `insales-expert`
- Description — конкретный, с trigger terms, «use proactively»

## Skill reference

Следуй формату из Cursor subagent docs. Промпт < 500 строк, одна роль — одна задача.
