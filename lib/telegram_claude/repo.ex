defmodule TelegramClaude.Repo do
  use Ecto.Repo,
    otp_app: :telegram_claude,
    adapter: Ecto.Adapters.SQLite3
end
