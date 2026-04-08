"""
Alternus Work Manager
─────────────────────
Desktop business management app built with CustomTkinter.
Run: python src/main.py
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import customtkinter as ctk
from database    import Database
from dashboard   import DashboardFrame
from customers   import CustomersFrame
from finance     import FinanceFrame
from calendar    import CalendarFrame
from reports     import ReportsFrame
from ai_assistant import AIAssistantFrame


# ─── Theme ───────────────────────────────────────────────────────────────────
ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("blue")

ACCENT   = "#3B82F6"
BG_DARK  = "#0f0f17"
SIDEBAR  = "#16161f"
NAV_ACTIVE   = "#1e293b"
NAV_INACTIVE = "transparent"


class WorkManager(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Work Manager — Alternus")
        self.geometry("1280x780")
        self.minsize(1000, 640)

        # Windows taskbar icon title
        try:
            self.iconbitmap(default="")
        except Exception:
            pass

        self.db = Database()
        self._active_tab = None
        self._frames: dict[str, ctk.CTkFrame] = {}
        self._nav_buttons: dict[str, ctk.CTkButton] = {}

        self._build_layout()
        self._nav_to("dashboard")

    # ─── Layout ──────────────────────────────────────────────────────────────

    def _build_layout(self):
        self.grid_rowconfigure(0, weight=1)
        self.grid_columnconfigure(1, weight=1)

        # ── Sidebar ──
        self._sidebar = ctk.CTkFrame(self, width=220, corner_radius=0,
                                      fg_color=SIDEBAR)
        self._sidebar.grid(row=0, column=0, sticky="nsew")
        self._sidebar.grid_propagate(False)

        # Logo
        logo_frame = ctk.CTkFrame(self._sidebar, fg_color="transparent")
        logo_frame.pack(fill="x", pady=(24, 8))
        ctk.CTkLabel(logo_frame, text="⚡ Work Manager",
                     font=("Segoe UI", 16, "bold"),
                     text_color=ACCENT).pack(padx=20, anchor="w")
        ctk.CTkLabel(logo_frame, text="by Alternus",
                     font=("Segoe UI", 10),
                     text_color="#6B7280").pack(padx=20, anchor="w")

        ctk.CTkFrame(self._sidebar, height=1, fg_color="#2d2d3a").pack(fill="x", padx=16, pady=8)

        # Nav items
        nav_items = [
            ("dashboard",    "🏠  Paneli",         DashboardFrame),
            ("customers",    "👥  Klientët",        CustomersFrame),
            ("finance",      "💰  Financat",        FinanceFrame),
            ("calendar",     "📅  Kalendari",       CalendarFrame),
            ("reports",      "📊  Raportet",        ReportsFrame),
            ("ai_assistant", "🤖  Asistenti AI",   AIAssistantFrame),
        ]

        for key, label, FrameClass in nav_items:
            btn = ctk.CTkButton(
                self._sidebar,
                text=label,
                anchor="w",
                height=40,
                width=200,
                font=("Segoe UI", 13),
                fg_color=NAV_INACTIVE,
                text_color="#CBD5E1",
                hover_color="#1e293b",
                corner_radius=8,
                command=lambda k=key: self._nav_to(k),
            )
            btn.pack(padx=10, pady=2)
            self._nav_buttons[key] = btn

            # Lazy-create frame
            frame = FrameClass(self, self.db)
            frame.grid(row=0, column=1, sticky="nsew", padx=0, pady=0)
            frame.grid_remove()
            self._frames[key] = frame

        # Bottom: theme toggle & version
        ctk.CTkFrame(self._sidebar, height=1, fg_color="#2d2d3a").pack(fill="x", padx=16, pady=(16, 8), side="bottom")
        ctk.CTkLabel(self._sidebar, text="v1.0.0 · Alternus", font=("Segoe UI", 9),
                     text_color="#4B5563").pack(side="bottom", pady=(0, 6))

        theme_row = ctk.CTkFrame(self._sidebar, fg_color="transparent")
        theme_row.pack(side="bottom", fill="x", padx=14, pady=4)
        ctk.CTkLabel(theme_row, text="🌙  Tema:", font=("Segoe UI", 11),
                     text_color="#9CA3AF").pack(side="left")
        ctk.CTkSwitch(theme_row, text="", width=44,
                      command=self._toggle_theme).pack(side="right")

        # ── Content area ──
        self.grid_columnconfigure(1, weight=1)
        self.grid_rowconfigure(0, weight=1)

    def _nav_to(self, key: str):
        if self._active_tab:
            self._frames[self._active_tab].grid_remove()
            self._nav_buttons[self._active_tab].configure(
                fg_color=NAV_INACTIVE, text_color="#CBD5E1")

        self._active_tab = key
        frame = self._frames[key]
        frame.grid()
        if hasattr(frame, "refresh"):
            frame.refresh()
        self._nav_buttons[key].configure(fg_color=NAV_ACTIVE, text_color="white")

    def _toggle_theme(self):
        mode = ctk.get_appearance_mode()
        ctk.set_appearance_mode("light" if mode == "Dark" else "dark")
        if self._active_tab and hasattr(self._frames[self._active_tab], "refresh"):
            self._frames[self._active_tab].refresh()

    def on_close(self):
        self.db.close()
        self.destroy()


# ─── Entry point ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app = WorkManager()
    app.protocol("WM_DELETE_WINDOW", app.on_close)
    app.mainloop()
