# -*- coding: utf-8 -*-
from pathlib import Path

OLD = "{% assign df_qs_locale = language.locale | default: 'ru' | downcase %}"
NEW = """{% assign df_qs_locale_raw = language.locale | default: 'ru' | downcase %}
{% assign df_qs_locale = 'ru' %}
{% if df_qs_locale_raw == 'en' or df_qs_locale_raw contains 'en-' or df_qs_locale_raw contains 'en_' %}
  {% assign df_qs_locale = 'en' %}
{% else %}
  {% assign df_qs_locale = df_qs_locale_raw %}
{% endif %}"""

for path in [
    Path(r"D:\Важное\Личный джарвис\projects\df_quick_search\widget\snippet.liquid"),
    Path(r"D:\Важное\Личный джарвис\projects\df_quick_search\widget-gen2\snippets\df_quick_search.liquid"),
]:
    t = path.read_text(encoding="utf-8")
    if OLD not in t:
        print("missing", path)
        continue
    path.write_text(t.replace(OLD, NEW, 1), encoding="utf-8")
    print("fixed", path.name)

install = Path(r"D:\Важное\Личный джарвис\projects\df_quick_search\widget-gen2\docs\install.md")
it = install.read_text(encoding="utf-8")
changed = False
if "liquid без изменений" in it:
    it = it.replace("liquid без изменений", "liquid: panel/locale + data-ui-locale")
    changed = True
# Ensure v1.1 re-upload list is clear near top version mentions
if "df_quick_search.liquid" not in it.split("v1.1.0", 1)[-1][:800] if "v1.1.0" in it else True:
    note = (
        "\n\n## v1.1.0 re-upload (gen-2)\n"
        "- `media/df_quick_search.js`\n"
        "- `snippets/df_quick_search.liquid` (locale panel strings + `data-ui-locale`; critical CSS unchanged)\n"
    )
    if "## v1.1.0 re-upload" not in it:
        it = it.rstrip() + note
        changed = True
if changed:
    install.write_text(it, encoding="utf-8")
    print("install updated")
else:
    print("install unchanged")
