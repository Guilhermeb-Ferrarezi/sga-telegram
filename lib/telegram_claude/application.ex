defmodule TelegramClaude.Application do
  use Application

  @impl true
  def start(_type, _args) do
    port = Application.get_env(:telegram_claude, :api_port, 4000)

    children = [
      TelegramClaude.History,
      TelegramClaude.Bot,
      {Bandit, plug: TelegramClaude.API.Router, port: port}
    ]

    opts = [strategy: :one_for_one, name: TelegramClaude.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
