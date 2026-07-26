#!/usr/bin/env python3
"""DanForge get-reviews — CustomTkinter GUI (yandex-only, internal)."""
from __future__ import annotations

from typing import Callable
import io
import json
import os
import sys
import threading
from pathlib import Path
import tkinter as tk
from tkinter import filedialog, messagebox, simpledialog

import clients_manager as cm
import get_reviews as core

CLI_DIR = Path(__file__).parent

# DanForge brand tokens (knowledge/danforge site style)
DF_BG = "#212528"
DF_PANEL = "#2a2f33"
DF_ACCENT = "#fba064"
DF_TEXT = "#e8e8e8"
DF_MUTED = "#9aa0a6"
DF_MANUAL_BG = "#352a22"
DF_MANUAL_STRIPE = "#c8864a"
DF_API_STRIPE = "#5b9bd5"
DF_SELECTED = "#343a40"

MANUAL_INSERT_INSTRUCTION = """Вставка сниппета в тему inSales (ручной режим):

1. Админка магазина → Дизайн → Тема → Snippets (Сниппеты)
2. Создайте или откройте сниппет danforge_reviews_yandex.liquid
3. Вставьте содержимое из буфера (кнопка «Скопировать сниппет»)
4. Сохраните сниппет и обновите тему
5. На главной подключите виджет «Слайдер отзывов DanForge»
6. В настройках виджета при необходимости включите вкладки источников

CLI DanForge — только для внутреннего использования, клиентам не передаётся."""


def _widget_select_all(widget: tk.Misc) -> None:
    if isinstance(widget, tk.Text):
        widget.tag_add("sel", "1.0", "end-1c")
        widget.mark_set("insert", "end-1c")
    elif isinstance(widget, tk.Entry):
        widget.select_range(0, "end")
        widget.icursor("end")


def _is_edit_key(event: tk.Event, latin: str, cyrillic: str) -> bool:
    """Сопоставление по keycode (Windows) и keysym (RU/EN раскладки)."""
    if event.keycode in {
        ord(latin.upper()),
        ord(latin.lower()),
    }:
        return True
    return event.keysym.lower() in (latin.lower(), cyrillic.lower())


def register_ctk_entry(ctk_entry) -> None:
    inner = ctk_entry._entry

    def bind_virtual(sequences: tuple[str, ...], virtual: str) -> None:
        def handler(_event=None):
            inner.event_generate(virtual)
            return "break"

        for seq in sequences:
            ctk_entry.bind(seq, handler)

    bind_virtual(("<Control-c>", "<Control-C>", "<Control-Insert>"), "<<Copy>>")
    bind_virtual(("<Control-v>", "<Control-V>", "<Shift-Insert>"), "<<Paste>>")
    bind_virtual(("<Control-x>", "<Control-X>"), "<<Cut>>")

    def select_all(_event=None):
        _widget_select_all(inner)
        return "break"

    ctk_entry.bind("<Control-a>", select_all)
    ctk_entry.bind("<Control-A>", select_all)

    def on_keypress(event: tk.Event):
        if not (event.state & 0x0004):
            return None
        if _is_edit_key(event, "c", "cyrillic_es"):
            inner.event_generate("<<Copy>>")
            return "break"
        if _is_edit_key(event, "v", "cyrillic_ve"):
            inner.event_generate("<<Paste>>")
            return "break"
        if _is_edit_key(event, "x", "cyrillic_che"):
            inner.event_generate("<<Cut>>")
            return "break"
        if _is_edit_key(event, "a", "cyrillic_ef"):
            _widget_select_all(inner)
            return "break"
        return None

    ctk_entry.bind("<KeyPress>", on_keypress)


def register_ctk_textbox(ctk_textbox) -> None:
    inner = ctk_textbox._textbox

    def bind_virtual(sequences: tuple[str, ...], virtual: str) -> None:
        def handler(_event=None):
            inner.event_generate(virtual)
            return "break"

        for seq in sequences:
            ctk_textbox.bind(seq, handler)

    bind_virtual(("<Control-c>", "<Control-C>", "<Control-Insert>"), "<<Copy>>")
    bind_virtual(("<Control-v>", "<Control-V>", "<Shift-Insert>"), "<<Paste>>")
    bind_virtual(("<Control-x>", "<Control-X>"), "<<Cut>>")

    def select_all(_event=None):
        _widget_select_all(inner)
        return "break"

    ctk_textbox.bind("<Control-a>", select_all)
    ctk_textbox.bind("<Control-A>", select_all)

    def on_keypress(event: tk.Event):
        if not (event.state & 0x0004):
            return None
        if _is_edit_key(event, "c", "cyrillic_es"):
            inner.event_generate("<<Copy>>")
            return "break"
        if _is_edit_key(event, "v", "cyrillic_ve"):
            inner.event_generate("<<Paste>>")
            return "break"
        if _is_edit_key(event, "x", "cyrillic_che"):
            inner.event_generate("<<Cut>>")
            return "break"
        if _is_edit_key(event, "a", "cyrillic_ef"):
            _widget_select_all(inner)
            return "break"
        return None

    ctk_textbox.bind("<KeyPress>", on_keypress)


