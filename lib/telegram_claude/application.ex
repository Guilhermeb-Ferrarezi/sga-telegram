defmodule TelegramClaude.Application do
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      TelegramClaude.Bot
    ]

    opts = [strategy: :one_for_one, name: TelegramClaude.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
