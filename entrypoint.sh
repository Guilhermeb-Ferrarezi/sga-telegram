#!/bin/sh
set -e

NPM_GLOBAL=/data/npm-global

export NPM_CONFIG_PREFIX=$NPM_GLOBAL
export PATH="$NPM_GLOBAL/bin:$PATH"
export HOME=/home/app

# Corrigir ownership dos volumes (podem ter sido criados como root)
mkdir -p /home/app/.claude/backups /data/npm-global /app/project
chown -R app:app /home/app /data/npm-global /app/project 2>/dev/null || true

if [ ! -f "$NPM_GLOBAL/bin/claude" ]; then
  echo "[entrypoint] Instalando @anthropic-ai/claude-code..."
  su-exec app npm install -g @anthropic-ai/claude-code
  echo "[entrypoint] Claude instalado."
fi

# Restaurar .claude.json do volume se necessario
if [ ! -f /home/app/.claude.json ]; then
  BACKUP=$(ls -t /home/app/.claude/backups/.claude.json.backup.* 2>/dev/null | head -1)
  if [ -n "$BACKUP" ]; then
    echo "[entrypoint] Restaurando auth do Claude de $BACKUP"
    cp "$BACKUP" /home/app/.claude.json
    chown app:app /home/app/.claude.json
  else
    echo "[entrypoint] AVISO: sem auth do Claude. Acesse o terminal e rode 'claude' para fazer login."
  fi
fi

# Injetar CLAUDE.md com variáveis do .env substituídas
if [ -f /app/CLAUDE.md ]; then
  export $(grep -v '^#' /app/project/.env 2>/dev/null | xargs) 2>/dev/null || true
  envsubst < /app/CLAUDE.md > /app/project/CLAUDE.md
  echo "[entrypoint] CLAUDE.md injetado em /app/project/"
fi

exec su-exec app mix run --no-halt
