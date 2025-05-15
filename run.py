from flask import Flask, render_template, request
import sqlite3

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('login.html')

@app.route('/login', methods=['POST'])
def login():
    email = request.form['email']
    password = request.form['password']

    conn = sqlite3.connect('society.db')
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.close()

    if user and user[3] == password:
        return f"Welcome, {user[1]}!"
    else:
        return render_template('login.html', error="Invalid credentials")

if __name__ == '__main__':
    app.run(debug=True, port=8080)