class ManualWizardDialog:
    """Мастер «только файл» для клиентов без API inSales."""

    def __init__(self, app: "ReviewsCtkApp") -> None:
        self.app = app
        self.ctk = app.ctk
        self.step = 0
        self.slug: str | None = None
        self.config_path: Path | None = None
        self.generated = False

        self.win = self.ctk.CTkToplevel(app.root)
        self.win.title("Ручной режим (без API)")
        self.win.geometry("620x520")
        self.win.minsize(520, 440)
        self.win.configure(fg_color=DF_BG)
        self.win.transient(app.root)
        self.win.grab_set()

        header = self.ctk.CTkFrame(self.win, fg_color=DF_PANEL, corner_radius=0)
        header.pack(fill="x")
        self.ctk.CTkLabel(
            header,
            text="Ручной режим — только файл",
            font=self.ctk.CTkFont(size=16, weight="bold"),
            text_color=DF_ACCENT,
        ).pack(anchor="w", padx=16, pady=(12, 4))
        self.step_label = self.ctk.CTkLabel(
            header,
            text="",
            font=self.ctk.CTkFont(size=13),
            text_color=DF_MUTED,
        )
        self.step_label.pack(anchor="w", padx=16, pady=(0, 12))

        self.body = self.ctk.CTkScrollableFrame(self.win, fg_color=DF_BG)
        self.body.pack(fill="both", expand=True, padx=16, pady=8)

        footer = self.ctk.CTkFrame(self.win, fg_color=DF_PANEL, corner_radius=0)
        footer.pack(fill="x")
        btn_row = self.ctk.CTkFrame(footer, fg_color=DF_PANEL)
        btn_row.pack(fill="x", padx=16, pady=12)
        self.btn_back = self.ctk.CTkButton(btn_row, text="← Назад", width=100, command=self._back)
        self.btn_back.pack(side="left", padx=(0, 8))
        self.btn_next = self.ctk.CTkButton(
            btn_row,
            text="Далее →",
            width=120,
            fg_color=DF_ACCENT,
            hover_color="#e08f50",
            command=self._next,
        )
        self.btn_next.pack(side="left", padx=(0, 8))
        self.btn_close = self.ctk.CTkButton(btn_row, text="Закрыть", width=100, command=self.win.destroy)
        self.btn_close.pack(side="right")

        self.vars = {
            "client_name": self.ctk.StringVar(value=""),
            "existing_slug": self.ctk.StringVar(value=""),
            "yandex_org_url": self.ctk.StringVar(value=""),
            "yandex_reviews_file": self.ctk.StringVar(value=""),
            "yandex_limit": self.ctk.StringVar(value="20"),
            "min_rating": self.ctk.StringVar(value="4"),
        }
        self.dry_run_var = self.ctk.BooleanVar(value=False)
        self.playwright_var = self.ctk.BooleanVar(value=False)

        self._render_step()

    def _clear_body(self) -> None:
        for child in self.body.winfo_children():
            child.destroy()

    def _render_step(self) -> None:
        self._clear_body()
        titles = [
            "Шаг 1 из 4 — Клиент",
            "Шаг 2 из 4 — Яндекс",
            "Шаг 3 из 4 — Генерация",
            "Шаг 4 из 4 — Готово",
        ]
        self.step_label.configure(text=titles[self.step])
        self.btn_back.configure(state="normal" if self.step > 0 and self.step < 3 else "disabled")

        if self.step == 0:
            self._step_client()
        elif self.step == 1:
            self._step_yandex()
        elif self.step == 2:
            self._step_generate()
        else:
            self._step_done()

        if self.step == 3:
            self.btn_next.configure(state="disabled", text="Готово")
        elif self.step == 2:
            self.btn_next.configure(state="normal", text="Сгенерировать")
        else:
            self.btn_next.configure(state="normal", text="Далее →")

    def _step_client(self) -> None:
        ctk = self.ctk
        ctk.CTkLabel(
            self.body,
            text="Выберите существующего клиента или введите название нового.\n"
            "API-ключ inSales не требуется — файл вставляется вручную.",
            text_color=DF_TEXT,
            justify="left",
        ).pack(anchor="w", pady=(0, 12))

        clients = cm.list_clients()
        labels = ["— Новый клиент —"] + [f"{c['name']} ({c['slug']})" for c in clients]
        self._client_labels = labels
        self._client_slugs = [""] + [c["slug"] for c in clients]

        ctk.CTkLabel(self.body, text="Клиент", text_color=DF_MUTED).pack(anchor="w")
        self.client_combo = ctk.CTkComboBox(
            self.body,
            values=labels,
            variable=self.vars["existing_slug"],
            width=400,
            command=self._on_client_pick,
        )
        self.client_combo.pack(anchor="w", pady=(4, 12))
        if labels:
            self.client_combo.set(labels[0])

        ctk.CTkLabel(self.body, text="Название (для нового)", text_color=DF_MUTED).pack(anchor="w")
        name_entry = ctk.CTkEntry(self.body, textvariable=self.vars["client_name"], width=400)
        name_entry.pack(anchor="w", pady=(4, 0))
        register_ctk_entry(name_entry)

    def _on_client_pick(self, _choice: str) -> None:
        idx = self._client_labels.index(_choice) if _choice in self._client_labels else 0
        slug = self._client_slugs[idx]
        if not slug:
            return
        path = cm.client_config_path(slug)
        if not path.exists():
            return
        cfg = core.load_config(path)
        self.vars["client_name"].set(cfg.client_name or slug)
        self.vars["yandex_org_url"].set(cfg.yandex_org_url or "")
        self.vars["yandex_reviews_file"].set(cfg.yandex_reviews_file or "")
        limit = cfg.yandex_limit if cfg.yandex_limit else cfg.sample_count
        self.vars["yandex_limit"].set(str(limit))
        self.vars["min_rating"].set(str(cfg.min_rating))

    def _step_yandex(self) -> None:
        ctk = self.ctk
        ctk.CTkLabel(
            self.body,
            text="Укажите источник отзывов Яндекса. Достаточно URL или JSON-файла.",
            text_color=DF_TEXT,
            justify="left",
        ).pack(anchor="w", pady=(0, 12))

        for label, key, browse in [
            ("URL Яндекс (Карты или Магазин)", "yandex_org_url", False),
            ("Файл отзывов (опц.)", "yandex_reviews_file", True),
            ("Yandex limit (0 = все)", "yandex_limit", False),
            ("Мин. рейтинг (1–5)", "min_rating", False),
        ]:
            row = ctk.CTkFrame(self.body, fg_color=DF_BG)
            row.pack(fill="x", pady=4)
            ctk.CTkLabel(row, text=label, width=200, anchor="w", text_color=DF_MUTED).pack(side="left")
            field = ctk.CTkEntry(row, textvariable=self.vars[key], width=280)
            field.pack(side="left", padx=(8, 0))
            register_ctk_entry(field)
            if browse:
                ctk.CTkButton(row, text="...", width=36, command=self._browse_yandex).pack(
                    side="left", padx=(6, 0)
                )

    def _step_generate(self) -> None:
        ctk = self.ctk
        ctk.CTkLabel(
            self.body,
            text="Сниппет будет сохранён в output/ клиента. Загрузка в тему через API не выполняется.",
            text_color=DF_TEXT,
            justify="left",
        ).pack(anchor="w", pady=(0, 12))

        opts = ctk.CTkFrame(self.body, fg_color=DF_BG)
        opts.pack(anchor="w", pady=4)
        ctk.CTkCheckBox(opts, text="Dry-run (без записи файлов)", variable=self.dry_run_var).pack(
            anchor="w", pady=2
        )
        ctk.CTkCheckBox(opts, text="Playwright (если парсер не нашёл отзывы)", variable=self.playwright_var).pack(
            anchor="w", pady=2
        )

        ctk.CTkLabel(
            self.body,
            text="Нажмите «Сгенерировать» — API inSales не проверяется.",
            text_color=DF_MUTED,
        ).pack(anchor="w", pady=(12, 0))

    def _step_done(self) -> None:
        ctk = self.ctk
        if self.generated:
            msg = "Файл danforge_reviews_yandex.liquid создан в папке output клиента."
        elif self.dry_run_var.get():
            msg = "Dry-run завершён — файлы не записаны. Снимите галочку Dry-run и повторите."
        else:
            msg = "Генерация завершена."

        ctk.CTkLabel(self.body, text=msg, text_color=DF_ACCENT, font=ctk.CTkFont(weight="bold")).pack(
            anchor="w", pady=(0, 12)
        )

        ctk.CTkLabel(
            self.body,
            text=MANUAL_INSERT_INSTRUCTION,
            text_color=DF_TEXT,
            justify="left",
            wraplength=540,
        ).pack(anchor="w", pady=(0, 12))

        ctk.CTkButton(
            self.body,
            text="Скопировать сниппет",
            fg_color=DF_ACCENT,
            hover_color="#e08f50",
            command=self._copy_snippet,
        ).pack(anchor="w", pady=(0, 8))
        ctk.CTkButton(self.body, text="Открыть output", command=self._open_output).pack(anchor="w")

    def _browse_yandex(self) -> None:
        path = filedialog.askopenfilename(
            title="JSON с отзывами Яндекса",
            filetypes=[("JSON", "*.json"), ("Все файлы", "*.*")],
        )
        if path:
            self.vars["yandex_reviews_file"].set(path)

    def _cfg_from_wizard(self) -> core.Config:
        name = self.vars["client_name"].get().strip()
        slug = self.slug or cm.slugify(name or "manual-client")
        out = str(cm.client_output_dir(slug))
        limit = int(self.vars["yandex_limit"].get() or 0)
        yandex_file = self.vars["yandex_reviews_file"].get().strip() or None
        return core.Config(
            client_name=name or slug,
            shop=f"{slug}.manual.local",
            api_key="manual-no-api",
            password="manual-no-api",
            yandex_org_url=self.vars["yandex_org_url"].get().strip() or None,
            yandex_reviews_file=yandex_file,
            yandex_limit=limit,
            sample_count=limit,
            min_rating=int(self.vars["min_rating"].get() or 1),
            source_mode="yandex",
            output_dir=out,
        )

    def _ensure_client(self) -> Path:
        cfg = self._cfg_from_wizard()
        slug = self.slug or cm.slugify(cfg.client_name)
        path = cm.client_config_path(slug)
        if not path.exists():
            example = json.loads((CLI_DIR / "config.example.json").read_text(encoding="utf-8"))
            example.update(core.config_to_dict(cfg))
            example["client_name"] = cfg.client_name
            example["shop"] = cfg.shop
            example["api_key"] = "manual-no-api"
            example["password"] = "manual-no-api"
            example["client_mode"] = "manual"
            example["upload_to_theme"] = False
            cm.create_client(slug, example)
        self.slug = slug
        self.config_path = path
        core.save_config(cfg, path)
        return path

    def _back(self) -> None:
        if self.step > 0 and self.step < 3:
            self.step -= 1
            self._render_step()

    def _next(self) -> None:
        if self.step == 0:
            name = self.vars["client_name"].get().strip()
            pick = self.vars["existing_slug"].get()
            if pick and pick != "— Новый клиент —" and pick in getattr(self, "_client_labels", []):
                idx = self._client_labels.index(pick)
                slug = self._client_slugs[idx]
                if slug:
                    self.slug = slug
            elif not name:
                messagebox.showwarning("DanForge", "Введите название клиента или выберите из списка")
                return
            self.step = 1
            self._render_step()
            return

        if self.step == 1:
            url = self.vars["yandex_org_url"].get().strip()
            yfile = self.vars["yandex_reviews_file"].get().strip()
            if not url and not yfile:
                messagebox.showwarning(
                    "DanForge", "Укажите URL Яндекса или выберите JSON-файл с отзывами"
                )
                return
            self.step = 2
            self._render_step()
            return

        if self.step == 2:
            self._run_generate()
            return

    def _run_generate(self) -> None:
        try:
            path = self._ensure_client()
            cfg = self._cfg_from_wizard()
            core.validate_manual_config(cfg, path)
            self.app._set_busy(True)

            def worker() -> None:
                stdout = sys.stdout
                writer = QueueWriter(lambda msg: self.app.root.after(0, self.app._append_log, msg))
                sys.stdout = writer
                try:
                    core.run(
                        cfg,
                        upload=False,
                        use_playwright=self.playwright_var.get(),
                        dry_run=self.dry_run_var.get(),
                        log_slug=self.slug,
                        progress_callback=self.app._playwright_progress
                        if self.playwright_var.get()
                        else None,
                    )
                    writer.flush()
                    self.generated = not self.dry_run_var.get()
                except SystemExit as exc:
                    writer.flush()
                    self.app.root.after(0, self.app._append_log, f"Остановлено: {exc}")
                    self.app.root.after(
                        0, lambda: messagebox.showerror("Ошибка", str(exc), parent=self.win)
                    )
                except Exception as exc:
                    writer.flush()
                    self.app.root.after(
                        0, lambda: messagebox.showerror("Ошибка", str(exc), parent=self.win)
                    )
                finally:
                    sys.stdout = stdout
                    self.app.root.after(0, self.app._set_busy, False)
                    self.app.root.after(0, self.app._refresh_client_list)
                    if self.slug:
                        self.app.root.after(0, lambda: self.app._select_client(self.slug))
                    self.step = 3
                    self.app.root.after(0, self._render_step)

            threading.Thread(target=worker, daemon=True).start()
        except Exception as exc:
            self.app._set_busy(False)
            messagebox.showerror("Ошибка", str(exc), parent=self.win)

    def _copy_snippet(self) -> None:
        if not self.slug:
            return
        liquid = cm.client_output_dir(self.slug) / "danforge_reviews_yandex.liquid"
        if not liquid.exists():
            messagebox.showwarning("DanForge", "Сначала сгенерируйте сниппет", parent=self.win)
            return
        text = liquid.read_text(encoding="utf-8")
        self.win.clipboard_clear()
        self.win.clipboard_append(text)
        messagebox.showinfo("DanForge", "Сниппет скопирован в буфер обмена", parent=self.win)

    def _open_output(self) -> None:
        if not self.slug:
            return
        out = cm.client_output_dir(self.slug)
        out.mkdir(parents=True, exist_ok=True)
        os.startfile(out)

    def _append_log(self, text: str) -> None:
        self.app._append_log(text)


