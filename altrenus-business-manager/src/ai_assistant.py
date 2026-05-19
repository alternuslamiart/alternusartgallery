"""
AI Assistant — përdor Google Gemini (falas, nuk kërkon kartë krediti).
Merr çelësin falas nga: https://aistudio.google.com/app/apikey
"""

import customtkinter as ctk
import threading
import os
import json
import urllib.request
import urllib.error
from datetime import datetime


ACCENT  = "#3B82F6"
SUCCESS = "#22C55E"
DANGER  = "#EF4444"
MUTED   = "#6B7280"

GEMINI_MODEL = os.environ.get("GEMINI_MODEL", "gemini-3-flash-preview")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"

SYSTEM_PROMPT = """Ti je Alternus Business AI, asistenti i dedikuar për menaxhimin e biznesit shqiptar.

Roli yt:
- Ndihmon me analizën financiare dhe këshilla biznesi
- Ofron rekomandime për menaxhimin e klientëve
- Ndihmon me planifikimin e detyrave dhe projekteve
- Komunikon kryesisht në shqip (ose anglisht nëse pyetet anglisht)

Stili: Profesional, i qartë, praktik. Jep përgjigje konkrete me lista kur ndihmon."""

KEY_FILE = os.path.join(os.path.dirname(__file__), '..', 'data', 'gemini_key.txt')


def _load_saved_key() -> str:
    # 1. saved file
    try:
        if os.path.exists(KEY_FILE):
            key = open(KEY_FILE).read().strip()
            if key:
                return key
    except Exception:
        pass
    # 2. environment variable (same key used in the gallery project)
    return os.environ.get("GEMINI_API_KEY", "")


def _save_key(key: str):
    os.makedirs(os.path.dirname(KEY_FILE), exist_ok=True)
    with open(KEY_FILE, 'w') as f:
        f.write(key)


