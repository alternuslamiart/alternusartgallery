import customtkinter as ctk
from tkinter import messagebox


ACCENT  = "#3B82F6"
SUCCESS = "#22C55E"
DANGER  = "#EF4444"
MUTED   = "#6B7280"


class CustomersFrame(ctk.CTkFrame):
    def __init__(self, parent, db):
        super().__init__(parent, fg_color="transparent")
        self.db = db
        self._selected_id = None
        self._build()

    def _build(self):
        # Header
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.pack(fill="x", padx=20, pady=(20, 0))
        ctk.CTkLabel(header, text="Menaxhimi i Klientëve", font=("Segoe UI", 22, "bold")).pack(side="left")

        btn_frame = ctk.CTkFrame(header, fg_color="transparent")
        btn_frame.pack(side="right")
        ctk.CTkButton(btn_frame, text="+ Shto Klient", width=130, fg_color=ACCENT,
                      command=self._open_add_dialog).pack(side="left", padx=4)

        # Search bar
        search_row = ctk.CTkFrame(self, fg_color="transparent")
        search_row.pack(fill="x", padx=20, pady=12)
        self._search_var = ctk.StringVar()
        self._search_var.trace_add("write", lambda *_: self._load_table())
        ctk.CTkEntry(search_row, textvariable=self._search_var,
                     placeholder_text="🔍  Kërko sipas emrit, emailit, telefonit...",
                     width=340, height=36).pack(side="left")

        # Table
        table_frame = ctk.CTkFrame(self, corner_radius=12)
        table_frame.pack(fill="both", expand=True, padx=20, pady=(0, 20))

        # Column headers
        cols = [("ID", 50), ("Emri", 200), ("Email", 200), ("Telefon", 130),
                ("Adresa", 180), ("Statusi", 90), ("Veprime", 120)]
        header_row = ctk.CTkFrame(table_frame, fg_color=("#E5E7EB", "#374151"), corner_radius=8)
        header_row.pack(fill="x", padx=8, pady=(8, 0))
        for col, w in cols:
            ctk.CTkLabel(header_row, text=col, font=("Segoe UI", 11, "bold"), width=w, anchor="w").pack(side="left", padx=6, pady=6)

        # Scrollable rows
        self._rows_frame = ctk.CTkScrollableFrame(table_frame, fg_color="transparent")
        self._rows_frame.pack(fill="both", expand=True, padx=8, pady=4)
        self._load_table()

    def _load_table(self):
        for w in self._rows_frame.winfo_children():
            w.destroy()
        customers = self.db.get_customers(self._search_var.get())
        if not customers:
            ctk.CTkLabel(self._rows_frame, text="Nuk ka klientë akoma.", text_color=MUTED).pack(pady=20)
            return
        for i, c in enumerate(customers):
            bg = ("#F9FAFB", "#1f2937") if i % 2 == 0 else ("white", "#111827")
            row = ctk.CTkFrame(self._rows_frame, fg_color=bg, corner_radius=6)
            row.pack(fill="x", pady=1)
            ctk.CTkLabel(row, text=str(c['id']),      width=50,  anchor="w").pack(side="left", padx=6, pady=6)
            ctk.CTkLabel(row, text=c['name'],         width=200, anchor="w").pack(side="left", padx=6)
            ctk.CTkLabel(row, text=c['email'] or "—", width=200, anchor="w").pack(side="left", padx=6)
            ctk.CTkLabel(row, text=c['phone'] or "—", width=130, anchor="w").pack(side="left", padx=6)
            ctk.CTkLabel(row, text=c['address'] or "—", width=180, anchor="w").pack(side="left", padx=6)
            status_color = SUCCESS if c['status'] == 'Aktiv' else MUTED
            ctk.CTkLabel(row, text=c['status'], width=90, text_color=status_color, anchor="w").pack(side="left", padx=6)
            btn_box = ctk.CTkFrame(row, fg_color="transparent")
            btn_box.pack(side="left", padx=4)
            cid = c['id']
            ctk.CTkButton(btn_box, text="✏️", width=36, height=26, fg_color=ACCENT,
                          command=lambda id=cid: self._open_edit_dialog(id)).pack(side="left", padx=2)
            ctk.CTkButton(btn_box, text="🗑", width=36, height=26, fg_color=DANGER,
                          command=lambda id=cid: self._delete(id)).pack(side="left", padx=2)

    def _open_add_dialog(self):
        self._open_dialog()

    def _open_edit_dialog(self, id):
        customers = {c['id']: c for c in self.db.get_customers()}
        self._open_dialog(customers.get(id))

    def _open_dialog(self, customer=None):
        dlg = ctk.CTkToplevel(self)
        dlg.title("Shto Klient" if not customer else "Ndrysho Klient")
        dlg.geometry("460x440")
        dlg.grab_set()
        dlg.resizable(False, False)

        ctk.CTkLabel(dlg, text="Shto Klient" if not customer else "Ndrysho Klient",
                     font=("Segoe UI", 16, "bold")).pack(pady=(20, 12))

        fields = {}
        for label, key in [("Emri *", "name"), ("Email", "email"),
                            ("Telefon", "phone"), ("Adresa", "address")]:
            row = ctk.CTkFrame(dlg, fg_color="transparent")
            row.pack(fill="x", padx=24, pady=4)
            ctk.CTkLabel(row, text=label, width=100, anchor="w").pack(side="left")
            var = ctk.StringVar(value=(customer[key] if customer else ""))
            ctk.CTkEntry(row, textvariable=var, width=280).pack(side="left")
            fields[key] = var

        # Status (edit only)
        status_var = ctk.StringVar(value=customer['status'] if customer else 'Aktiv')
        if customer:
            row = ctk.CTkFrame(dlg, fg_color="transparent")
            row.pack(fill="x", padx=24, pady=4)
            ctk.CTkLabel(row, text="Statusi", width=100, anchor="w").pack(side="left")
            ctk.CTkOptionMenu(row, variable=status_var, values=["Aktiv", "Joaktiv"], width=280).pack(side="left")

        # Notes
        row = ctk.CTkFrame(dlg, fg_color="transparent")
        row.pack(fill="x", padx=24, pady=4)
        ctk.CTkLabel(row, text="Shënime", width=100, anchor="nw").pack(side="left")
        notes_box = ctk.CTkTextbox(row, width=280, height=60)
        notes_box.pack(side="left")
        if customer:
            notes_box.insert("0.0", customer['notes'] or "")

        def save():
            name = fields['name'].get().strip()
            if not name:
                messagebox.showerror("Gabim", "Emri është i detyrueshëm!")
                return
            notes = notes_box.get("0.0", "end").strip()
            if customer:
                self.db.update_customer(customer['id'], name, fields['email'].get(),
                                        fields['phone'].get(), fields['address'].get(),
                                        notes, status_var.get())
            else:
                self.db.add_customer(name, fields['email'].get(),
                                     fields['phone'].get(), fields['address'].get(), notes)
            dlg.destroy()
            self._load_table()

        ctk.CTkButton(dlg, text="💾 Ruaj", fg_color=ACCENT, width=200, command=save).pack(pady=18)

    def _delete(self, id):
        if messagebox.askyesno("Konfirmo", "A jeni i sigurt që doni të fshini këtë klient?"):
            self.db.delete_customer(id)
            self._load_table()

    def refresh(self):
        self._load_table()
