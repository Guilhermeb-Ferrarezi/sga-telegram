import Config

config :telegram_claude,
  bot_token: System.fetch_env!("TELEGRAM_BOT_TOKEN"),
  bot_username: System.get_env("TELEGRAM_BOT_USERNAME", ""),
  project_dir: System.get_env("PROJECT_DIR", "/app/project"),
  allowed_user_ids:
    System.get_env("ALLOWED_USER_IDS", "")
    |> String.split(",", trim: true)
    |> Enum.map(&String.to_integer/1)
