# Example CTF challenge: SQLi login bypass
#
# Intentionally vulnerable — for use ONLY inside the isolated,
# network-restricted, resource-limited sandbox described in
# /docs/ctf-sandbox-design.md. Never expose this directly to the
# internet or run it outside that sandbox.
#
# The flag is injected via the FLAG environment variable at container
# start (see docs/ctf-sandbox-design.md) rather than hardcoded here.

from flask import Flask, request, render_template_string
import sqlite3
import os

app = Flask(__name__)
FLAG = os.environ.get("FLAG", "SENTINEL{local_test_flag}")

LOGIN_PAGE = """
<h2>Staff Portal Login</h2>
<form method="post">
  Username: <input name="username"><br>
  Password: <input name="password" type="password"><br>
  <button type="submit">Log in</button>
</form>
{% if message %}<p>{{ message }}</p>{% endif %}
"""


def get_db():
    conn = sqlite3.connect(":memory:")
    conn.execute("CREATE TABLE users (username TEXT, password TEXT, role TEXT)")
    conn.execute(
        "INSERT INTO users VALUES ('admin', 'not-the-real-password', 'admin')"
    )
    conn.execute(
        "INSERT INTO users VALUES ('guest', 'guest123', 'guest')"
    )
    return conn


@app.route("/", methods=["GET", "POST"])
def login():
    if request.method != "POST":
        return render_template_string(LOGIN_PAGE, message=None)

    username = request.form.get("username", "")
    password = request.form.get("password", "")

    # Intentionally vulnerable: string-built query, the bug this
    # challenge teaches learners to find and exploit.
    conn = get_db()
    query = (
        f"SELECT * FROM users WHERE username = '{username}' "
        f"AND password = '{password}'"
    )
    try:
        row = conn.execute(query).fetchone()
    except sqlite3.OperationalError as e:
        return render_template_string(LOGIN_PAGE, message=f"DB error: {e}")

    if row and row[2] == "admin":
        return render_template_string(LOGIN_PAGE, message=f"Welcome admin. Flag: {FLAG}")
    if row:
        return render_template_string(LOGIN_PAGE, message=f"Welcome {row[0]}, but you're not an admin.")
    return render_template_string(LOGIN_PAGE, message="Invalid credentials.")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
