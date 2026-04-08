import customtkinter as ctk
from tkinter import messagebox
from datetime import datetime, timedelta
import calendar as cal_module


ACCENT   = "#3B82F6"
SUCCESS  = "#22C55E"
DANGER   = "#EF4444"
WARNING  = "#F59E0B"
PURPLE   = "#8B5CF6"
MUTED    = "#6B7280"

PRIORITIES = ["E ulët", "Normale", "E lartë", "Urgjente"]
STATUSES   = ["Në pritje", "Në progres", "Përfunduar"]
PRIO_COLORS = {"E ulët": MUTED, "Normale": ACCENT, "E lartë": WARNING, "Urgjente": DANGER}
STAT_COLORS = {"Në pritje": MUTED, "Në progres": ACCENT, "Përfunduar": SUCCESS}


class CalendarFrame(ctk.CTkFrame):
    def __init__(self, parent, db):
        super().__init__(parent, fg_color="transparent")
        self.db = db
        self._today = datetime.now()
        self._current = datetime(self._today.year, self._today.month, 1)
        self._filter_status = ctk.StringVar(value="Të gjitha")
        self._build()

    def _build(self):
        # Header
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.pack(fill="x", padx=20, pady=(20, 0))
        ctk.CTkLabel(header, text="Kalendari & Detyrat", font=("Segoe UI", 22, "bold")).pack(side="left")
        ctk.CTkButton(header, text="+ Detyrë e Re", width=140, fg_color=ACCENT,
                      command=self._open_add_dialog).pack(side="right")

        # Main layout: calendar left, tasks right
        main = ctk.CTkFrame(self, fg_color="transparent")
        main.pack(fill="both", expand=True, padx=20, pady=12)
        main.columnconfigure(0, weight=2)
        main.columnconfigure(1, weight=3)
        main.rowconfigure(0, weight=1)

        self._cal_frame = ctk.CTkFrame(main, corner_radius=12)
        self._cal_frame.grid(row=0, column=0, padx=(0, 10), sticky="nsew")
        self._task_frame = ctk.CTkFrame(main, corner_radius=12)
        self._task_frame.grid(row=0, column=1, padx=(10, 0), sticky="nsew")

        self._build_calendar()
        self._build_tasks()

    def _build_calendar(self):
        for w in self._cal_frame.winfo_children():
            w.destroy()

        # Nav
        nav = ctk.CTkFrame(self._cal_frame, fg_color="transparent")
        nav.pack(fill="x", padx=12, pady=12)
        ctk.CTkButton(nav, text="◀", width=30, height=30, command=self._prev_month).pack(side="left")
        month_name = self._current.strftime("%B %Y")
        ctk.CTkLabel(nav, text=month_name, font=("Segoe UI", 14, "bold")).pack(side="left", expand=True)
        ctk.CTkButton(nav, text="▶", width=30, height=30, command=self._next_month).pack(side="right")

        # Day headers
        grid = ctk.CTkFrame(self._cal_frame, fg_color="transparent")
        grid.pack(fill="x", padx=8)
        days = ["Hën", "Mar", "Mër", "Enj", "Pre", "Sht", "Diel"]
        for col, d in enumerate(days):
            lbl = ctk.CTkLabel(grid, text=d, width=38, font=("Segoe UI", 10, "bold"), text_color=MUTED)
            lbl.grid(row=0, column=col, padx=1, pady=2)

        # Get tasks for this month to mark dates
        month_start = self._current.strftime('%Y-%m-01')
        last_day    = cal_module.monthrange(self._current.year, self._current.month)[1]
        month_end   = self._current.strftime(f'%Y-%m-{last_day:02d}')
        tasks_month = self.db.get_tasks(due_date=None)
        task_dates  = set()
        for t in tasks_month:
            if t['due_date'] and month_start <= t['due_date'] <= month_end:
                task_dates.add(t['due_date'])

        # Calendar days
        cal_weeks = cal_module.monthcalendar(self._current.year, self._current.month)
        today_str = self._today.strftime('%Y-%m-%d')
        for row_i, week in enumerate(cal_weeks):
            for col_i, day in enumerate(week):
                if day == 0:
                    ctk.CTkLabel(grid, text="", width=38).grid(row=row_i+1, column=col_i, padx=1, pady=1)
                    continue
                date_str = self._current.strftime(f'%Y-%m-{day:02d}')
                is_today   = date_str == today_str
                has_task   = date_str in task_dates
                fg = ACCENT if is_today else ("white", "#1f2937")
                day_btn = ctk.CTkButton(
                    grid, text=str(day), width=36, height=32,
                    fg_color=fg,
                    text_color=("white" if is_today else ("black", "white")),
                    font=("Segoe UI", 11, "bold" if is_today else "normal"),
                    command=lambda ds=date_str: self._filter_by_date(ds),
                    border_width=2 if has_task else 0,
                    border_color=WARNING if has_task else "transparent",
                )
                day_btn.grid(row=row_i+1, column=col_i, padx=1, pady=1)

        # Legend
        legend = ctk.CTkFrame(self._cal_frame, fg_color="transparent")
        legend.pack(fill="x", padx=12, pady=8)
        ctk.CTkLabel(legend, text="🟡 = Ka detyra", font=("Segoe UI", 10), text_color=MUTED).pack(side="left")
        ctk.CTkLabel(legend, text="🔵 = Sot", font=("Segoe UI", 10), text_color=MUTED).pack(side="left", padx=8)

    def _build_tasks(self, date_filter=None):
        for w in self._task_frame.winfo_children():
            w.destroy()

        title_row = ctk.CTkFrame(self._task_frame, fg_color="transparent")
        title_row.pack(fill="x", padx=12, pady=(12, 4))
        title = f"Detyrat — {date_filter}" if date_filter else "Të gjitha Detyrat"
        ctk.CTkLabel(title_row, text=title, font=("Segoe UI", 13, "bold")).pack(side="left")
        if date_filter:
            ctk.CTkButton(title_row, text="✕ Hiq filtrin", width=100, height=24,
                          command=lambda: self._build_tasks()).pack(side="right")

        # Status filter
        filter_row = ctk.CTkFrame(self._task_frame, fg_color="transparent")
        filter_row.pack(fill="x", padx=12, pady=(0, 6))
        for s in ["Të gjitha"] + STATUSES:
            ctk.CTkButton(filter_row, text=s, width=80, height=24, font=("Segoe UI", 10),
                          fg_color=ACCENT if self._filter_status.get() == s else ("white", "#374151"),
                          text_color=("black", "white") if self._filter_status.get() != s else "white",
                          command=lambda v=s, df=date_filter: self._set_status_filter(v, df)
                          ).pack(side="left", padx=2)

        tasks = self.db.get_tasks(
            status_filter=self._filter_status.get() if self._filter_status.get() != "Të gjitha" else None,
            due_date=date_filter
        )

        scroll = ctk.CTkScrollableFrame(self._task_frame, fg_color="transparent")
        scroll.pack(fill="both", expand=True, padx=8, pady=(0, 12))

        if not tasks:
            ctk.CTkLabel(scroll, text="Nuk ka detyra.", text_color=MUTED).pack(pady=20)
            return

        for task in tasks:
            card = ctk.CTkFrame(scroll, corner_radius=8, fg_color=("#F9FAFB", "#1f2937"))
            card.pack(fill="x", pady=3)

            top = ctk.CTkFrame(card, fg_color="transparent")
            top.pack(fill="x", padx=10, pady=(8, 2))
            ctk.CTkLabel(top, text=task['title'], font=("Segoe UI", 12, "bold")).pack(side="left")

            prio_color = PRIO_COLORS.get(task['priority'], MUTED)
            ctk.CTkLabel(top, text=f"● {task['priority']}", font=("Segoe UI", 10),
                         text_color=prio_color).pack(side="right", padx=4)

            info = ctk.CTkFrame(card, fg_color="transparent")
            info.pack(fill="x", padx=10, pady=(0, 4))
            stat_color = STAT_COLORS.get(task['status'], MUTED)
            ctk.CTkLabel(info, text=task['status'], font=("Segoe UI", 10),
                         text_color=stat_color).pack(side="left")
            if task['due_date']:
                due = task['due_date']
                overdue = due < self._today.strftime('%Y-%m-%d') and task['status'] != 'Përfunduar'
                ctk.CTkLabel(info, text=f"📅 {due}",
                             text_color=DANGER if overdue else MUTED,
                             font=("Segoe UI", 10)).pack(side="left", padx=8)
            if task['customer_name']:
                ctk.CTkLabel(info, text=f"👤 {task['customer_name']}", font=("Segoe UI", 10),
                             text_color=MUTED).pack(side="left")

            btn_row = ctk.CTkFrame(card, fg_color="transparent")
            btn_row.pack(fill="x", padx=10, pady=(0, 8))
            tid = task['id']
            if task['status'] != 'Përfunduar':
                next_s = "Në progres" if task['status'] == 'Në pritje' else 'Përfunduar'
                ctk.CTkButton(btn_row, text="✓ " + next_s, width=120, height=24, fg_color=SUCCESS,
                              command=lambda id=tid, s=next_s, df=date_filter: self._advance(id, s, df)
                              ).pack(side="left", padx=2)
            ctk.CTkButton(btn_row, text="✏️", width=34, height=24, fg_color=ACCENT,
                          command=lambda t=task, df=date_filter: self._open_edit_dialog(t, df)
                          ).pack(side="left", padx=2)
            ctk.CTkButton(btn_row, text="🗑", width=34, height=24, fg_color=DANGER,
                          command=lambda id=tid, df=date_filter: self._delete(id, df)
                          ).pack(side="left", padx=2)

    def _set_status_filter(self, val, date_filter):
        self._filter_status.set(val)
        self._build_tasks(date_filter)

    def _filter_by_date(self, date_str):
        self._build_tasks(date_str)

    def _advance(self, id, status, date_filter):
        self.db.update_task_status(id, status)
        self._build_tasks(date_filter)

    def _delete(self, id, date_filter):
        if messagebox.askyesno("Konfirmo", "Fshi detyrën?"):
            self.db.delete_task(id)
            self._build_tasks(date_filter)

    def _open_add_dialog(self):
        self._open_task_dialog()

    def _open_edit_dialog(self, task, date_filter):
        self._open_task_dialog(task, date_filter)

    def _open_task_dialog(self, task=None, date_filter=None):
        dlg = ctk.CTkToplevel(self)
        dlg.title("Detyrë e Re" if not task else "Ndrysho Detyrën")
        dlg.geometry("460x460")
        dlg.grab_set()
        dlg.resizable(False, False)

        ctk.CTkLabel(dlg, text="Detyrë e Re" if not task else "Ndrysho Detyrën",
                     font=("Segoe UI", 16, "bold")).pack(pady=(20, 10))

        fields = {}
        for label, key, ph in [("Titulli *", "title", "Titulli i detyrës"),
                                ("Përshkrimi", "desc", "Përshkrimi...")]:
            row = ctk.CTkFrame(dlg, fg_color="transparent")
            row.pack(fill="x", padx=24, pady=4)
            ctk.CTkLabel(row, text=label, width=120, anchor="w").pack(side="left")
            var = ctk.StringVar(value=(task[key.replace('desc', 'description')] if task else ""))
            ctk.CTkEntry(row, textvariable=var, width=270, placeholder_text=ph).pack(side="left")
            fields[key] = var

        # Due date
        due_var = ctk.StringVar(value=task['due_date'] if task and task['due_date'] else "")
        row = ctk.CTkFrame(dlg, fg_color="transparent")
        row.pack(fill="x", padx=24, pady=4)
        ctk.CTkLabel(row, text="Data (YYYY-MM-DD)", width=120, anchor="w").pack(side="left")
        ctk.CTkEntry(row, textvariable=due_var, width=270, placeholder_text="2025-12-31").pack(side="left")

        # Priority
        prio_var = ctk.StringVar(value=task['priority'] if task else "Normale")
        row = ctk.CTkFrame(dlg, fg_color="transparent")
        row.pack(fill="x", padx=24, pady=4)
        ctk.CTkLabel(row, text="Prioriteti", width=120, anchor="w").pack(side="left")
        ctk.CTkOptionMenu(row, variable=prio_var, values=PRIORITIES, width=270).pack(side="left")

        # Status (edit only)
        stat_var = ctk.StringVar(value=task['status'] if task else "Në pritje")
        if task:
            row = ctk.CTkFrame(dlg, fg_color="transparent")
            row.pack(fill="x", padx=24, pady=4)
            ctk.CTkLabel(row, text="Statusi", width=120, anchor="w").pack(side="left")
            ctk.CTkOptionMenu(row, variable=stat_var, values=STATUSES, width=270).pack(side="left")

        # Customer
        cust_map   = self.db.get_customer_names()
        cust_names = ["—"] + list(cust_map.keys())
        cust_var   = ctk.StringVar(value="—")
        if task and task['customer_name']:
            cust_var.set(task['customer_name'])
        row = ctk.CTkFrame(dlg, fg_color="transparent")
        row.pack(fill="x", padx=24, pady=4)
        ctk.CTkLabel(row, text="Klienti", width=120, anchor="w").pack(side="left")
        ctk.CTkOptionMenu(row, variable=cust_var, values=cust_names, width=270).pack(side="left")

        def save():
            title = fields['title'].get().strip()
            if not title:
                messagebox.showerror("Gabim", "Titulli është i detyrueshëm!")
                return
            cid = cust_map.get(cust_var.get()) if cust_var.get() != "—" else None
            due = due_var.get().strip() or None
            if task:
                self.db.update_task(task['id'], title, fields['desc'].get(),
                                    due, prio_var.get(), stat_var.get(), cid)
            else:
                self.db.add_task(title, fields['desc'].get(), due, prio_var.get(), cid)
            dlg.destroy()
            self._build_calendar()
            self._build_tasks(date_filter)

        ctk.CTkButton(dlg, text="💾 Ruaj", fg_color=ACCENT, width=200, command=save).pack(pady=18)

    def _prev_month(self):
        d = self._current
        self._current = datetime(d.year - (1 if d.month == 1 else 0),
                                 12 if d.month == 1 else d.month - 1, 1)
        self._build_calendar()

    def _next_month(self):
        d = self._current
        self._current = datetime(d.year + (1 if d.month == 12 else 0),
                                 1 if d.month == 12 else d.month + 1, 1)
        self._build_calendar()

    def refresh(self):
        for w in self.winfo_children():
            w.destroy()
        self._build()
