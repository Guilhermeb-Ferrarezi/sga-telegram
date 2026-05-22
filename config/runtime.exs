import Config

config :telegram_claude,
  bot_token: System.fetch_env!("TELEGRAM_BOT_TOKEN"),
  bot_username: System.get_env("TELEGRAM_BOT_USERNAME", ""),
  project_dir: System.get_env("PROJECT_DIR", "/app/project"),
  allowed_user_ids:
    System.get_env("ALLOWED_USER_IDS", "")
    |> String.split(",", trim: true)
    |> Enum.map(&String.to_integer/1),
  api_port: System.get_env("API_PORT", "4000") |> String.to_integer(),
  api_secret: System.get_env("API_SECRET", String.duplicate("changeme", 4)),
  github_client_id: System.get_env("GITHUB_CLIENT_ID", ""),
  github_client_secret: System.get_env("GITHUB_CLIENT_SECRET", ""),
  github_redirect_uri: System.get_env("GITHUB_REDIRECT_URI", "http://localhost:4000/api/auth/github/callback"),
  frontend_url: System.get_env("FRONTEND_URL", "/dashboard")

config :telegram_claude, TelegramClaude.Repo,
  database: System.get_env("DB_PATH", "/home/app/.claude/history.db")
