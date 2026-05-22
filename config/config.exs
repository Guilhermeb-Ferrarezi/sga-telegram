import Config

config :telegram_claude, ecto_repos: [TelegramClaude.Repo]

config :telegram_claude, TelegramClaude.Repo,
  database: "/home/app/.claude/history.db"
