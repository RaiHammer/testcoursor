# Визуальные референсы: оболочки GUI для get-reviews

**Дата:** 2026-07-11  
**Автор:** Analyst + Designer  
**Для:** выбор направления редизайна CLI (п. 2)

> Цель — посмотреть глазами, как может выглядеть и ощущаться программа. Ниже ссылки на **живые демо**, скриншоты и документацию.

---

## 1. CustomTkinter — «быстрый апгрейд» текущего Tkinter

**Что это:** тот же Python + desktop, но современные кнопки, тёмная тема, нормальные поля.

| Ресурс | Ссылка |
|--------|--------|
| Официальный сайт + скриншоты | https://customtkinter.tomschimansky.com/ |
| GitHub (README с GIF) | https://github.com/TomSchimansky/CustomTkinter |
| Примеры виджетов | https://github.com/TomSchimansky/CustomTkinter/wiki/CTkWidgets |

**Ощущение:** похоже на современное desktop-приложение (Notion/VS Code lite), не «утилита из 2005».

**Для DanForge:** левая панель клиентов + карточки настроек + журнал внизу — за 1–2 дня можно получить заметный прирост.

---

## 2. ttkbootstrap — Bootstrap-стиль для Tkinter

| Ресурс | Ссылка |
|--------|--------|
| Демо-галерея тем | https://ttkbootstrap.readthedocs.io/en/latest/gallery/index.html |
| Тема «darkly» (тёмная) | https://ttkbootstrap.readthedocs.io/en/latest/themes/darkly.html |
| Тема «flatly» (светлая) | https://ttkbootstrap.readthedocs.io/en/latest/themes/flatly.html |

**Ощущение:** веб-админка, но в native-окне Windows.

---

## 3. PySide6 / Qt — «серьёзный desktop»

| Ресурс | Ссылка |
|--------|--------|
| Qt Gallery (официальные примеры UI) | https://doc.qt.io/qt-6/qtexamples.html |
| Qt Widget Gallery | https://doc.qt.io/qt-6/gallery.html |
| PySide6 примеры | https://doc.qt.io/qtforpython-6/examples/index.html |

**Ощущение:** как Spotify Desktop, Telegram Desktop, профессиональный софт.

**Минус:** дольше разработка, но потолок дизайна высокий.

---

## 4. Web local (FastAPI + браузер) — рекомендация для бренда DanForge

**Что это:** `start.bat` → открывается `http://localhost:8787` с красивым дашбордом.

| Ресурс | Ссылка |
|--------|--------|
| FastAPI Admin UI (пример CRUD) | https://github.com/aminalaee/sqladmin (скрины в README) |
| Tabler — бесплатный admin template | https://tabler.io/admin-template |
| Tabler preview (живой) | https://preview.tabler.io/ |
| Tabler dashboard demo | https://preview.tabler.io/dashboard.html |

**Ощущение:** SaaS-панель, как у сервисов аналитики. Можно в цветах danforge.ru.

**Плюс для вас:** тот же HTML/CSS, что на лендинге — единый бренд.

---

## 5. Streamlit — максимально быстрый прототип

| Ресурс | Ссылка |
|--------|--------|
| Галерея приложений | https://streamlit.io/gallery |
| Live demo «Sales dashboard» | https://sales-dashboard.streamlit.app/ |
| Документация с примерами | https://docs.streamlit.io/get-started/tutorials |

**Ощущение:** data-science панель, шаблонно, но за 1 день можно кликабельный MVP.

**Минус:** сложно сделать «вау» и уникальный бренд.

---

## 6. Flet — Material Design на Python

| Ресурс | Ссылка |
|--------|--------|
| Официальный сайт + демо | https://flet.dev/ |
| Gallery controls | https://gallery.flet.dev/ |
| GitHub examples | https://github.com/flet-dev/examples |

**Ощущение:** как Android/Material app на десктопе. Flutter-под капотом.

---

## 7. NiceGUI — Python → web UI в одном процессе

| Ресурс | Ссылка |
|--------|--------|
| Официальный сайт | https://nicegui.io/ |
| Документация + live examples | https://nicegui.io/documentation |

**Ощущение:** между Streamlit и полноценным web — аккуратные формы, таблицы, логи.

---

## 8. Tauri + Web frontend — лёгкий «app» без тяжёлого Electron

| Ресурс | Ссылка |
|--------|--------|
| Tauri showcase | https://tauri.app/showcase |
| Примеры приложений | https://github.com/tauri-apps/awesome-tauri |

**Ощущение:** нативное окно + красивый web внутри, размер exe ~5–15 MB (vs Electron 150+ MB).

---

## 9. Electron — тяжёлый, но эталон «web как app»

| Ресурс | Ссылка |
|--------|--------|
| Notion (пример Electron-app) | https://www.notion.so/ |
| VS Code (Electron) | https://code.visualstudio.com/ |

**Для DanForge:** избыточен, но если нужен «как Notion» — это референс класса.

---

## Сравнение «посмотреть за 15 минут»

Рекомендуемый порядок просмотра:

1. **Tabler preview** — https://preview.tabler.io/dashboard.html — если нравится, берём web local.
2. **CustomTkinter сайт** — https://customtkinter.tomschimansky.com/ — если нужен exe без браузера.
3. **Flet gallery** — https://gallery.flet.dev/ — компромисс desktop + современность.
4. **Streamlit gallery** — https://streamlit.io/gallery — только как «черновик за день».

---

## Матрица выбора (кратко)

| Вариант | Ссылка для решения | exe | Бренд DanForge | Срок |
|---------|-------------------|-----|----------------|------|
| CustomTkinter | customtkinter.tomschimansky.com | ✅ | ★★★ | 1–2 дня |
| Web + Tabler | preview.tabler.io | bat | ★★★★★ | 1–2 нед |
| Flet | gallery.flet.dev | ✅ | ★★★★ | 3–5 дней |
| Qt | doc.qt.io/gallery | ✅ | ★★★★ | 2–4 нед |
| Streamlit | streamlit.io/gallery | bat | ★★ | 1–3 дня |

---

## Что отметить при просмотре

- Нравится ли **тёмная** или **светлая** тема?
- Нужна ли **боковая навигация** (клиенты) или **вкладки**?
- Журнал: внизу как сейчас или отдельная вкладка «История»?
- Кнопки действий: одна панель или wizard «Шаг 1 → 2 → 3»?

После просмотра напишите 2–3 ссылки, которые зашли — **Designer** сделает wireframe, **Planner** оценит спринт.
