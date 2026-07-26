#!/usr/bin/env python3
"""DanForge get-reviews — графический интерфейс (мульти-клиент)."""
from __future__ import annotations

from typing import Callable
import io
import json
import os
import subprocess
import sys
import threading
import tkinter as tk
from pathlib import Path
from tkinter import filedialog, messagebox, scrolledtext, simpledialog, ttk

import clients_manager as cm
import get_reviews as core

CLI_DIR = Path(__file__).parent


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


class ReviewsGui:
    def __init__(self, root: tk.Tk) -> None:
        self.root = root
        self.root.title("DanForge — Слайдер отзывов")
        self.root.geometry("980x760")
        self.root.minsize(860, 640)

        self.current_slug: str | None = None
        self.current_config_path: Path | None = None
        self.busy = False

        self.vars = {
            "client_name": tk.StringVar(),
            "shop": tk.StringVar(),
            "api_key": tk.StringVar(),
            "password": tk.StringVar(),
            "theme_id": tk.StringVar(),
            "yandex_org_url": tk.StringVar(),
            "yandex_reviews_file": tk.StringVar(),
            "yandex_limit": tk.StringVar(value="20"),
            "min_rating": tk.StringVar(value="1"),
        }
        self.upload_var = tk.BooleanVar(value=True)
        self.playwright_var = tk.BooleanVar(value=False)
        self.prefer_avatar_var = tk.BooleanVar(value=False)
        self.dry_run_var = tk.BooleanVar(value=False)

        migrated = cm.migrate_legacy_config()
        self._build()
        self._refresh_client_list()
        if migrated:
            self._append_log(f"Перенесён legacy config.json -> clients/{migrated}/")
            self._select_client(migrated)

    def _build(self) -> None:
        paned = ttk.Panedwindow(self.root, orient=tk.HORIZONTAL)
        paned.pack(fill="both", expand=True, padx=8, pady=8)

        left = ttk.Frame(paned, width=240)
        right = ttk.Frame(paned)
        paned.add(left, weight=1)
        paned.add(right, weight=4)

        ttk.Label(left, text="Клиенты", font=("Segoe UI", 10, "bold")).pack(anchor="w", pady=(0, 4))
        self.client_list = tk.Listbox(left, height=20, exportselection=False)
        self.client_list.pack(fill="both", expand=True)
        self.client_list.bind("<<ListboxSelect>>", self._on_client_select)

        left_btns = ttk.Frame(left)
        left_btns.pack(fill="x", pady=6)
        ttk.Button(left_btns, text="+ Добавить", command=self._add_client).pack(side="left", padx=(0, 4))
        ttk.Button(left_btns, text="Обновить", command=self._refresh_client_list).pack(side="left")

        pad = {"padx": 8, "pady": 3}
        form = ttk.Frame(right)
        form.pack(fill="both", expand=True)

        ttk.Label(
            form,
            text="Yandex → сниппет темы (InSales — в виджете)",
            font=("Segoe UI", 11, "bold"),
        ).grid(row=0, column=0, columnspan=3, sticky="w", pady=(0, 8))

        fields = [
            ("Название клиента", "client_name"),
            ("Магазин (без https://)", "shop"),
            ("API key", "api_key"),
            ("API password", "password"),
            ("ID темы (пусто = опубликованная)", "theme_id"),
            ("URL Яндекс (Карты или Магазин)", "yandex_org_url"),
            ("Файл отзывов Яндекса (опц.)", "yandex_reviews_file"),
            ("Yandex limit (0 = все)", "yandex_limit"),
            ("Мин. рейтинг (1–5)", "min_rating"),
        ]

        row = 1
        for label, key in fields:
            ttk.Label(form, text=label).grid(row=row, column=0, sticky="w", **pad)
            entry = ttk.Entry(form, textvariable=self.vars[key], width=52)
            entry.grid(row=row, column=1, sticky="ew", **pad)
            if key == "password":
                entry.configure(show="*")
            if key == "yandex_reviews_file":
                ttk.Button(form, text="...", width=3, command=self._browse_yandex).grid(
                    row=row, column=2, **pad
                )
            row += 1

        opts = ttk.Frame(form)
        opts.grid(row=row, column=0, columnspan=3, sticky="w", pady=6)
        ttk.Checkbutton(opts, text="Загрузить в тему", variable=self.upload_var).pack(side="left", padx=(0, 12))
        ttk.Checkbutton(opts, text="Dry-run", variable=self.dry_run_var).pack(side="left", padx=(0, 12))
        ttk.Checkbutton(opts, text="Приоритет с аватаром", variable=self.prefer_avatar_var).pack(
            side="left", padx=(0, 12)
        )
        ttk.Checkbutton(opts, text="Playwright", variable=self.playwright_var).pack(side="left")
        row += 1

        btns1 = ttk.Frame(form)
        btns1.grid(row=row, column=0, columnspan=3, sticky="w", pady=4)
        self.btn_save = ttk.Button(btns1, text="Сохранить", command=self._save_config)
        self.btn_save.pack(side="left", padx=(0, 6))
        self.btn_check = ttk.Button(btns1, text="Проверить API", command=self._check)
        self.btn_check.pack(side="left", padx=(0, 6))
        self.btn_yandex = ttk.Button(btns1, text="Тест Яндекса", command=self._test_yandex)
        self.btn_yandex.pack(side="left", padx=(0, 6))
        self.btn_run = ttk.Button(btns1, text="Сгенерировать", command=self._generate)
        self.btn_run.pack(side="left", padx=(0, 6))
        self.btn_upload = ttk.Button(btns1, text="Сгенерировать + загрузить", command=self._generate_upload)
        self.btn_upload.pack(side="left")
        row += 1

        btns2 = ttk.Frame(form)
        btns2.grid(row=row, column=0, columnspan=3, sticky="w", pady=4)
        self.btn_batch = ttk.Button(btns2, text="Все клиенты", command=self._batch_all)
        self.btn_batch.pack(side="left", padx=(0, 6))
        self.btn_copy = ttk.Button(btns2, text="Копировать сниппет", command=self._copy_snippet)
        self.btn_copy.pack(side="left", padx=(0, 6))
        self.btn_open = ttk.Button(btns2, text="Открыть output", command=self._open_output)
        self.btn_open.pack(side="left", padx=(0, 6))
        self.btn_sched = ttk.Button(btns2, text="Планировщик…", command=self._show_scheduler_help)
        self.btn_sched.pack(side="left", padx=(0, 6))
        self.btn_demo = ttk.Button(btns2, text="Демо", command=self._demo)
        self.btn_demo.pack(side="left", padx=(0, 6))
        self.btn_help = ttk.Button(btns2, text="Справка", command=self._open_help)
        self.btn_help.pack(side="left")
        row += 1

        self.progress_frame = ttk.Frame(form)
        self.progress_label = ttk.Label(self.progress_frame, text="")
        self.progress_label.pack(fill="x", padx=8)
        self.progress_bar = ttk.Progressbar(self.progress_frame, mode="determinate", maximum=100)
        self.progress_bar.pack(fill="x", padx=8, pady=(0, 4))
        row += 1

        ttk.Label(form, text="Журнал").grid(row=row, column=0, sticky="w", **pad)
        row += 1
        self.log = scrolledtext.ScrolledText(form, height=14, wrap="word", font=("Consolas", 10))
        self.log.grid(row=row, column=0, columnspan=3, sticky="nsew", **pad)

        form.columnconfigure(1, weight=1)
        form.rowconfigure(row, weight=1)

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

    def _append_log(self, text: str) -> None:
        self.log.insert("end", text + "\n")
        self.log.see("end")

    def _set_busy(self, busy: bool) -> None:
        self.busy = busy
        state = "disabled" if busy else "normal"
        for btn in self._all_buttons:
            btn.configure(state=state)
        if busy:
            self._show_progress(True, text="Выполняется…")
        else:
            self._show_progress(False)

    def _show_progress(self, visible: bool, *, value: float | None = None, text: str = "") -> None:
        if visible:
            self.progress_frame.grid(row=self.log.grid_info()["row"] - 1, column=0, columnspan=3, sticky="ew", padx=8)
            if text:
                self.progress_label.configure(text=text)
            if value is not None:
                self.progress_bar.configure(mode="determinate", value=value * 100)
            else:
                self.progress_bar.configure(mode="indeterminate")
                self.progress_bar.start(12)
        else:
            self.progress_bar.stop()
            self.progress_bar.configure(value=0)
            self.progress_label.configure(text="")
            self.progress_frame.grid_remove()

    def _playwright_progress(self, message: str, fraction: float | None) -> None:
        def update() -> None:
            self._append_log(message)
            self._show_progress(True, value=fraction, text=message)

        self.root.after(0, update)

    def _progress_callback(self) -> Callable[[str, float | None], None] | None:
        if not self.playwright_var.get():
            return None
        return self._playwright_progress

    def _refresh_client_list(self) -> None:
        self.client_list.delete(0, tk.END)
        self._clients_meta = cm.list_clients()
        for meta in self._clients_meta:
            last = meta.get("last_run") or "—"
            if last and last != "—":
                last = last[:16].replace("T", " ")
            label = f"{meta['name']}\n  {meta['status']} · {last}"
            self.client_list.insert(tk.END, label)

    def _on_client_select(self, _event=None) -> None:
        sel = self.client_list.curselection()
        if not sel:
            return
        meta = self._clients_meta[sel[0]]
        self._select_client(meta["slug"])

    def _select_client(self, slug: str) -> None:
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
        self.prefer_avatar_var.set(cfg.prefer_with_avatar)
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
        return core.Config(
            client_name=self.vars["client_name"].get().strip() or slug,
            shop=self.vars["shop"].get().strip(),
            api_key=self.vars["api_key"].get().strip(),
            password=self.vars["password"].get().strip(),
            theme_id=theme_id,
            yandex_org_url=self.vars["yandex_org_url"].get().strip() or None,
            yandex_reviews_file=yandex_file,
            yandex_limit=int(self.vars["yandex_limit"].get() or 0),
            sample_count=int(self.vars["yandex_limit"].get() or 0),
            min_rating=int(self.vars["min_rating"].get() or 1),
            source_mode="yandex",
            prefer_with_avatar=self.prefer_avatar_var.get(),
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
            cfg = self._cfg_from_form()
            path = self._ensure_client_path()
            core.save_config(cfg, path)
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
        core.validate_config(cfg, path)
        core.save_config(cfg, path)
        slug = self.current_slug or cm.config_slug(path)
        return cfg, path, slug

    def _check(self) -> None:
        def task() -> None:
            cfg, path, _slug = self._prepare_run()
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
        if not messagebox.askyesno("Пакетный запуск", "Обработать всех клиентов из папки clients/?"):
            return

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
        self._append_log("Сниппет скопирован в буфер обмена")

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


def run_gui() -> None:
    root = tk.Tk()
    try:
        ttk.Style().theme_use("vista")
    except tk.TclError:
        pass
    ReviewsGui(root)
    root.mainloop()


if __name__ == "__main__":
    run_gui()
