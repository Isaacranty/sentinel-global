import os
from flask import Flask, request, render_template_string, jsonify

app = Flask(__name__)
# Debug mode enabled intentionally for the challenge
app.config['DEBUG'] = True
FLAG = os.environ.get("FLAG", "SENTINEL{global_debug_leak}")

PAGE_TEMPLATE = """
<h2>Global Shipping API - Status Terminal</h2>
<p>Monitoring nodes in: <b>London, Singapore, New York, Nairobi, Dubai</b></p>
<div style="background: #000; color: #0f0; padding: 15px; font-family: monospace; border-radius: 5px;">
    <p>> systemctl status shipping-gateway</p>
    <p>● shipping-gateway.service - Global Logistics API</p>
    <p>   Active: active (running) since Mon 2026-07-20 08:00:00 UTC</p>
    <p>   Main PID: 1234 (python3)</p>
    <p>   Tasks: 4 (limit: 4915)</p>
    <p>   Memory: 45.2M</p>
    <p>   CPU: 120ms</p>
</div>
<p style="margin-top: 20px;">Current Status: <span style="color: green;">OPERATIONAL</span></p>
<hr>
<p><small>Note: System is currently running in <b>INTERN_DEBUG_MODE</b>. Unauthorized access is prohibited.</small></p>

<!-- HINT for the learner: Debuggers often have /console or /config endpoints -->
"""

@app.route("/")
def index():
    return render_template_string(PAGE_TEMPLATE)

@app.route("/api/config")
def config():
    # Intentionally insecure: dumping environment variables in a config endpoint
    # that was meant for internal use only.
    config_data = {
        "API_VERSION": "v2.4.1-global",
        "NODE_ID": "G-8812",
        "DEBUG_KEY": "RED-GLOBAL-ALPHA",
        "FLAG_DECRYPTION_ENV": FLAG, # THE LEAK
        "DATABASE_URL": "internal://prod-db-global:5432/shipping"
    }
    return jsonify(config_data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
