#!/bin/sh
# Chromium launcher for threejs-devtools-mcp in Claude Code cloud sessions.
# The container runs as root, and Chromium refuses to start as root without
# --no-sandbox; threejs-devtools-mcp has no option to pass extra flags.
exec /opt/pw-browsers/chromium --no-sandbox "$@"
