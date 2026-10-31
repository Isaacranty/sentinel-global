#!/usr/bin/env bash
# Builds every challenge's Docker image, tagged as challenge.yml's
# `image` field expects. The orchestrator assumes images already
# exist — it does not build on demand (too slow for a "start" click).
#
# Usage: ./scripts/build-challenges.sh

set -euo pipefail
CHALLENGES_DIR="$(dirname "$0")/../challenges"

for dir in "$CHALLENGES_DIR"/*/; do
  name=$(basename "$dir")
  config="$dir/challenge.yml"
  if [ ! -f "$config" ]; then
    echo "skip $name (no challenge.yml)"
    continue
  fi
  image=$(grep '^image:' "$config" | sed 's/image:[[:space:]]*//')
  echo "building $name -> $image"
  docker build -t "$image" "$dir"
done
