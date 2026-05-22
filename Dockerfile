FROM elixir:1.17-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y curl git && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g @anthropic-ai/claude-code && \
    rm -rf /var/lib/apt/lists/*

COPY mix.exs mix.lock* ./
RUN mix local.hex --force && mix local.rebar --force
RUN mix deps.get --only prod
RUN MIX_ENV=prod mix deps.compile

COPY config config
COPY lib lib

RUN MIX_ENV=prod mix compile

FROM elixir:1.17-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl git nodejs npm && \
    npm install -g @anthropic-ai/claude-code && \
    rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/_build /app/_build
COPY --from=builder /app/deps /app/deps
COPY --from=builder /app/lib /app/lib
COPY --from=builder /app/mix.exs /app/mix.exs
COPY config config

# Diretório onde o projeto alvo ficará montado
RUN mkdir -p /app/project

CMD ["sh", "-c", "MIX_ENV=prod mix run --no-halt"]