class QueueWriter(io.TextIOBase):
    def __init__(self, append_fn) -> None:
        self.append_fn = append_fn
        self._buffer = ""

    def write(self, text: str) -> int:
        if not text:
            return 0
        self._buffer += text
        while "\n" in self._buffer:
            line, self._buffer = self._buffer.split("\n", 1)
            self.append_fn(line)
        return len(text)

    def flush(self) -> None:
        if self._buffer:
            self.append_fn(self._buffer)
            self._buffer = ""


class ReviewsCtkApp:
    def __init__(self) -> None:
        try:
            import customtkinter as ctk
        except ImportError as exc:
            raise SystemExit(
                "customtkinter не установлен. Выполните: pip install customtkinter"
            ) from exc

        self.ctk = ctk
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("dark-blue")

        self.root = ctk.CTk()
        self.root.title("DanForge — Слайдер отзывов")
        self.root.geometry("1000x780")
        self.root.minsize(880, 660)
        self.root.configure(fg_color=DF_BG)

        self.current_slug: str | None = None
        self.current_config_path: Path | None = None
        self.busy = False
        self._loading_client = False
        self._clients_meta: list[dict] = []

        self.vars = {
            "client_name": ctk.StringVar(value=""),
            "shop": ctk.StringVar(value=""),
            "api_key": ctk.StringVar(value=""),
            "password": ctk.StringVar(value=""),
            "theme_id": ctk.StringVar(value=""),
            "yandex_org_url": ctk.StringVar(value=""),
            "yandex_reviews_file": ctk.StringVar(value=""),
            "yandex_limit": ctk.StringVar(value="20"),
            "min_rating": ctk.StringVar(value="1"),
        }
        self.upload_var = ctk.BooleanVar(value=True)
        self.playwright_var = ctk.BooleanVar(value=False)
        self.dry_run_var = ctk.BooleanVar(value=False)

        migrated = cm.migrate_legacy_config()
        self._build()
        self._refresh_client_list()
        if migrated:
            self._append_log(f"Перенесён legacy config.json -> clients/{migrated}/")
            self._select_client(migrated)

    def _build(self) -> None:
        ctk = self.ctk

        header = ctk.CTkFrame(self.root, fg_color=DF_PANEL, corner_radius=0, height=56)
        header.pack(fill="x")
        header.pack_propagate(False)
        ctk.CTkLabel(
            header,
            text="DanForge",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=DF_ACCENT,
        ).pack(side="left", padx=16, pady=12)
        ctk.CTkLabel(
            header,
            text="Yandex → сниппет темы",
            font=ctk.CTkFont(size=14),
            text_color=DF_TEXT,
        ).pack(side="left", padx=8, pady=12)
        ctk.CTkButton(
            header,
            text="Ручной режим (без API)",
            width=180,
            fg_color=DF_ACCENT,
            hover_color="#e08f50",
            command=self._open_manual_wizard,
        ).pack(side="right", padx=16, pady=10)

        body = ctk.CTkFrame(self.root, fg_color=DF_BG)
        body.pack(fill="both", expand=True, padx=12, pady=12)

        left = ctk.CTkFrame(body, fg_color=DF_PANEL, width=280)
        left.pack(side="left", fill="y", padx=(0, 8))
        left.pack_propagate(False)

        ctk.CTkLabel(left, text="Клиенты", font=ctk.CTkFont(weight="bold")).pack(
            anchor="w", padx=12, pady=(12, 4)
        )
        self._client_filter = "all"
        self.client_filter_seg = ctk.CTkSegmentedButton(
            left,
            values=["Все", "API", "Ручной"],
            font=ctk.CTkFont(size=12),
            height=28,
            command=self._on_client_filter_change,
        )
        self.client_filter_seg.set("Все")
        self.client_filter_seg.pack(fill="x", padx=10, pady=(0, 6))
        self.client_list = ctk.CTkScrollableFrame(left, fg_color=DF_PANEL)
        self.client_list.pack(fill="both", expand=True, padx=6, pady=2)
        self._client_rows: list[ctk.CTkFrame] = []

        left_btns = ctk.CTkFrame(left, fg_color=DF_PANEL)
        left_btns.pack(fill="x", padx=8, pady=8)
        ctk.CTkButton(
            left_btns, text="+ Добавить", width=100, fg_color=DF_ACCENT, hover_color="#e08f50",
            command=self._add_client,
        ).pack(side="left", padx=(0, 6))
        ctk.CTkButton(left_btns, text="Обновить", width=90, command=self._refresh_client_list).pack(
            side="left"
        )

        right = ctk.CTkFrame(body, fg_color=DF_PANEL)
        right.pack(side="left", fill="both", expand=True)

        form = ctk.CTkScrollableFrame(right, fg_color=DF_PANEL)
        form.pack(fill="both", expand=True, padx=12, pady=12)

        fields = [
            ("Название клиента", "client_name", False),
            ("Магазин (без https://)", "shop", False),
            ("API key", "api_key", False),
            ("API password", "password", True),
            ("ID темы (пусто = опубликованная)", "theme_id", False),
            ("URL Яндекс (Карты или Магазин)", "yandex_org_url", False),
            ("Файл отзывов Яндекса (опц.)", "yandex_reviews_file", False),
            ("Yandex limit (0 = все)", "yandex_limit", False),
            ("Мин. рейтинг (1–5)", "min_rating", False),
        ]

        for label, key, secret in fields:
            row = ctk.CTkFrame(form, fg_color=DF_PANEL)
            row.pack(fill="x", pady=4)
            ctk.CTkLabel(row, text=label, width=220, anchor="w", text_color=DF_MUTED).pack(
                side="left"
            )
            entry = ctk.CTkEntry(row, textvariable=self.vars[key], width=420, show="*" if secret else "")
            entry.pack(side="left", fill="x", expand=True, padx=(8, 0))
            register_ctk_entry(entry)
            if key == "yandex_reviews_file":
                ctk.CTkButton(row, text="...", width=36, command=self._browse_yandex).pack(
                    side="left", padx=(6, 0)
                )

        opts = ctk.CTkFrame(form, fg_color=DF_PANEL)
        opts.pack(fill="x", pady=8)
        self.upload_cb = ctk.CTkCheckBox(opts, text="Загрузить в тему", variable=self.upload_var)
        self.upload_cb.pack(side="left", padx=(0, 12))
        ctk.CTkCheckBox(opts, text="Dry-run", variable=self.dry_run_var).pack(side="left", padx=(0, 12))
        ctk.CTkCheckBox(opts, text="Playwright", variable=self.playwright_var).pack(side="left")

        btns = ctk.CTkFrame(form, fg_color=DF_PANEL)
        btns.pack(fill="x", pady=8)
        self.btn_save = ctk.CTkButton(btns, text="Сохранить", command=self._save_config)
        self.btn_save.pack(side="left", padx=(0, 8))
        self.btn_check = ctk.CTkButton(btns, text="Проверить API", command=self._check)
        self.btn_check.pack(side="left", padx=(0, 8))
        self.btn_yandex = ctk.CTkButton(btns, text="Тест Яндекса", command=self._test_yandex)
        self.btn_yandex.pack(side="left", padx=(0, 8))
        self.btn_run = ctk.CTkButton(
            btns,
            text="Сгенерировать",
            fg_color=DF_ACCENT,
            hover_color="#e08f50",
            command=self._generate,
        )
        self.btn_run.pack(side="left", padx=(0, 8))
        self.btn_upload = ctk.CTkButton(
            btns,
            text="Сгенерировать + загрузить",
            fg_color=DF_ACCENT,
            hover_color="#e08f50",
            command=self._generate_upload,
        )
        self.btn_upload.pack(side="left")

        btns2 = ctk.CTkFrame(form, fg_color=DF_PANEL)
        btns2.pack(fill="x", pady=4)
        self.btn_batch = ctk.CTkButton(btns2, text="Все клиенты", command=self._batch_all)
        self.btn_batch.pack(side="left", padx=(0, 8))
        self.btn_copy = ctk.CTkButton(btns2, text="Копировать сниппет", command=self._copy_snippet)
        self.btn_copy.pack(side="left", padx=(0, 8))
        self.btn_open = ctk.CTkButton(btns2, text="Открыть output", command=self._open_output)
        self.btn_open.pack(side="left", padx=(0, 8))
        self.btn_sched = ctk.CTkButton(btns2, text="Планировщик…", command=self._show_scheduler_help)
        self.btn_sched.pack(side="left", padx=(0, 8))
        self.btn_demo = ctk.CTkButton(btns2, text="Демо", command=self._demo)
        self.btn_demo.pack(side="left", padx=(0, 8))
        self.btn_help = ctk.CTkButton(btns2, text="Справка", command=self._open_help)
        self.btn_help.pack(side="left")

        self.progress_frame = ctk.CTkFrame(form, fg_color=DF_PANEL)
        self.progress_label = ctk.CTkLabel(
            self.progress_frame, text="", text_color=DF_MUTED, anchor="w"
        )
        self.progress_label.pack(fill="x", padx=4, pady=(4, 0))
        self.progress_bar = ctk.CTkProgressBar(self.progress_frame, progress_color=DF_ACCENT)
        self.progress_bar.pack(fill="x", padx=4, pady=(4, 8))
        self.progress_bar.set(0)

        log_hdr = ctk.CTkFrame(form, fg_color=DF_PANEL)
        log_hdr.pack(fill="x", pady=(8, 4))
        ctk.CTkLabel(log_hdr, text="Журнал", text_color=DF_MUTED).pack(side="left")
        ctk.CTkButton(
            log_hdr,
            text="Копировать журнал",
            width=140,
            height=28,
            fg_color=DF_BG,
            hover_color="#343a40",
            command=self._copy_log,
        ).pack(side="right")
        self.log = ctk.CTkTextbox(form, height=180, font=ctk.CTkFont(family="Consolas", size=12))
        self.log.pack(fill="both", expand=True)
        register_ctk_textbox(self.log)

        self._all_buttons = [
            self.btn_save,
            self.btn_check,
            self.btn_yandex,
            self.btn_run,
            self.btn_upload,
            self.btn_batch,
            self.btn_copy,
            self.btn_open,
            self.btn_sched,
            self.btn_demo,
            self.btn_help,
        ]
        self._progress_pulse_id: str | None = None
        self._progress_pulse_dir = 1
        self._bind_ui_pref_traces()

    def _bind_ui_pref_traces(self) -> None:
        for var in (self.upload_var, self.dry_run_var, self.playwright_var):
            var.trace_add("write", self._on_ui_pref_changed)

    def _on_ui_pref_changed(self, *_args) -> None:
        if self._loading_client or self.busy:
            return
        self._persist_client_ui_prefs()

    def _sync_form_to_config(self, path: Path) -> core.Config:
        cfg = self._cfg_from_form()
        data = core.config_to_dict(cfg)
        manual = core.is_manual_client(cfg)
        if manual:
            data["client_mode"] = "manual"
            data["upload_to_theme"] = False
        else:
            data["client_mode"] = "api"
            data["upload_to_theme"] = bool(self.upload_var.get())
        data["dry_run"] = bool(self.dry_run_var.get())
        data["use_playwright"] = bool(self.playwright_var.get())
        path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        return core.load_config(path)

    def _persist_client_ui_prefs(self) -> None:
        if self._loading_client or not self.current_config_path or not self.current_config_path.exists():
            return
        try:
            self._sync_form_to_config(self.current_config_path)
        except Exception:
            pass

    def _load_client_ui_prefs(self, path: Path, cfg: core.Config) -> None:
        data = json.loads(path.read_text(encoding="utf-8"))
        manual = core.is_manual_client(cfg)
        self._loading_client = True
        self.dry_run_var.set(bool(data.get("dry_run", False)))
        self.playwright_var.set(bool(data.get("use_playwright", False)))
        if manual:
            self.upload_var.set(False)
        else:
            self.upload_var.set(bool(data.get("upload_to_theme", True)))
        self._loading_client = False
        self._apply_manual_client_ui(manual)

    def _append_log(self, text: str) -> None:
        self.log.insert("end", text + "\n")
        self.log.see("end")

    def _copy_log(self, event=None):
        try:
            text = self.log.get("sel.first", "sel.last")
        except Exception:
            text = self.log.get("1.0", "end-1c")
        text = text.strip()
        if text:
            self.root.clipboard_clear()
            self.root.clipboard_append(text)
        return "break" if event else None

    def _apply_manual_client_ui(self, manual: bool) -> None:
        if manual:
            self.upload_cb.configure(state="disabled")
            self.btn_check.configure(state="disabled")
        elif not self.busy:
            self.upload_cb.configure(state="normal")
            self.btn_check.configure(state="normal")

    def _set_busy(self, busy: bool) -> None:
        self.busy = busy
        state = "disabled" if busy else "normal"
        for btn in self._all_buttons:
            btn.configure(state=state)
        if busy:
            self._show_progress(True, text="Выполняется…")
        else:
            self._show_progress(False)
            if self.current_slug:
                path = cm.client_config_path(self.current_slug)
                if path.exists():
                    self._load_client_ui_prefs(path, core.load_config(path))

    def _show_progress(self, visible: bool, *, value: float | None = None, text: str = "") -> None:
        if visible:
            if not self.progress_frame.winfo_ismapped():
                self.progress_frame.pack(fill="x", pady=(0, 4), before=self.log)
            if text:
                self.progress_label.configure(text=text)
            if value is not None:
                self._stop_progress_pulse()
                self.progress_bar.set(max(0.0, min(1.0, value)))
            else:
                self._start_progress_pulse()
        else:
            self._stop_progress_pulse()
            self.progress_bar.set(0)
            self.progress_label.configure(text="")
            if self.progress_frame.winfo_ismapped():
                self.progress_frame.pack_forget()

    def _start_progress_pulse(self) -> None:
        if self._progress_pulse_id is not None:
            return

        def pulse() -> None:
            current = self.progress_bar.get()
            nxt = current + 0.08 * self._progress_pulse_dir
            if nxt >= 0.95:
                nxt = 0.95
                self._progress_pulse_dir = -1
            elif nxt <= 0.05:
                nxt = 0.05
                self._progress_pulse_dir = 1
            self.progress_bar.set(nxt)
            self._progress_pulse_id = self.root.after(120, pulse)

        pulse()

    def _stop_progress_pulse(self) -> None:
        if self._progress_pulse_id is not None:
            self.root.after_cancel(self._progress_pulse_id)
            self._progress_pulse_id = None
        self._progress_pulse_dir = 1

    def _playwright_progress(self, message: str, fraction: float | None) -> None:
        def update() -> None:
            self._append_log(message)
            self._show_progress(True, value=fraction, text=message)

        self.root.after(0, update)

    def _progress_callback(self) -> Callable[[str, float | None], None] | None:
        if not self.playwright_var.get():
            return None
        return self._playwright_progress

    def _on_client_filter_change(self, value: str) -> None:
        mapping = {"Все": "all", "API": "api", "Ручной": "manual"}
        self._client_filter = mapping.get(value, "all")
        self._refresh_client_list()

    @staticmethod
    def _truncate(text: str, max_len: int) -> str:
        text = (text or "").strip()
        if len(text) <= max_len:
            return text
        return text[: max_len - 1] + "…"

    @staticmethod
    def _format_client_date(iso: str | None) -> str:
        if not iso or iso == "—":
            return "—"
        return iso[:10].replace("T", " ")

    def _bind_client_row_click(self, widgets: list, slug: str) -> None:
        def handler(_event=None) -> None:
            self._select_client(slug)

        for widget in widgets:
            widget.bind("<Button-1>", handler)

    def _refresh_client_list(self) -> None:
        ctk = self.ctk
        for child in self.client_list.winfo_children():
            child.destroy()
        self._client_rows.clear()
        self._clients_meta = cm.list_clients()
        filtered = [
            m
            for m in self._clients_meta
            if self._client_filter == "all" or m.get("client_mode", "api") == self._client_filter
        ]
        if not filtered:
            ctk.CTkLabel(
                self.client_list,
                text="Нет клиентов",
                text_color=DF_MUTED,
                font=ctk.CTkFont(size=12),
            ).pack(pady=12)
            return

        for meta in filtered:
            slug = meta["slug"]
            mode = meta.get("client_mode", "api")
            delivery = meta.get("delivery", "—")
            mode_label = meta.get("mode_label", "API")
            date_short = self._format_client_date(meta.get("last_run"))
            name = self._truncate(meta.get("name") or slug, 26)
            status = self._truncate(f"{mode_label} · {delivery} · {date_short}", 32)

            is_selected = slug == self.current_slug
            if is_selected:
                row_bg = DF_SELECTED
            elif mode == "manual":
                row_bg = DF_MANUAL_BG
            else:
                row_bg = DF_BG

            row = ctk.CTkFrame(self.client_list, fg_color="transparent", height=46)
            row.pack(fill="x", pady=1)
            row.pack_propagate(False)

            stripe_color = DF_MANUAL_STRIPE if mode == "manual" else DF_API_STRIPE
            stripe = ctk.CTkFrame(row, width=3, fg_color=stripe_color, corner_radius=1)
            stripe.pack(side="left", fill="y", padx=(0, 3))

            card = ctk.CTkFrame(row, fg_color=row_bg, corner_radius=4)
            card.pack(side="left", fill="both", expand=True)

            name_lbl = ctk.CTkLabel(
                card,
                text=name,
                anchor="w",
                font=ctk.CTkFont(size=12, weight="bold"),
                text_color=DF_TEXT,
            )
            name_lbl.pack(fill="x", padx=6, pady=(4, 0))

            status_lbl = ctk.CTkLabel(
                card,
                text=status,
                anchor="w",
                font=ctk.CTkFont(size=10),
                text_color=DF_MUTED,
            )
            status_lbl.pack(fill="x", padx=6, pady=(0, 4))

            self._bind_client_row_click([row, stripe, card, name_lbl, status_lbl], slug)
            self._client_rows.append(row)

    def _select_client(self, slug: str) -> None:
        if slug == self.current_slug:
            return
        self._persist_client_ui_prefs()
        path = cm.client_config_path(slug)
        if not path.exists():
            return
        self.current_slug = slug
        self.current_config_path = path
        cfg = core.load_config(path)
        self.vars["client_name"].set(cfg.client_name or slug)
        self.vars["shop"].set(cfg.shop)
        self.vars["api_key"].set(cfg.api_key)
        self.vars["password"].set(cfg.password)
        self.vars["theme_id"].set(str(cfg.theme_id) if cfg.theme_id else "")
        self.vars["yandex_org_url"].set(cfg.yandex_org_url or "")
        self.vars["yandex_reviews_file"].set(cfg.yandex_reviews_file or "")
        limit = cfg.yandex_limit if cfg.yandex_limit else cfg.sample_count
        self.vars["yandex_limit"].set(str(limit))
        self.vars["min_rating"].set(str(cfg.min_rating))
        self._load_client_ui_prefs(path, cfg)
        self._refresh_client_list()
        self._append_log(f"Клиент: {slug}")

    def _browse_yandex(self) -> None:
        path = filedialog.askopenfilename(
            title="JSON с отзывами Яндекса",
            filetypes=[("JSON", "*.json"), ("Все файлы", "*.*")],
        )
        if path:
            self.vars["yandex_reviews_file"].set(path)

    def _cfg_from_form(self) -> core.Config:
        theme_raw = self.vars["theme_id"].get().strip()
        theme_id = int(theme_raw) if theme_raw else None
        yandex_file = self.vars["yandex_reviews_file"].get().strip() or None
        slug = self.current_slug or cm.slugify(self.vars["shop"].get())
        out = str(cm.client_output_dir(slug)) if self.current_slug else str(CLI_DIR.parent / "output")
        limit = int(self.vars["yandex_limit"].get() or 0)
        return core.Config(
            client_name=self.vars["client_name"].get().strip() or slug,
            shop=self.vars["shop"].get().strip(),
            api_key=self.vars["api_key"].get().strip(),
            password=self.vars["password"].get().strip(),
            theme_id=theme_id,
            yandex_org_url=self.vars["yandex_org_url"].get().strip() or None,
            yandex_reviews_file=yandex_file,
            yandex_limit=limit,
            sample_count=limit,
            min_rating=int(self.vars["min_rating"].get() or 1),
            source_mode="yandex",
            output_dir=out,
        )

    def _ensure_client_path(self) -> Path:
        if self.current_config_path and self.current_config_path.exists():
            return self.current_config_path
        slug = cm.slugify(self.vars["client_name"].get() or self.vars["shop"].get())
        path = cm.create_client(slug, core.config_to_dict(self._cfg_from_form()))
        self.current_slug = slug
        self.current_config_path = path
        self._refresh_client_list()
        return path

    def _save_config(self) -> None:
        try:
            path = self._ensure_client_path()
            self._sync_form_to_config(path)
            self._append_log(f"Сохранено: {path}")
            self._refresh_client_list()
        except Exception as exc:
            messagebox.showerror("Ошибка", str(exc))

    def _add_client(self) -> None:
        name = simpledialog.askstring("Новый клиент", "Название или домен магазина:")
        if not name:
            return
        slug = cm.slugify(name)
        example = json.loads((CLI_DIR / "config.example.json").read_text(encoding="utf-8"))
        example["client_name"] = name
        example["shop"] = name if "." in name else f"{slug}.myinsales.ru"
        example["client_mode"] = "api"
        example["upload_to_theme"] = True
        cm.create_client(slug, example)
        self._refresh_client_list()
        self._select_client(slug)
        self._append_log(f"Создан клиент: {slug}")

    def _run_in_thread(self, fn, *, refresh_clients: bool = False) -> None:
        if self.busy:
            return
        self._set_busy(True)

        def worker() -> None:
            stdout = sys.stdout
            writer = QueueWriter(lambda msg: self.root.after(0, self._append_log, msg))
            sys.stdout = writer
            try:
                fn()
                writer.flush()
            except SystemExit as exc:
                writer.flush()
                self.root.after(0, self._append_log, f"Остановлено: {exc}")
            except Exception as exc:
                writer.flush()
                self.root.after(0, self._append_log, f"Ошибка: {exc}")
                self.root.after(0, lambda: messagebox.showerror("Ошибка", str(exc)))
            finally:
                sys.stdout = stdout
                self.root.after(0, self._set_busy, False)
                if refresh_clients:
                    self.root.after(0, self._refresh_client_list)

        threading.Thread(target=worker, daemon=True).start()

    def _prepare_run(self) -> tuple[core.Config, Path, str]:
        path = self._ensure_client_path()
        cfg = self._cfg_from_form()
        core.validate_client_config(cfg, path)
        cfg = self._sync_form_to_config(path)
        slug = self.current_slug or cm.config_slug(path)
        return cfg, path, slug

    def _check(self) -> None:
        def task() -> None:
            cfg, _path, _slug = self._prepare_run()
            if core.is_manual_client(cfg):
                print("Ручной режим (без API): проверка API не требуется.")
                return
            core.check_api_connection(cfg)
            core.report_themes_for_check(cfg)

        self._run_in_thread(task)

    def _test_yandex(self) -> None:
        def task() -> None:
            cfg, _path, _slug = self._prepare_run()
            core.test_yandex_fetch(
                cfg,
                use_playwright=self.playwright_var.get(),
                progress_callback=self._progress_callback(),
            )

        self._run_in_thread(task)

    def _generate(self) -> None:
        def task() -> None:
            cfg, _path, slug = self._prepare_run()
            core.run(
                cfg,
                upload=False,
                use_playwright=self.playwright_var.get(),
                dry_run=self.dry_run_var.get(),
                log_slug=slug,
                progress_callback=self._progress_callback(),
            )

        self._run_in_thread(task, refresh_clients=True)

    def _generate_upload(self) -> None:
        def task() -> None:
            cfg, _path, slug = self._prepare_run()
            core.run(
                cfg,
                upload=True,
                use_playwright=self.playwright_var.get(),
                dry_run=self.dry_run_var.get(),
                log_slug=slug,
                progress_callback=self._progress_callback(),
            )

        self._run_in_thread(task, refresh_clients=True)

    def _batch_all(self) -> None:
        if not messagebox.askyesno(
            "Пакетный запуск",
            "Обработать всех клиентов из папки clients/?\n\n"
            "Upload в тему — по сохранённой настройке каждого клиента:\n"
            "• [API] с галочкой «Загрузить в тему» → upload\n"
            "• [РУЧ] → только файл",
        ):
            return
        self._persist_client_ui_prefs()

        def task() -> None:
            core.run_batch(
                use_playwright=self.playwright_var.get(),
                dry_run=self.dry_run_var.get(),
            )

        self._run_in_thread(task, refresh_clients=True)

    def _copy_snippet(self) -> None:
        slug = self.current_slug
        if not slug:
            messagebox.showinfo("DanForge", "Выберите клиента")
            return
        liquid = cm.client_output_dir(slug) / "danforge_reviews_yandex.liquid"
        if not liquid.exists():
            liquid = cm.client_output_dir(slug) / "danforge_reviews_slides.liquid"
        if not liquid.exists():
            messagebox.showwarning("DanForge", "Сначала сгенерируйте отзывы")
            return
        text = liquid.read_text(encoding="utf-8")
        self.root.clipboard_clear()
        self.root.clipboard_append(text)
        cm.mark_snippet_copied(slug)
        self._append_log("Сниппет скопирован в буфер обмена")
        self._refresh_client_list()

    def _open_output(self) -> None:
        slug = self.current_slug
        if not slug:
            return
        out = cm.client_output_dir(slug)
        out.mkdir(parents=True, exist_ok=True)
        os.startfile(out)

    def _show_scheduler_help(self) -> None:
        bat = CLI_DIR / "install_scheduler.bat"
        msg = (
            "Ежемесячное обновление всех клиентов:\n\n"
            "1. Планировщик заданий Windows → Создать задачу\n"
            "2. Триггер: ежемесячно\n"
            f"3. Действие: запуск {bat}\n\n"
            "Или вручную: python get_reviews.py --batch-all -u"
        )
        messagebox.showinfo("Планировщик", msg)

    def _open_help(self) -> None:
        path = CLI_DIR / "INSTRUCTION.md"
        if not path.exists():
            messagebox.showwarning("DanForge", "Файл INSTRUCTION.md не найден")
            return
        os.startfile(path)

    def _open_manual_wizard(self) -> None:
        if self.busy:
            return
        ManualWizardDialog(self)

    def _demo(self) -> None:
        def task() -> None:
            slug = self.current_slug or "demo"
            out = cm.client_output_dir(slug)
            out.mkdir(parents=True, exist_ok=True)
            cfg = core.Config(
                client_name="Demo",
                shop="demo.myinsales.ru",
                api_key="",
                password="",
                output_dir=str(out),
            )
            core.build_demo_output(cfg)

        self._run_in_thread(task)

    def run(self) -> None:
        self.root.mainloop()


def run_gui() -> None:
    ReviewsCtkApp().run()


if __name__ == "__main__":
    run_gui()
