import customtkinter as ctk
from tkinter import messagebox, filedialog
from datetime import datetime
import os

ACCENT  = "#3B82F6"
SUCCESS = "#22C55E"
MUTED   = "#6B7280"


class ReportsFrame(ctk.CTkFrame):
    def __init__(self, parent, db):
        super().__init__(parent, fg_color="transparent")
        self.db = db
        self._build()

    def _build(self):
        ctk.CTkLabel(self, text="Gjenerimi i Raporteve", font=("Segoe UI", 22, "bold")).pack(
            anchor="w", padx=20, pady=(20, 16))

        grid = ctk.CTkFrame(self, fg_color="transparent")
        grid.pack(fill="both", expand=True, padx=20, pady=(0, 20))
        grid.columnconfigure((0, 1), weight=1, uniform="r")

        cards = [
            ("📊 Raport Financiar",
             "Eksporton të gjitha transaksionet me totalet sipas kategorisë.",
             self._export_finance_csv, ACCENT),
            ("👥 Raport Klientësh",
             "Listë e plotë e klientëve me detajet e tyre.",
             self._export_customers_csv, SUCCESS),
            ("📋 Raport Detyrash",
             "Të gjitha detyrat me statusin dhe prioritetin.",
             self._export_tasks_csv, "#8B5CF6"),
            ("📄 Raport PDF",
             "Raport i plotë i biznesit në format PDF.",
             self._export_pdf, "#EF4444"),
        ]
        for i, (title, desc, cmd, color) in enumerate(cards):
            card = ctk.CTkFrame(grid, corner_radius=14)
            card.grid(row=i // 2, column=i % 2, padx=10, pady=10, sticky="nsew", ipady=10)

            ctk.CTkLabel(card, text=title, font=("Segoe UI", 15, "bold")).pack(anchor="w", padx=20, pady=(18, 4))
            ctk.CTkLabel(card, text=desc, font=("Segoe UI", 11), text_color=MUTED,
                         wraplength=300, justify="left").pack(anchor="w", padx=20)
            ctk.CTkButton(card, text="⬇  Shkarko", fg_color=color, width=160, height=34,
                          command=cmd).pack(anchor="w", padx=20, pady=(14, 20))

        # Quick summary
        summ = ctk.CTkFrame(self, corner_radius=12)
        summ.pack(fill="x", padx=20, pady=(0, 20))
        ctk.CTkLabel(summ, text="Përmbledhje e Shpejtë", font=("Segoe UI", 13, "bold")).pack(anchor="w", padx=16, pady=(14, 6))

        s = self.db.get_financial_summary()
        tc = self.db.get_task_counts()
        cl = self.db.get_customer_count()
        lines = [
            f"💰 Të Ardhura Totale:   €{s['total_income'] or 0:,.2f}",
            f"💸 Shpenzime Totale:    €{s['total_expense'] or 0:,.2f}",
            f"📊 Bilanci Net:         €{s['balance'] or 0:,.2f}",
            f"👥 Klientë Totalë:      {cl}",
            f"📋 Detyra Aktive:       {tc.get('Në progres', 0) + tc.get('Në pritje', 0)}",
            f"✅ Detyra të Kryera:    {tc.get('Përfunduar', 0)}",
        ]
        for line in lines:
            ctk.CTkLabel(summ, text=line, font=("Segoe UI", 12), anchor="w").pack(anchor="w", padx=20, pady=1)
        ctk.CTkLabel(summ, text="").pack(pady=8)

    def _export_finance_csv(self):
        path = filedialog.asksaveasfilename(
            defaultextension=".csv",
            filetypes=[("CSV", "*.csv")],
            initialfile=f"financa_{datetime.now().strftime('%Y%m%d')}.csv"
        )
        if not path:
            return
        rows = self.db.get_transactions()
        try:
            with open(path, 'w', encoding='utf-8-sig') as f:
                f.write("ID,Lloji,Shuma,Kategoria,Përshkrimi,Klienti,Data\n")
                for r in rows:
                    f.write(f"{r['id']},{r['type']},{r['amount']:.2f},"
                            f"{r['category']},{r['description']},"
                            f"{r['customer_name'] or ''},"
                            f"{r['date']}\n")
            messagebox.showinfo("Sukses", f"Eksportuar te:\n{path}")
        except Exception as e:
            messagebox.showerror("Gabim", str(e))

    def _export_customers_csv(self):
        path = filedialog.asksaveasfilename(
            defaultextension=".csv",
            filetypes=[("CSV", "*.csv")],
            initialfile=f"klientet_{datetime.now().strftime('%Y%m%d')}.csv"
        )
        if not path:
            return
        customers = self.db.get_customers()
        try:
            with open(path, 'w', encoding='utf-8-sig') as f:
                f.write("ID,Emri,Email,Telefon,Adresa,Statusi,Krijuar Më\n")
                for c in customers:
                    f.write(f"{c['id']},{c['name']},{c['email']},{c['phone']},"
                            f"{c['address']},{c['status']},{c['created_at']}\n")
            messagebox.showinfo("Sukses", f"Eksportuar te:\n{path}")
        except Exception as e:
            messagebox.showerror("Gabim", str(e))

    def _export_tasks_csv(self):
        path = filedialog.asksaveasfilename(
            defaultextension=".csv",
            filetypes=[("CSV", "*.csv")],
            initialfile=f"detyrat_{datetime.now().strftime('%Y%m%d')}.csv"
        )
        if not path:
            return
        tasks = self.db.get_tasks()
        try:
            with open(path, 'w', encoding='utf-8-sig') as f:
                f.write("ID,Titulli,Prioriteti,Statusi,Data e Skadimit,Klienti,Krijuar Më\n")
                for t in tasks:
                    f.write(f"{t['id']},{t['title']},{t['priority']},{t['status']},"
                            f"{t['due_date'] or ''},{t['customer_name'] or ''},"
                            f"{t['created_at']}\n")
            messagebox.showinfo("Sukses", f"Eksportuar te:\n{path}")
        except Exception as e:
            messagebox.showerror("Gabim", str(e))

    def _export_pdf(self):
        try:
            from fpdf import FPDF
        except ImportError:
            messagebox.showerror("Gabim", "Libraria fpdf2 nuk është instaluar.\nEkzekuto: pip install fpdf2")
            return

        path = filedialog.asksaveasfilename(
            defaultextension=".pdf",
            filetypes=[("PDF", "*.pdf")],
            initialfile=f"raport_biznesi_{datetime.now().strftime('%Y%m%d')}.pdf"
        )
        if not path:
            return
        try:
            pdf = FPDF()
            pdf.add_page()
            pdf.set_font("Helvetica", "B", 18)
            pdf.cell(0, 12, "Raporti i Biznesit - Alternus Work Manager", ln=True, align="C")
            pdf.set_font("Helvetica", "", 10)
            pdf.cell(0, 8, f"Gjeneruar me: {datetime.now().strftime('%d/%m/%Y %H:%M')}", ln=True, align="C")
            pdf.ln(6)

            # Financial summary
            s = self.db.get_financial_summary()
            pdf.set_font("Helvetica", "B", 13)
            pdf.cell(0, 10, "Permbledhje Financiare", ln=True)
            pdf.set_font("Helvetica", "", 11)
            pdf.cell(0, 7, f"  Te Ardhura: EUR {s['total_income'] or 0:,.2f}", ln=True)
            pdf.cell(0, 7, f"  Shpenzime:  EUR {s['total_expense'] or 0:,.2f}", ln=True)
            pdf.cell(0, 7, f"  Bilanci:    EUR {s['balance'] or 0:,.2f}", ln=True)
            pdf.ln(4)

            # Customers
            customers = self.db.get_customers()
            pdf.set_font("Helvetica", "B", 13)
            pdf.cell(0, 10, f"Klientet ({len(customers)})", ln=True)
            pdf.set_font("Helvetica", "", 10)
            for c in customers[:20]:
                pdf.cell(0, 6, f"  {c['name']} - {c['email']} - {c['phone']}", ln=True)
            if len(customers) > 20:
                pdf.cell(0, 6, f"  ... dhe {len(customers) - 20} te tjere", ln=True)
            pdf.ln(4)

            # Tasks
            tasks = self.db.get_tasks()
            pdf.set_font("Helvetica", "B", 13)
            pdf.cell(0, 10, f"Detyrat ({len(tasks)})", ln=True)
            pdf.set_font("Helvetica", "", 10)
            for t in tasks[:20]:
                due = t['due_date'] or "—"
                pdf.cell(0, 6, f"  [{t['status']}] {t['title']} - Skadon: {due}", ln=True)

            pdf.output(path)
            messagebox.showinfo("Sukses", f"PDF u krijua te:\n{path}")
        except Exception as e:
            messagebox.showerror("Gabim", str(e))

    def refresh(self):
        for w in self.winfo_children():
            w.destroy()
        self._build()
