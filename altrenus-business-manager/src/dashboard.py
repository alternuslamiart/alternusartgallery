import customtkinter as ctk
import matplotlib.pyplot as plt
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from datetime import datetime


ACCENT   = "#3B82F6"
SUCCESS  = "#22C55E"
DANGER   = "#EF4444"
WARNING  = "#F59E0B"
MUTED    = "#6B7280"


class DashboardFrame(ctk.CTkFrame):
    def __init__(self, parent, db):
        super().__init__(parent, fg_color="transparent")
        self.db = db
        self._build()

    def _build(self):
        # Title row
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.pack(fill="x", padx=20, pady=(20, 0))
        ctk.CTkLabel(header, text="Paneli Kryesor", font=("Segoe UI", 22, "bold")).pack(side="left")
        now = datetime.now().strftime("%A, %d %B %Y")
        ctk.CTkLabel(header, text=now, font=("Segoe UI", 12), text_color=MUTED).pack(side="right", padx=4)

        # KPI cards row
        kpi_row = ctk.CTkFrame(self, fg_color="transparent")
        kpi_row.pack(fill="x", padx=20, pady=16)
        for i in range(4):
            kpi_row.columnconfigure(i, weight=1, uniform="kpi")

        summary = self.db.get_financial_summary()
        income   = summary['total_income']  or 0
        expense  = summary['total_expense'] or 0
        balance  = summary['balance']       or 0
        clients  = self.db.get_customer_count()
        due_today = self.db.get_tasks_due_today()

        kpis = [
            ("💰 Të Ardhura",   f"€{income:,.2f}",   SUCCESS),
            ("💸 Shpenzime",    f"€{expense:,.2f}",  DANGER),
            ("📊 Bilanci",      f"€{balance:,.2f}",  ACCENT),
            ("👥 Klientë",      str(clients),        WARNING),
        ]
        for col, (label, value, color) in enumerate(kpis):
            card = ctk.CTkFrame(kpi_row, corner_radius=12)
            card.grid(row=0, column=col, padx=6, sticky="nsew", ipady=8)
            ctk.CTkLabel(card, text=label, font=("Segoe UI", 11), text_color=MUTED).pack(anchor="w", padx=16, pady=(14, 2))
            ctk.CTkLabel(card, text=value, font=("Segoe UI", 24, "bold"), text_color=color).pack(anchor="w", padx=16, pady=(0, 14))

        # Tasks due today banner
        if due_today:
            banner = ctk.CTkFrame(self, fg_color=("#FEF3C7", "#422006"), corner_radius=10)
            banner.pack(fill="x", padx=20, pady=(0, 12))
            ctk.CTkLabel(banner, text=f"⚠️  {due_today} detyrë skadon sot!", font=("Segoe UI", 12, "bold"), text_color=WARNING).pack(side="left", padx=16, pady=10)

        # Charts row
        charts = ctk.CTkFrame(self, fg_color="transparent")
        charts.pack(fill="both", expand=True, padx=20, pady=(0, 20))
        charts.columnconfigure(0, weight=3)
        charts.columnconfigure(1, weight=2)
        charts.rowconfigure(0, weight=1)

        self._bar_chart(charts)
        self._pie_chart(charts)

    def _bar_chart(self, parent):
        frame = ctk.CTkFrame(parent, corner_radius=12)
        frame.grid(row=0, column=0, padx=(0, 8), sticky="nsew")
        ctk.CTkLabel(frame, text="Të Ardhura vs Shpenzime (6 muaj)", font=("Segoe UI", 13, "bold")).pack(anchor="w", padx=16, pady=(14, 4))

        data   = self.db.get_monthly_data(6)
        months = [r['month']  for r in data] or ['—']
        income = [r['income'] for r in data] or [0]
        expen  = [r['expense'] for r in data] or [0]

        is_dark = ctk.get_appearance_mode() == "Dark"
        bg  = "#2b2b2b" if is_dark else "#f9fafb"
        txt = "#e0e0e0" if is_dark else "#111827"

        fig, ax = plt.subplots(figsize=(5.5, 3), facecolor=bg)
        ax.set_facecolor(bg)
        x = range(len(months))
        w = 0.35
        ax.bar([i - w/2 for i in x], income, width=w, label="Të ardhura", color=SUCCESS, alpha=0.85, zorder=3)
        ax.bar([i + w/2 for i in x], expen,  width=w, label="Shpenzime",  color=DANGER,  alpha=0.85, zorder=3)
        ax.set_xticks(list(x))
        ax.set_xticklabels(months, fontsize=8, color=txt)
        ax.tick_params(colors=txt)
        ax.spines[:].set_visible(False)
        ax.yaxis.grid(True, color="#444" if is_dark else "#e5e7eb", zorder=0)
        ax.set_axisbelow(True)
        ax.legend(fontsize=8, labelcolor=txt, framealpha=0)
        fig.tight_layout(pad=0.5)

        canvas = FigureCanvasTkAgg(fig, master=frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True, padx=8, pady=(0, 12))
        plt.close(fig)

    def _pie_chart(self, parent):
        frame = ctk.CTkFrame(parent, corner_radius=12)
        frame.grid(row=0, column=1, padx=(8, 0), sticky="nsew")
        ctk.CTkLabel(frame, text="Shpenzime sipas Kategorisë", font=("Segoe UI", 13, "bold")).pack(anchor="w", padx=16, pady=(14, 4))

        data = self.db.get_category_totals('expense')
        is_dark = ctk.get_appearance_mode() == "Dark"
        bg  = "#2b2b2b" if is_dark else "#f9fafb"
        txt = "#e0e0e0" if is_dark else "#111827"

        fig, ax = plt.subplots(figsize=(3.5, 3), facecolor=bg)
        ax.set_facecolor(bg)
        if data:
            labels = [r['category'] for r in data]
            sizes  = [r['total']    for r in data]
            colors = [DANGER, WARNING, ACCENT, SUCCESS, "#8B5CF6", "#EC4899"]
            wedges, texts, autotexts = ax.pie(
                sizes, labels=labels, colors=colors[:len(sizes)],
                autopct='%1.0f%%', startangle=140,
                textprops={'color': txt, 'fontsize': 8},
                wedgeprops={'linewidth': 0}
            )
            for at in autotexts:
                at.set_color(txt)
        else:
            ax.text(0.5, 0.5, "Nuk ka të dhëna", ha='center', va='center',
                    color=MUTED, fontsize=10, transform=ax.transAxes)
        fig.tight_layout(pad=0.3)

        canvas = FigureCanvasTkAgg(fig, master=frame)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True, padx=8, pady=(0, 12))
        plt.close(fig)

    def refresh(self):
        for w in self.winfo_children():
            w.destroy()
        self._build()
