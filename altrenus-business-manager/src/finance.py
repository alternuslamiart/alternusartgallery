import customtkinter as ctk
from tkinter import messagebox
from datetime import datetime


ACCENT  = "#3B82F6"
SUCCESS = "#22C55E"
DANGER  = "#EF4444"
WARNING = "#F59E0B"
MUTED   = "#6B7280"

INCOME_CATS  = ["Shitje", "Shërbime", "Komision", "Konsulencë", "Tjetër"]
EXPENSE_CATS = ["Qira", "Pagat", "Marketing", "Furnizime", "Tatim", "Transport", "Tjetër"]


class FinanceFrame(ctk.CTkFrame):
    def __init__(self, parent, db):
        super().__init__(parent, fg_color="transparent")
        self.db = db
        self._filter_type = ctk.StringVar(value="Të gjitha")
        self._build()

    def _build(self):
        # Header
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.pack(fill="x", padx=20, pady=(20, 0))
        ctk.CTkLabel(header, text="Menaxhimi Financiar", font=("Segoe UI", 22, "bold")).pack(side="left")

        btn_frame = ctk.CTkFrame(header, fg_color="transparent")
        btn_frame.pack(side="right")
        ctk.CTkButton(btn_frame, text="+ Të Ardhura", width=130, fg_color=SUCCESS,
                      command=lambda: self._open_dialog('income')).pack(side="left", padx=4)
        ctk.CTkButton(btn_frame, text="+ Shpenzim", width=130, fg_color=DANGER,
                      command=lambda: self._open_dialog('expense')).pack(side="left", padx=4)

        # Summary cards
        summary = self.db.get_financial_summary()
        income  = summary['total_income']  or 0
        expense = summary['total_expense'] or 0
        balance = summary['balance']       or 0

        cards_row = ctk.CTkFrame(self, fg_color="transparent")
        cards_row.pack(fill="x", padx=20, pady=14)
        for i in range(3):
            cards_row.columnconfigure(i, weight=1, uniform="fc")

        for col, (title, val, color) in enumerate([
            ("💰 Të Ardhura Totale", f"€{income:,.2f}",  SUCCESS),
            ("💸 Shpenzime Totale",  f"€{expense:,.2f}", DANGER),
            ("📊 Bilanci Net",       f"€{balance:,.2f}", ACCENT if balance >= 0 else DANGER),
        ]):
            card = ctk.CTkFrame(cards_row, corner_radius=12)
            card.grid(row=0, column=col, padx=6, sticky="nsew", ipady=6)
            ctk.CTkLabel(card, text=title, font=("Segoe UI", 11), text_color=MUTED).pack(anchor="w", padx=14, pady=(12, 2))
            ctk.CTkLabel(card, text=val, font=("Segoe UI", 22, "bold"), text_color=color).pack(anchor="w", padx=14, pady=(0, 12))

        # Filter tabs
        filter_row = ctk.CTkFrame(self, fg_color="transparent")
        filter_row.pack(fill="x", padx=20, pady=(0, 8))
        ctk.CTkLabel(filter_row, text="Filtro:", text_color=MUTED).pack(side="left", padx=(0, 8))
        for label, val in [("Të gjitha", "Të gjitha"), ("Të Ardhura", "income"), ("Shpenzime", "expense")]:
            ctk.CTkButton(filter_row, text=label, width=110, height=30,
                          fg_color=ACCENT if self._filter_type.get() == val else ("white", "#374151"),
                          text_color=("black", "white") if self._filter_type.get() != val else "white",
                          command=lambda v=val: self._set_filter(v)).pack(side="left", padx=3)

        # Table
        table = ctk.CTkFrame(self, corner_radius=12)
        table.pack(fill="both", expand=True, padx=20, pady=(0, 20))

        cols = [("ID", 50), ("Lloji", 90), ("Shuma", 110), ("Kategoria", 140),
                ("Përshkrimi", 220), ("Klienti", 150), ("Data", 100), ("", 60)]
        hdr = ctk.CTkFrame(table, fg_color=("#E5E7EB", "#374151"), corner_radius=8)
        hdr.pack(fill="x", padx=8, pady=(8, 0))
        for col, w in cols:
            ctk.CTkLabel(hdr, text=col, font=("Segoe UI", 11, "bold"), width=w, anchor="w").pack(side="left", padx=6, pady=6)

        self._rows_frame = ctk.CTkScrollableFrame(table, fg_color="transparent")
        self._rows_frame.pack(fill="both", expand=True, padx=8, pady=4)
        self._load_table()

    def _set_filter(self, val):
        self._filter_type.set(val)
        for w in self.winfo_children():
            w.destroy()
        self._build()

    def _load_table(self):
        for w in self._rows_frame.winfo_children():
            w.destroy()
        ft = self._filter_type.get()
        rows = self.db.get_transactions(None if ft == 'Të gjitha' else ft)
        if not rows:
            ctk.CTkLabel(self._rows_frame, text="Nuk ka transaksione.", text_color=MUTED).pack(pady=20)
            return
        for i, r in enumerate(rows):
            bg = ("#F9FAFB", "#1f2937") if i % 2 == 0 else ("white", "#111827")
            row = ctk.CTkFrame(self._rows_frame, fg_color=bg, corner_radius=6)
            row.pack(fill="x", pady=1)
            is_income = r['type'] == 'income'
            ctk.CTkLabel(row, text=str(r['id']),                     width=50,  anchor="w").pack(side="left", padx=6, pady=5)
            ctk.CTkLabel(row, text="⬆ Ardhur" if is_income else "⬇ Shpenzim",
                         width=90, text_color=SUCCESS if is_income else DANGER, anchor="w").pack(side="left", padx=6)
            ctk.CTkLabel(row, text=f"€{r['amount']:,.2f}",           width=110, anchor="w",
                         text_color=SUCCESS if is_income else DANGER).pack(side="left", padx=6)
            ctk.CTkLabel(row, text=r['category'] or "—",             width=140, anchor="w").pack(side="left", padx=6)
            ctk.CTkLabel(row, text=r['description'] or "—",          width=220, anchor="w").pack(side="left", padx=6)
            ctk.CTkLabel(row, text=r['customer_name'] or "—",        width=150, anchor="w").pack(side="left", padx=6)
            ctk.CTkLabel(row, text=r['date'] or "—",                 width=100, anchor="w").pack(side="left", padx=6)
            tid = r['id']
            ctk.CTkButton(row, text="🗑", width=36, height=26, fg_color=DANGER,
                          command=lambda id=tid: self._delete(id)).pack(side="left", padx=4)

    def _open_dialog(self, type_):
        dlg = ctk.CTkToplevel(self)
        dlg.title("Shto Të Ardhura" if type_ == 'income' else "Shto Shpenzim")
        dlg.geometry("440x400")
        dlg.grab_set()
        dlg.resizable(False, False)

        title_text = "💰 Të Ardhura" if type_ == 'income' else "💸 Shpenzim"
        ctk.CTkLabel(dlg, text=title_text, font=("Segoe UI", 16, "bold")).pack(pady=(20, 10))

        fields = {}
        for label, key, placeholder in [
            ("Shuma (€) *", "amount", "p.sh. 150.00"),
            ("Përshkrimi",  "desc",   "Përshkrim i shkurtër"),
        ]:
            row = ctk.CTkFrame(dlg, fg_color="transparent")
            row.pack(fill="x", padx=24, pady=5)
            ctk.CTkLabel(row, text=label, width=120, anchor="w").pack(side="left")
            var = ctk.StringVar()
            ctk.CTkEntry(row, textvariable=var, width=260, placeholder_text=placeholder).pack(side="left")
            fields[key] = var

        # Category
        cats = INCOME_CATS if type_ == 'income' else EXPENSE_CATS
        cat_var = ctk.StringVar(value=cats[0])
        row = ctk.CTkFrame(dlg, fg_color="transparent")
        row.pack(fill="x", padx=24, pady=5)
        ctk.CTkLabel(row, text="Kategoria", width=120, anchor="w").pack(side="left")
        ctk.CTkOptionMenu(row, variable=cat_var, values=cats, width=260).pack(side="left")

        # Customer
        cust_map = self.db.get_customer_names()
        cust_names = ["—"] + list(cust_map.keys())
        cust_var = ctk.StringVar(value="—")
        row = ctk.CTkFrame(dlg, fg_color="transparent")
        row.pack(fill="x", padx=24, pady=5)
        ctk.CTkLabel(row, text="Klienti", width=120, anchor="w").pack(side="left")
        ctk.CTkOptionMenu(row, variable=cust_var, values=cust_names, width=260).pack(side="left")

        # Date
        date_var = ctk.StringVar(value=datetime.now().strftime('%Y-%m-%d'))
        row = ctk.CTkFrame(dlg, fg_color="transparent")
        row.pack(fill="x", padx=24, pady=5)
        ctk.CTkLabel(row, text="Data (YYYY-MM-DD)", width=120, anchor="w").pack(side="left")
        ctk.CTkEntry(row, textvariable=date_var, width=260).pack(side="left")

        def save():
            try:
                amount = float(fields['amount'].get().replace(',', '.'))
            except ValueError:
                messagebox.showerror("Gabim", "Shuma duhet të jetë një numër!")
                return
            if amount <= 0:
                messagebox.showerror("Gabim", "Shuma duhet të jetë pozitive!")
                return
            cid = cust_map.get(cust_var.get()) if cust_var.get() != "—" else None
            self.db.add_transaction(type_, amount, cat_var.get(),
                                    fields['desc'].get(), cid, date_var.get())
            dlg.destroy()
            for w in self.winfo_children():
                w.destroy()
            self._build()

        color = SUCCESS if type_ == 'income' else DANGER
        ctk.CTkButton(dlg, text="💾 Ruaj", fg_color=color, width=200, command=save).pack(pady=18)

    def _delete(self, id):
        if messagebox.askyesno("Konfirmo", "A jeni i sigurt që doni të fshini këtë transaksion?"):
            self.db.delete_transaction(id)
            for w in self.winfo_children():
                w.destroy()
            self._build()

    def refresh(self):
        for w in self.winfo_children():
            w.destroy()
        self._build()
