import sqlite3
import os
from datetime import datetime


class Database:
    def __init__(self):
        db_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
        os.makedirs(db_dir, exist_ok=True)
        db_path = os.path.join(db_dir, 'business.db')
        self.conn = sqlite3.connect(db_path, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA foreign_keys = ON")
        self._create_tables()

    def _create_tables(self):
        c = self.conn.cursor()
        c.executescript('''
            CREATE TABLE IF NOT EXISTS customers (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                name        TEXT    NOT NULL,
                email       TEXT    DEFAULT '',
                phone       TEXT    DEFAULT '',
                address     TEXT    DEFAULT '',
                notes       TEXT    DEFAULT '',
                status      TEXT    DEFAULT 'Aktiv',
                created_at  TEXT    DEFAULT (date('now'))
            );

            CREATE TABLE IF NOT EXISTS transactions (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                type        TEXT    NOT NULL CHECK(type IN ('income','expense')),
                amount      REAL    NOT NULL,
                category    TEXT    DEFAULT '',
                description TEXT    DEFAULT '',
                customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
                date        TEXT    DEFAULT (date('now')),
                created_at  TEXT    DEFAULT (datetime('now'))
            );

            CREATE TABLE IF NOT EXISTS tasks (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                title       TEXT    NOT NULL,
                description TEXT    DEFAULT '',
                due_date    TEXT,
                priority    TEXT    DEFAULT 'Normale',
                status      TEXT    DEFAULT 'Në pritje',
                customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
                created_at  TEXT    DEFAULT (datetime('now'))
            );
        ''')
        self.conn.commit()

    # ──────────────────────────── CUSTOMERS ────────────────────────────

    def get_customers(self, search=''):
        q = '%' + search + '%'
        return self.conn.execute(
            'SELECT * FROM customers WHERE name LIKE ? OR email LIKE ? OR phone LIKE ? ORDER BY name',
            (q, q, q)
        ).fetchall()

    def add_customer(self, name, email='', phone='', address='', notes=''):
        c = self.conn.execute(
            'INSERT INTO customers (name,email,phone,address,notes) VALUES (?,?,?,?,?)',
            (name, email, phone, address, notes)
        )
        self.conn.commit()
        return c.lastrowid

    def update_customer(self, id, name, email, phone, address, notes, status):
        self.conn.execute(
            'UPDATE customers SET name=?,email=?,phone=?,address=?,notes=?,status=? WHERE id=?',
            (name, email, phone, address, notes, status, id)
        )
        self.conn.commit()

    def delete_customer(self, id):
        self.conn.execute('DELETE FROM customers WHERE id=?', (id,))
        self.conn.commit()

    def get_customer_count(self):
        return self.conn.execute('SELECT COUNT(*) FROM customers').fetchone()[0]

    def get_customer_names(self):
        rows = self.conn.execute('SELECT id, name FROM customers ORDER BY name').fetchall()
        return {row['name']: row['id'] for row in rows}

    # ──────────────────────────── TRANSACTIONS ─────────────────────────

    def get_transactions(self, type_filter=None, date_from=None, date_to=None):
        q = '''SELECT t.*, c.name AS customer_name
               FROM transactions t LEFT JOIN customers c ON t.customer_id = c.id
               WHERE 1=1'''
        params = []
        if type_filter:
            q += ' AND t.type=?'; params.append(type_filter)
        if date_from:
            q += ' AND t.date>=?'; params.append(date_from)
        if date_to:
            q += ' AND t.date<=?'; params.append(date_to)
        q += ' ORDER BY t.date DESC, t.id DESC'
        return self.conn.execute(q, params).fetchall()

    def add_transaction(self, type_, amount, category='', description='', customer_id=None, date=None):
        date = date or datetime.now().strftime('%Y-%m-%d')
        c = self.conn.execute(
            'INSERT INTO transactions (type,amount,category,description,customer_id,date) VALUES (?,?,?,?,?,?)',
            (type_, amount, category, description, customer_id, date)
        )
        self.conn.commit()
        return c.lastrowid

    def delete_transaction(self, id):
        self.conn.execute('DELETE FROM transactions WHERE id=?', (id,))
        self.conn.commit()

    def get_financial_summary(self):
        return self.conn.execute('''
            SELECT
                COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE 0 END), 0) AS total_income,
                COALESCE(SUM(CASE WHEN type='expense' THEN amount ELSE 0 END), 0) AS total_expense,
                COALESCE(SUM(CASE WHEN type='income'  THEN amount ELSE -amount END), 0) AS balance
            FROM transactions
        ''').fetchone()

    def get_monthly_data(self, months=6):
        rows = self.conn.execute('''
            SELECT strftime('%Y-%m', date) AS month,
                   SUM(CASE WHEN type='income'  THEN amount ELSE 0 END) AS income,
                   SUM(CASE WHEN type='expense' THEN amount ELSE 0 END) AS expense
            FROM transactions
            GROUP BY month ORDER BY month DESC LIMIT ?
        ''', (months,)).fetchall()
        return list(reversed(rows))

    def get_category_totals(self, type_):
        return self.conn.execute('''
            SELECT category, SUM(amount) AS total
            FROM transactions WHERE type=? AND category != ''
            GROUP BY category ORDER BY total DESC
        ''', (type_,)).fetchall()

    # ──────────────────────────── TASKS ────────────────────────────────

    def get_tasks(self, status_filter=None, due_date=None):
        q = '''SELECT t.*, c.name AS customer_name
               FROM tasks t LEFT JOIN customers c ON t.customer_id = c.id
               WHERE 1=1'''
        params = []
        if status_filter and status_filter != 'Të gjitha':
            q += ' AND t.status=?'; params.append(status_filter)
        if due_date:
            q += ' AND t.due_date=?'; params.append(due_date)
        q += ' ORDER BY t.due_date ASC NULLS LAST, t.id DESC'
        return self.conn.execute(q, params).fetchall()

    def add_task(self, title, description='', due_date=None, priority='Normale', customer_id=None):
        c = self.conn.execute(
            'INSERT INTO tasks (title,description,due_date,priority,customer_id) VALUES (?,?,?,?,?)',
            (title, description, due_date, priority, customer_id)
        )
        self.conn.commit()
        return c.lastrowid

    def update_task(self, id, title, description, due_date, priority, status, customer_id):
        self.conn.execute(
            'UPDATE tasks SET title=?,description=?,due_date=?,priority=?,status=?,customer_id=? WHERE id=?',
            (title, description, due_date, priority, status, customer_id, id)
        )
        self.conn.commit()

    def update_task_status(self, id, status):
        self.conn.execute('UPDATE tasks SET status=? WHERE id=?', (status, id))
        self.conn.commit()

    def delete_task(self, id):
        self.conn.execute('DELETE FROM tasks WHERE id=?', (id,))
        self.conn.commit()

    def get_task_counts(self):
        rows = self.conn.execute('SELECT status, COUNT(*) FROM tasks GROUP BY status').fetchall()
        return {r[0]: r[1] for r in rows}

    def get_tasks_due_today(self):
        today = datetime.now().strftime('%Y-%m-%d')
        return self.conn.execute(
            "SELECT COUNT(*) FROM tasks WHERE due_date=? AND status!='Përfunduar'", (today,)
        ).fetchone()[0]

    def close(self):
        self.conn.close()
