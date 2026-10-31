import os
from flask import Flask, request, render_template_string

app = Flask(__name__)
FLAG = os.environ.get("FLAG", "SENTINEL{flask_templates_are_not_safe}")

# Flag location
with open("/tmp/flag.txt", "w") as f:
    f.write(FLAG)

@app.route("/")
def index():
    name = request.args.get("name", "Operator")

    # Intentionally vulnerable: rendering user input directly as a template string
    # This leads to Server-Side Template Injection (SSTI)
    template = f"""
    <html>
        <body>
            <h2>Global Greeting Service</h2>
            <p>Welcome to the mission, {name}!</p>
            <hr>
            <form action="/" method="get">
                Identify yourself: <input name="name">
                <button type="submit">Update Identity</button>
            </form>
        </body>
    </html>
    """
    return render_template_string(template)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
