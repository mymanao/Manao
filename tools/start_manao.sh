#!/usr/bin/env bash
set +e
bun run start
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo ""
  echo "Process exited with code $EXIT_CODE. Press Enter to close..."
  read
fi