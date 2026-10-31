import os
from flask import Flask, request, render_template_string, send_file

app = Flask(__name__)
FLAG = os.environ.get("FLAG", "SENTINEL{local_traversal_test}")

# Ensure the flag is in a "hidden" place on the filesystem
# Using /tmp because / is read-only in the Sentinel sandbox
FLAG_PATH = "/tmp/flag.txt"
with open(FLAG_PATH, "w") as f:
    f.write(FLAG)

LOGS_DIR = "/var/log/app"
os.makedirs(LOGS_DIR, exist_ok=True)
with open(os.path.join(LOGS_DIR, "system.log"), "w") as f:
    f.write("System initialized.\nService started on port 5000.\nAll systems green.")

PAGE_TEMPLATE = """
<h2>System Log Viewer</h2>
<p>Available logs in {{ logs_dir }}:</p>
<ul>
    {% for log in logs %}
        <li><a href="/view?file={{ log }}">{{ log }}</a></li>
    {% endfor %}
</ul>
<hr>
{% if content %}
    <pre>{{ content }}</pre>
{% elif error %}
    <p style="color: red;">{{ error }}</p>
{% endif %}
"""

@app.route("/")
def index():
    logs = os.listdir(LOGS_DIR)
    return render_template_string(PAGE_TEMPLATE, logs=logs, logs_dir=LOGS_DIR)

@app.route("/view")
def view():
    filename = request.args.get("file", "")
    if not filename:
        return "Missing file parameter", 400

    # Intentionally vulnerable: no sanitization of 'filename'
    filepath = os.path.join(LOGS_DIR, filename)

    try:
        if not os.path.exists(filepath):
            return render_template_string(PAGE_TEMPLATE, logs=os.listdir(LOGS_DIR), logs_dir=LOGS_DIR, error="File not found.")

        with open(filepath, "r") as f:
            content = f.read()
        return render_template_string(PAGE_TEMPLATE, logs=os.listdir(LOGS_DIR), logs_dir=LOGS_DIR, content=content)
    except Exception as e:
        return render_template_string(PAGE_TEMPLATE, logs=os.listdir(LOGS_DIR), logs_dir=LOGS_DIR, error=str(e))

if __name__ == "__main__":
    # In production/sandbox, this runs as a non-root user
    app.run(host="0.0.0.0", port=5000)
