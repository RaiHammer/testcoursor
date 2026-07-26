# Diff summary для Code Reviewer — session 3

**Проект:** `projects/df_reviews_slider/`  
**Scope:** wizard manual, e2e 5–6, checklist, validate_manual_config

---

## Изменённые файлы

| Файл | Изменение |
|------|-----------|
| `cli/gui_ctk.py` | +`ManualWizardDialog`, кнопка «Ручной режим», `import io` |
| `cli/get_reviews.py` | +`validate_manual_config()` |
| `cli/tests/test_cli_yandex_only.py` | +2 теста manual validation |
| `widget/tests/fixtures/dual-source.html` | +2 секции fixture |
| `widget/tests/e2e/dual-source.spec.js` | +сценарии 5–6 |
| `widget/tests/source-tabs.test.js` | +DOM budget helpers |
| `templates/insales-widget-checklist.md` | v1.2.1 items |
| `artifacts/.../04-plan.md` | checkboxes session 3 |

---

## Ключевые решения

1. **Manual tier:** wizard генерирует файл в `output/`, клиент вставляет сниппет вручную; API не требуется.
2. **CLI internal:** инструкция в wizard явно указывает — CLI не для клиентов.
3. **E2E load-more:** `page.route('**/insales-more')` — mock AJAX, проверка lazy yandex.
4. **E2E layout:** проверка утечки DOM (yandex count, single root), не shell CSS class sync.

---

## Риски / замечания

- `ManualWizardDialog` — ~280 строк в gui_ctk.py; при росте вынести в `cli/gui/manual_wizard.py`.
- PyInstaller не настроен — только документирован smoke-план.
- Layout class sync при смене `data-layout` в editor — отдельный путь (watchVisibility), не покрыт class assertion в e2e.

---

## Тест-план для ревьюера

```bash
cd projects/df_reviews_slider/widget/tests
node settings.test.js && node settings-matrix.test.js && node settings-sync.test.js
node layouts.test.js && node pagination.test.js && node source-tabs.test.js
npm run test:e2e

cd ../cli
python -m unittest discover -s tests -p "test_*.py" -v
```

Ручной smoke (опц.): `start_ctk.bat` → «Ручной режим (без API)» → dry-run с demo URL.

---

## Вердикт программиста

Готово к ревью. Ожидается **APPROVED** или замечания по wizard UX / PyInstaller.
