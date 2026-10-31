#!/usr/bin/env bash
# Installs gVisor (runsc) and registers it as a Docker runtime.
#
# Run this ON THE MACHINE THAT WILL ACTUALLY RUN CHALLENGE
# CONTAINERS — not in a dev sandbox, not on your laptop unless
# that's also where the orchestrator runs. Tested against Ubuntu/
# Debian with Docker already installed; adjust for other distros.
#
# Usage: sudo ./scripts/install-gvisor.sh

set -euo pipefail

if [ "$EUID" -ne 0 ]; then
  echo "Run as root (sudo ./scripts/install-gvisor.sh)"
  exit 1
fi

if ! command -v docker &> /dev/null; then
  echo "Docker isn't installed. Install Docker first, then re-run this."
  exit 1
fi

echo "Installing gVisor (runsc)..."
(
  set -e
  ARCH=$(uname -m)
  URL="https://storage.googleapis.com/gvisor/releases/release/latest/${ARCH}"
  curl -fsSL "${URL}/runsc" -o /usr/local/bin/runsc
  curl -fsSL "${URL}/containerd-shim-runsc-v1" -o /usr/local/bin/containerd-shim-runsc-v1
  chmod +x /usr/local/bin/runsc /usr/local/bin/containerd-shim-runsc-v1
)

echo "Registering runsc as a Docker runtime..."
DAEMON_JSON="/etc/docker/daemon.json"
if [ -f "$DAEMON_JSON" ]; then
  cp "$DAEMON_JSON" "${DAEMON_JSON}.bak.$(date +%s)"
fi

python3 - "$DAEMON_JSON" <<'PYEOF'
import json, sys, os

path = sys.argv[1]
config = {}
if os.path.exists(path):
    with open(path) as f:
        content = f.read().strip()
        if content:
            config = json.loads(content)

config.setdefault("runtimes", {})
config["runtimes"]["runsc"] = {"path": "/usr/local/bin/runsc"}

os.makedirs(os.path.dirname(path), exist_ok=True)
with open(path, "w") as f:
    json.dump(config, f, indent=2)
PYEOF

echo "Restarting Docker..."
systemctl restart docker

echo ""
echo "Verifying..."
if docker info 2>/dev/null | grep -q runsc; then
  echo "✓ runsc is registered. Test it with:"
  echo "    docker run --rm --runtime=runsc hello-world"
  echo ""
  echo "Once that works, set CTF_USE_GVISOR=true in .env and restart the app."
else
  echo "✗ runsc doesn't show up in 'docker info'. Check /etc/docker/daemon.json"
  echo "  and 'systemctl status docker' for errors."
  exit 1
fi
