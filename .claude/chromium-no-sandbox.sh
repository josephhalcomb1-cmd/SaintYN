#!/bin/sh
# Cloud sessions run as root, where Chromium refuses to start without --no-sandbox.
exec /opt/pw-browsers/chromium --no-sandbox "$@"
