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

# Restaurar .claude.json do volume se necessario
if [ ! -f /root/.claude.json ]; then
  BACKUP=$(ls -t /root/.claude/backups/.claude.json.backup.* 2>/dev/null | head -1)
  if [ -n "$BACKUP" ]; then
    echo "[entrypoint] Restaurando auth do Claude de $BACKUP"
    cp "$BACKUP" /root/.claude.json
  else
    echo "[entrypoint] AVISO: sem auth do Claude. Acesse o terminal e rode 'claude' para fazer login."
  fi
fi

exec mix run --no-halt
