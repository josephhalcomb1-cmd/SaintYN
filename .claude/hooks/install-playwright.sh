#!/bin/bash
# Installs the Python Playwright version that matches the preinstalled Chromium,
# so the webapp-testing skill works in cloud sessions.
set -euo pipefail
[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
python3 -c "import playwright" 2>/dev/null && exit 0
pip install -q "playwright==1.56.0"