class AIAssistantFrame(ctk.CTkFrame):
    def __init__(self, parent, db):
        super().__init__(parent, fg_color="transparent")
        self.db = db
        self._history: list[dict] = []
        self._api_key = _load_saved_key()
        self._build()

    # ─── UI ──────────────────────────────────────────────────────────────────

    def _build(self):
        # Header
        header = ctk.CTkFrame(self, fg_color="transparent")
        header.pack(fill="x", padx=20, pady=(20, 0))
        ctk.CTkLabel(header, text="🤖 Asistenti AI i Biznesit",
                     font=("Segoe UI", 22, "bold")).pack(side="left")
        ctk.CTkLabel(header, text=f"{GEMINI_MODEL} · Falas",
                     font=("Segoe UI", 11), text_color=SUCCESS).pack(side="right", padx=4)

        # API Key setup bar
        self._key_bar = ctk.CTkFrame(self, corner_radius=10,
                                      fg_color=("#FEF3C7", "#422006") if not self._api_key
                                      else ("#D1FAE5", "#14532d"))
        self._key_bar.pack(fill="x", padx=20, pady=8)
        self._build_key_bar()

        # Quick prompts
        pf = ctk.CTkFrame(self, fg_color="transparent")
        pf.pack(fill="x", padx=20, pady=(4, 0))
        ctk.CTkLabel(pf, text="Shpejt:", font=("Segoe UI", 10), text_color=MUTED).pack(side="left", padx=(0, 6))
        for q in ["Analizë financiare", "Këshilla rritjeje", "Si të kursej?", "Plan marketingu"]:
            ctk.CTkButton(pf, text=q, height=26, width=130, font=("Segoe UI", 10),
                          fg_color=("white", "#374151"), text_color=("black", "white"),
                          border_width=1, border_color=("#D1D5DB", "#4B5563"),
                          command=lambda t=q: self._send_message(t)).pack(side="left", padx=2)

        # Chat area
        self._chat_box = ctk.CTkScrollableFrame(self, fg_color="transparent")
        self._chat_box.pack(fill="both", expand=True, padx=20, pady=8)
        self._add_bubble("ai", "Mirë se vini! Jam asistenti juaj AI i biznesit, i fuqizuar nga Google Gemini. "
                               "Si mund t'ju ndihmoj sot? 🚀")

        # Input row
        ir = ctk.CTkFrame(self, fg_color="transparent")
        ir.pack(fill="x", padx=20, pady=(0, 16))
        self._input_var = ctk.StringVar()
        self._entry = ctk.CTkEntry(ir, textvariable=self._input_var,
                                    placeholder_text="Shkruaj pyetjen...",
                                    height=40, font=("Segoe UI", 12))
        self._entry.pack(side="left", fill="x", expand=True, padx=(0, 8))
        self._entry.bind("<Return>", lambda e: self._send_message())
        self._send_btn = ctk.CTkButton(ir, text="➤ Dërgo", width=100, height=40,
                                        fg_color=ACCENT, command=self._send_message)
        self._send_btn.pack(side="right")
        ctk.CTkButton(ir, text="🗑", width=40, height=40,
                      fg_color=("white", "#374151"), text_color=("black", "white"),
                      command=self._clear_chat).pack(side="right", padx=(0, 6))

    def _build_key_bar(self):
        for w in self._key_bar.winfo_children():
            w.destroy()

        if self._api_key:
            ctk.CTkLabel(self._key_bar,
                         text=f"✅  Çelësi i konfiguruar: {self._api_key[:8]}••••",
                         text_color="#15803D", font=("Segoe UI", 11)).pack(side="left", padx=12, pady=8)
            ctk.CTkButton(self._key_bar, text="Ndrysho", width=80, height=26,
                          fg_color=("white", "#1f2937"), text_color=("black", "white"),
                          command=self._show_key_input).pack(side="right", padx=10)
        else:
            ctk.CTkLabel(self._key_bar,
                         text="🔑  Vendos çelësin falas nga aistudio.google.com",
                         text_color="#B45309", font=("Segoe UI", 11)).pack(side="left", padx=10, pady=8)
            self._key_entry_var = ctk.StringVar()
            e = ctk.CTkEntry(self._key_bar, textvariable=self._key_entry_var,
                             placeholder_text="AIza...", width=280, show="*")
            e.pack(side="left", padx=6)
            ctk.CTkButton(self._key_bar, text="Ruaj", width=70, height=30,
                          fg_color=ACCENT, command=self._do_save_key).pack(side="left", padx=4)
            ctk.CTkButton(self._key_bar, text="📋 Si ta marr?", width=110, height=30,
                          fg_color="transparent", text_color=ACCENT,
                          command=self._show_help).pack(side="left", padx=2)

    def _show_key_input(self):
        self._api_key = ""
        self._key_bar.configure(fg_color=("#FEF3C7", "#422006"))
        self._build_key_bar()

    def _do_save_key(self):
        key = self._key_entry_var.get().strip()
        if not key.startswith("AIza"):
            from tkinter import messagebox
            messagebox.showerror("Gabim", "Çelësi duhet të fillojë me 'AIza'.\nMerr çelësin falas nga aistudio.google.com")
            return
        self._api_key = key
        _save_key(key)
        self._key_bar.configure(fg_color=("#D1FAE5", "#14532d"))
        self._build_key_bar()

    def _show_help(self):
        dlg = ctk.CTkToplevel(self)
        dlg.title("Si ta marrësh çelësin falas?")
        dlg.geometry("480x320")
        dlg.grab_set()
        steps = (
            "Si të marrësh çelësin FALAS të Google Gemini:\n\n"
            "1️⃣  Hap shfletuesin dhe shko te:\n"
            "     👉  aistudio.google.com/app/apikey\n\n"
            "2️⃣  Kyçu me llogarinë tënde Google\n\n"
            "3️⃣  Kliko  'Create API Key'\n\n"
            "4️⃣  Kopjo çelësin (fillon me 'AIza...')\n\n"
            "5️⃣  Ngjite këtu dhe kliko 'Ruaj'\n\n"
            "✅  Falas — nuk kërkon kartë krediti!"
        )
        ctk.CTkLabel(dlg, text=steps, font=("Segoe UI", 12), justify="left",
                     wraplength=440).pack(padx=24, pady=24)
        ctk.CTkButton(dlg, text="OK", width=120, fg_color=ACCENT,
                      command=dlg.destroy).pack(pady=(0, 16))

    # ─── Messaging ───────────────────────────────────────────────────────────

    def _send_message(self, text=None):
        msg = text or self._input_var.get().strip()
        if not msg:
            return
        if not self._api_key:
            self._add_bubble("ai", "⚠️  Vendos çelësin Gemini fillimisht (shih udhëzimet lart).")
            return
        self._input_var.set("")
        self._add_bubble("user", msg)
        self._history.append({"role": "user", "parts": [{"text": msg}]})
        self._send_btn.configure(state="disabled", text="⏳")
        threading.Thread(target=self._call_gemini, daemon=True).start()

    def _call_gemini(self):
        # Build business context
        try:
            s   = self.db.get_financial_summary()
            nc  = self.db.get_customer_count()
            tc  = self.db.get_task_counts()
            ctx = (f"\n\n[Konteksti: Të ardhura €{s['total_income'] or 0:.2f}, "
                   f"Shpenzime €{s['total_expense'] or 0:.2f}, "
                   f"Bilanci €{s['balance'] or 0:.2f}, "
                   f"Klientë: {nc}, "
                   f"Detyra aktive: {tc.get('Në pritje', 0) + tc.get('Në progres', 0)}]")
        except Exception:
            ctx = ""

        payload = {
            "systemInstruction": {"parts": [{"text": SYSTEM_PROMPT + ctx}]},
            "contents": self._history[-16:],
            "generationConfig": {"temperature": 0.7, "maxOutputTokens": 1024},
        }

        try:
            data   = json.dumps(payload).encode("utf-8")
            req    = urllib.request.Request(GEMINI_URL, data=data,
                                             headers={
                                                 "Content-Type": "application/json",
                                                 "x-goog-api-key": self._api_key,
                                             })
            with urllib.request.urlopen(req, timeout=30) as resp:
                result = json.loads(resp.read().decode("utf-8"))
            text = result["candidates"][0]["content"]["parts"][0]["text"]
            self._history.append({"role": "model", "parts": [{"text": text}]})
            self._after_response(text)
        except urllib.error.HTTPError as e:
            body = e.read().decode()
            if "API_KEY_INVALID" in body or e.code == 400:
                self._after_response("❌ Çelësi API është i pavlefshëm. Kontrollo dhe vendos sërish.")
            else:
                self._after_response(f"❌ Gabim nga serveri ({e.code}). Provo përsëri.")
        except Exception as e:
            self._after_response(f"❌ Gabim lidhjeje: {str(e)}")

    def _after_response(self, text: str):
        self.after(0, lambda: self._add_bubble("ai", text))
        self.after(0, lambda: self._send_btn.configure(state="normal", text="➤ Dërgo"))

    # ─── Bubbles ─────────────────────────────────────────────────────────────

    def _add_bubble(self, role: str, text: str):
        is_ai = role == "ai"
        wrapper = ctk.CTkFrame(self._chat_box, fg_color="transparent")
        wrapper.pack(fill="x", pady=4)

        bubble = ctk.CTkFrame(
            wrapper,
            fg_color=(("#EFF6FF", "#1e3a5f") if is_ai else ("#F3F4F6", "#374151")),
            corner_radius=12,
        )
        bubble.pack(side="left" if is_ai else "right",
                    padx=(0 if is_ai else 80, 80 if is_ai else 0))

        if is_ai:
            top = ctk.CTkFrame(bubble, fg_color="transparent")
            top.pack(anchor="w", padx=12, pady=(8, 0))
            ctk.CTkLabel(top, text="🤖 Alternus AI", font=("Segoe UI", 9, "bold"),
                         text_color=ACCENT).pack(side="left")

        ctk.CTkLabel(bubble, text=text, wraplength=500, justify="left",
                     font=("Segoe UI", 12), anchor="w").pack(
            padx=14, pady=(4 if is_ai else 10, 10))

        ctk.CTkLabel(wrapper, text=datetime.now().strftime("%H:%M"),
                     font=("Segoe UI", 9), text_color=MUTED).pack(
            side="left" if is_ai else "right", padx=4)

        self.after(80, lambda: self._chat_box._parent_canvas.yview_moveto(1.0))

    def _clear_chat(self):
        self._history.clear()
        for w in self._chat_box.winfo_children():
            w.destroy()
        self._add_bubble("ai", "Biseda u pastrua. Si mund t'ju ndihmoj? 🚀")

    def refresh(self):
        pass
