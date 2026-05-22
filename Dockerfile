FROM elixir:1.19-alpine AS builder

RUN apk add --no-cache git nodejs npm

WORKDIR /app

RUN mix local.hex --force && mix local.rebar --force

COPY mix.exs mix.lock ./
RUN MIX_ENV=prod mix deps.get
RUN MIX_ENV=prod mix deps.compile mime plug plug_crypto --force
RUN MIX_ENV=prod mix deps.compile

COPY config config
COPY lib lib

RUN MIX_ENV=prod mix compile

# Frontend build
FROM node:22-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/ ./
RUN npm install && npm run build

# Runtime
FROM elixir:1.19-alpine

RUN apk add --no-cache git nodejs npm gettext su-exec bash && \
    adduser -D -h /home/app -s /bin/bash app

WORKDIR /app

COPY --from=builder /root/.mix /home/app/.mix
COPY --from=builder /app/_build /app/_build
COPY --from=builder /app/deps /app/deps
COPY --from=builder /app/lib /app/lib
COPY --from=builder /app/mix.exs /app/mix.exs
COPY --from=builder /app/mix.lock /app/mix.lock
COPY config config
COPY entrypoint.sh /entrypoint.sh
COPY CLAUDE.md /app/CLAUDE.md

COPY --from=frontend-builder /frontend/dist /app/priv/static

RUN chmod +x /entrypoint.sh && \
    mkdir -p /app/project /data/npm-global /home/app/.claude/backups && \
    chown -R app:app /app /data/npm-global /home/app

ENV HOME=/home/app
ENV NPM_CONFIG_PREFIX=/data/npm-global
ENV PATH="/data/npm-global/bin:$PATH"
ENV MIX_ENV=prod
ENV SHELL=/bin/bash

CMD ["/entrypoint.sh"]
