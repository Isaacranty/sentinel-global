import os
import subprocess
from flask import Flask, request, render_template_string

app = Flask(__name__)
FLAG = os.environ.get("FLAG", "SENTINEL{cmd_injection_test}")

# Put flag in /tmp
FLAG_PATH = "/tmp/flag.txt"
with open(FLAG_PATH, "w") as f:
    f.write(FLAG)

PAGE_TEMPLATE = """
<h2>Network Tracer</h2>
<p>Enter an IP or hostname to ping it from our server.</p>
<form method="post">
  <input name="target" placeholder="8.8.8.8" value="{{ target }}">
  <button type="submit">Ping</button>
</form>
<hr>
{% if output %}
    <pre>{{ output }}</pre>
{% elif error %}
    <p style="color: red;">{{ error }}</p>
{% endif %}
"""

@app.route("/", methods=["GET", "POST"])
def index():
    target = ""
    output = ""
    error = ""

    if request.method == "POST":
        target = request.form.get("target", "")
        if target:
            # Intentionally vulnerable: string concatenation into a shell command
            # The "ping -c 1" part is for Linux (the container)
            command = f"ping -c 1 {target}"
            try:
                # shell=True is the key vulnerability here
                output = subprocess.check_output(command, shell=True, stderr=subprocess.STDOUT, text=True)
            except subprocess.CalledProcessError as e:
                output = e.output
            except Exception as e:
                error = str(e)

    return render_template_string(PAGE_TEMPLATE, target=target, output=output, error=error)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
