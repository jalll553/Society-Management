import sqlite3

conn = sqlite3.connect('society.db')
cursor = conn.cursor()

# Create users table with role column
cursor.execute('''
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'user'))
)
''')

# Insert a test admin user and test normal user
cursor.execute('''
INSERT OR IGNORE INTO users (name, email, password, role)
VALUES (?, ?, ?, ?)
''', ("Admin User", "admin@example.com", "adminpass", "admin"))

cursor.execute('''
INSERT OR IGNORE INTO users (name, email, password, role)
VALUES (?, ?, ?, ?)
''', ("Normal User", "user@example.com", "userpass", "user"))

conn.commit()
conn.close()

print("Database initialized with admin and user accounts.")
