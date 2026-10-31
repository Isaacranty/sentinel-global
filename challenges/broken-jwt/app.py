import os
import base64
import json
import hmac
import hashlib
from flask import Flask, request, render_template_string, make_response

app = Flask(__name__)
SECRET_KEY = "super_secret_global_key_123" # Not actually used if 'none' alg works
FLAG = os.environ.get("FLAG", "SENTINEL{jwt_alg_none_is_bad}")

PAGE_TEMPLATE = """
<h2>Executive Dashboard</h2>
{% if user == "admin" %}
    <p style="color: green; font-weight: bold;">WELCOME OVERSEER. THE FLAG IS: {{ flag }}</p>
{% elif user %}
    <p>Welcome, {{ user }}. You do not have permission to view the global flag.</p>
{% else %}
    <p>Please log in to access the overseer dashboard.</p>
    <form action="/login" method="post">
        Username: <input name="username" value="guest"><br>
        <button type="submit">Log in as Guest</button>
    </form>
{% endif %}
<hr>
<p><small>Debug Info: System uses industry-standard JWT for identity verification.</small></p>
"""

def create_jwt(user, alg="HS256"):
    header = {"alg": alg, "typ": "JWT"}
    payload = {"user": user}

    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")

    if alg == "HS256":
        signature = hmac.new(SECRET_KEY.encode(), f"{header_b64}.{payload_b64}".encode(), hashlib.sha256).digest()
        sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
        return f"{header_b64}.{payload_b64}.{sig_b64}"
    elif alg == "none":
        return f"{header_b64}.{payload_b64}."
    return None

def verify_jwt(token):
    try:
        parts = token.split(".")
        header = json.loads(base64.urlsafe_b64decode(parts[0] + "==").decode())
        payload = json.loads(base64.urlsafe_b64decode(parts[1] + "==").decode())

        if header["alg"] == "none":
            return payload["user"]

        if header["alg"] == "HS256":
            sig = parts[2]
            expected_sig = hmac.new(SECRET_KEY.encode(), f"{parts[0]}.{parts[1]}".encode(), hashlib.sha256).digest()
            if sig == base64.urlsafe_b64encode(expected_sig).decode().rstrip("="):
                return payload["user"]
    except:
        pass
    return None

@app.route("/")
def index():
    token = request.cookies.get("session")
    user = verify_jwt(token) if token else None
    return render_template_string(PAGE_TEMPLATE, user=user, flag=FLAG)

@app.route("/login", methods=["POST"])
def login():
    username = request.form.get("username", "guest")
    resp = make_response('<p>Logged in. <a href="/">Return to dashboard</a></p>')
    token = create_jwt(username)
    resp.set_cookie("session", token)
    return resp

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
