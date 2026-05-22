FROM elixir:1.19-alpine AS builder

RUN apk add --no-cache git nodejs npm

WORKDIR /app

RUN mix local.hex --force && mix local.rebar --force

COPY mix.exs mix.lock ./
RUN mix deps.get
RUN mix deps.compile

COPY config config
COPY lib lib

RUN MIX_ENV=prod mix compile

FROM elixir:1.19-alpine

RUN apk add --no-cache git nodejs npm

WORKDIR /app

COPY --from=builder /root/.mix /root/.mix
COPY --from=builder /app/_build /app/_build
COPY --from=builder /app/deps /app/deps
COPY --from=builder /app/lib /app/lib
COPY --from=builder /app/mix.exs /app/mix.exs
COPY config config
COPY entrypoint.sh /entrypoint.sh

RUN chmod +x /entrypoint.sh && mkdir -p /app/project /data/npm-global

ENV NPM_CONFIG_PREFIX=/data/npm-global
ENV PATH="/data/npm-global/bin:$PATH"
ENV MIX_ENV=prod

CMD ["/entrypoint.sh"]
