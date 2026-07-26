# Jarvis: чеклист поставки gen-2 (theme-snippet)

**Проект:** df_quick_search  
**Пакет:** `widget-gen2/`  
**Версия логики:** v1.0.0 (копия gen-4 JS)  
**Дата:** 2026-07-23

## Конвейер

| Этап | Вердикт |
|------|---------|
| Analyst `01-analysis.md` | done |
| Architect `03-architecture.md` | APPROVED (arch-review) |
| Planner `04-plan.md` | APPROVED (plan-review) |
| Programmer `widget-gen2/` | done |
| Code Reviewer | APPROVED |

## Файлы пакета

- [x] `snippets/df_quick_search.liquid`
- [x] `media/df_quick_search.js` (= `widget/snippet.js`)
- [x] `media/df_quick_search.css` (+ critical overlay)
- [x] `media/df_quick_search.scss`
- [x] `config/settings_fieldset.html` (21 поле)
- [x] `config/settings_data.keys.json`
- [x] `patches/layouts.layout.include.liquid.txt`
- [x] `docs/install.md` + клиентский чеклист
- [x] `widget-gen2/README.md`
- [x] Root README: primary gen-2 = `widget-gen2/`
- [x] `widget/` gen-4 не изменён
- [x] Unit: settings / fetch / categories — exit 0

## HTML / data-* (контракт)

- [x] Паритет имён `data-*` с gen-4 (code-review)
- [x] Checkbox → `'true'`/`'false'` через `settings.df_qs_* == '1'`
- [x] Строки с `| escape`
- [ ] **Владелец:** DevTools на пилоте — один `[data-df-quick-search-root]`, assets 200

## Smoke на магазине (владелец)

- [ ] S1–S6 из `widget-gen2/docs/install.md` / план §5.2
- [ ] Клик `.header_search` → панель; `enabled` OFF → нет перехвата

## Не primary

`widget/info.gen2.json` — запасной SimpleWidget, не основной продукт gen-2.
