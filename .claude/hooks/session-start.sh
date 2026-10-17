#!/bin/bash
# SessionStart hook: install dependencies so lint, tests and builds work in
# Claude Code cloud sessions. Runs synchronously and only in remote sessions.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

echo "[session-start] installing npm dependencies"
npm install --no-audit --no-fund --loglevel=error
echo "[session-start] done"
