# Справочник ИИ-команды

## Иерархия

```
Вы (владелец)
  └── Jarvis (ассистент, координатор)
        ├── Аналитик
        ├── Рецензент ТЗ
        ├── Архитектор
        ├── Ревьюер архитектуры
        ├── Планировщик
        ├── Ревьюер планов
        ├── Программист
        ├── Ревьюер кода
        ├── SEO-специалист
        └── Дизайнер
```

## Роли

| # | Agent | Файл | Назначение |
|---|-------|------|------------|
| 1 | `jarvis` | `.cursor/agents/jarvis.md` | Координатор, 3 режима, делегирование, расширение команды |
| 2 | `analyst` | `.cursor/agents/analyst.md` | Анализ требований, исследования, ретроспективы |
| 3 | `spec-reviewer` | `.cursor/agents/spec-reviewer.md` | Ревью ТЗ, gate перед архитектурой |
| 4 | `architect` | `.cursor/agents/architect.md` | Проектирование архитектуры, ADR |
| 5 | `arch-reviewer` | `.cursor/agents/arch-reviewer.md` | Ревью архитектуры, gate перед планированием |
| 6 | `planner` | `.cursor/agents/planner.md` | Декомпозиция задач, оценки |
| 7 | `plan-reviewer` | `.cursor/agents/plan-reviewer.md` | Ревью планов, gate перед разработкой |
| 8 | `programmer` | `.cursor/agents/programmer.md` | Разработка и тестирование |
| 9 | `code-reviewer` | `.cursor/agents/code-reviewer.md` | Ревью кода и отчётов |
| 10 | `seo-specialist` | `.cursor/agents/seo-specialist.md` | SEO, продвижение сайтов |
| 11 | `designer` | `.cursor/agents/designer.md` | Макеты, UI-идеи, Tilda-инструкции |

## Review gates

Рецензенты выдают вердикт: `APPROVED` или `NEEDS_REVISION`. Без `APPROVED` задача не переходит на следующий этап. Пропуск — только явная фраза владельца («пропустить gate: …»). См. `knowledge/owner-playbook.md`.

## Владелец

Памятка: [knowledge/owner-playbook.md](knowledge/owner-playbook.md) — как формулировать запросы, зоны ответственности, owner edit protocol.

## Skills (workflow)

| Skill | Назначение |
|-------|------------|
| `pipeline-handoff` | Переход между этапами конвейера |
| `owner-edit-protocol` | Правки владельца в админке inSales |
| `insales-widget-delivery` | DoD виджета перед публикацией |
| `bugfix-stop-rule` | Стоп после 2+ итераций багфикса |
| `tilda-live-check` | Проверка live danforge/Kwork |
| `review-gate` | Вердикты рецензентов |
| `analyze-requirements` | Чеклист аналитика |
| `decompose-tasks` | Декомпозиция планов |
| `seo-audit` | SEO-аудит |
| `strategic-planning` | Стратегические сессии |
| `retrospective` | Ретроспективы |
| `expand-team` | Новые роли |
| `create-spec` | Написание ТЗ |

## Конвейеры

**Полный (кодовые задачи > 1 час):**
Analyst → Spec Reviewer → Architect → Arch Reviewer → Planner → Plan Reviewer → Programmer → Code Reviewer

**Упрощённый (< 1 час):**
Analyst → Planner → Programmer → Code Reviewer

**Tilda / danforge.ru:**
Analyst → SEO / Designer (без Programmer)

**Стратегический:**
Jarvis → Analyst (исследование) → фиксация в `knowledge/strategy/`

**Ретроспективный:**
Jarvis → Analyst → Planner → Plan Reviewer → обновление `roadmap.md`

## Добавление новых ролей

Jarvis предлагает → вы одобряете → создаётся `.cursor/agents/{name}.md` → обновляются AGENTS.md и team-orchestration.mdc.

Кандидаты: копирайтер, маркетолог, sales-ассистент, insales-expert.
