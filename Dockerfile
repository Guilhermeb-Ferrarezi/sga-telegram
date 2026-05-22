FROM elixir:1.17-alpine AS builder

RUN apk add --no-cache git curl bash

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

RUN bun install -g @anthropic-ai/claude-code

WORKDIR /app

RUN mix local.hex --force && mix local.rebar --force

COPY mix.exs mix.lock* ./
RUN MIX_ENV=prod mix deps.get --only prod
RUN MIX_ENV=prod mix deps.compile

COPY config config
COPY lib lib

RUN MIX_ENV=prod mix compile

FROM elixir:1.17-alpine

RUN apk add --no-cache git curl bash

RUN curl -fsSL https://bun.sh/install | bash
ENV PATH="/root/.bun/bin:$PATH"

RUN bun install -g @anthropic-ai/claude-code

WORKDIR /app

COPY --from=builder /root/.mix /root/.mix
COPY --from=builder /app/_build /app/_build
COPY --from=builder /app/deps /app/deps
COPY --from=builder /app/lib /app/lib
COPY --from=builder /app/mix.exs /app/mix.exs
COPY config config

RUN mkdir -p /app/project

CMD ["sh", "-c", "MIX_ENV=prod mix run --no-halt"]
