#!/usr/bin/env bash
# Proves the isolation stack actually holds for ONE instance, run by
# hand, matching docs/ctf-sandbox-design.md's "prove the sandbox is
# real before automating it" step.
#
# Requires: Docker, the example-sqli image built
# (npm run ctf:build-images), and ideally gVisor installed
# (scripts/install-gvisor.sh) — pass --runtime=runsc to test with it,
# otherwise it tests under default runc (weaker, but still checks
# cap-drop/network/fs isolation).
#
# Usage: ./scripts/test-sandbox.sh [--runtime=runsc]

set -uo pipefail

RUNTIME_FLAG=""
if [[ "${1:-}" == "--runtime=runsc" ]]; then
  RUNTIME_FLAG="--runtime=runsc"
  echo "Testing with gVisor (runsc)"
else
  echo "Testing with default runc — pass --runtime=runsc once gVisor is installed"
fi

NET_NAME="ctf-test-$$"
CONTAINER_NAME="ctf-test-$$"
PASS=0
FAIL=0

cleanup() {
  docker rm -f "$CONTAINER_NAME" &> /dev/null
  docker network rm "$NET_NAME" &> /dev/null
}
trap cleanup EXIT

check() {
  local description="$1"
  local result="$2" # 0 = pass
  if [ "$result" -eq 0 ]; then
    echo "  ✓ $description"
    PASS=$((PASS + 1))
  else
    echo "  ✗ $description"
    FAIL=$((FAIL + 1))
  fi
}

echo "Creating isolated network..."
docker network create --internal "$NET_NAME" > /dev/null

echo "Starting container..."
docker run -d --name "$CONTAINER_NAME" \
  --network "$NET_NAME" \
  $RUNTIME_FLAG \
  --cap-drop=ALL \
  --security-opt no-new-privileges:true \
  --read-only \
  --tmpfs /tmp:size=64m \
  --pids-limit=64 \
  --memory=256m \
  --cpus=0.5 \
  -e FLAG=SENTINEL{test_flag} \
  sentinel-ea/example-sqli > /dev/null

sleep 2

echo ""
echo "Running checks:"

# 1. Container is actually up
docker exec "$CONTAINER_NAME" true &> /dev/null
check "container is running" $?

# 2. No egress to the internet
docker exec "$CONTAINER_NAME" sh -c "wget -q -T 3 -O /dev/null https://example.com" &> /dev/null
[ $? -ne 0 ]
check "no internet egress (expected to fail/timeout)" $?

# 3. Read-only root filesystem
docker exec "$CONTAINER_NAME" sh -c "touch /root-write-test" &> /dev/null
[ $? -ne 0 ]
check "root filesystem is read-only" $?

# 4. /tmp is still writable (tmpfs)
docker exec "$CONTAINER_NAME" sh -c "touch /tmp/write-test" &> /dev/null
check "/tmp is writable (tmpfs)" $?

# 5. Capabilities dropped — can't do a privileged mount
docker exec "$CONTAINER_NAME" sh -c "mount -t tmpfs none /mnt" &> /dev/null
[ $? -ne 0 ]
check "capabilities dropped (mount fails)" $?

# 6. Runtime matches what was requested
ACTUAL_RUNTIME=$(docker inspect --format '{{.HostConfig.Runtime}}' "$CONTAINER_NAME")
if [[ -n "$RUNTIME_FLAG" ]]; then
  [[ "$ACTUAL_RUNTIME" == "runsc" ]]
  check "runtime is runsc (got: $ACTUAL_RUNTIME)" $?
else
  echo "  · runtime: $ACTUAL_RUNTIME (default — install gVisor for stronger isolation)"
fi

# 7. Resource limits actually applied
ACTUAL_MEM=$(docker inspect --format '{{.HostConfig.Memory}}' "$CONTAINER_NAME")
[[ "$ACTUAL_MEM" == "268435456" ]] # 256m in bytes
check "memory limit applied (256m)" $?

echo ""
echo "$PASS passed, $FAIL failed."
[ "$FAIL" -eq 0 ]
