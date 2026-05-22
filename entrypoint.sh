#!/bin/sh
set -e

NPM_GLOBAL=/data/npm-global

export NPM_CONFIG_PREFIX=$NPM_GLOBAL
export PATH="$NPM_GLOBAL/bin:$PATH"

if [ ! -f "$NPM_GLOBAL/bin/claude" ]; then
  echo "[entrypoint] Instalando @anthropic-ai/claude-code..."
  npm install -g @anthropic-ai/claude-code
  echo "[entrypoint] Claude instalado."
fi

exec mix run --no-halt
