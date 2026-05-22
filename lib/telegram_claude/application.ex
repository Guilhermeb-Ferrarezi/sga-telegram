defmodule TelegramClaude.Application do
  use Application
  require Logger

  @impl true
  def start(_type, _args) do
    port = Application.get_env(:telegram_claude, :api_port, 4000)

    children = [
      TelegramClaude.Repo,
      TelegramClaude.Bot,
      {Bandit, plug: TelegramClaude.API.Router, port: port}
    ]

    opts = [strategy: :one_for_one, name: TelegramClaude.Supervisor]
    result = Supervisor.start_link(children, opts)

    run_migrations()

    result
  end

  defp run_migrations do
    path = Application.app_dir(:telegram_claude, "priv/repo/migrations")

    case Ecto.Migrator.run(TelegramClaude.Repo, path, :up, all: true) do
      [] -> :ok
      migrations -> Logger.info("Migrations executadas: #{inspect(migrations)}")
    end
  rescue
    e -> Logger.error("Erro ao rodar migrations: #{inspect(e)}")
  end
end
