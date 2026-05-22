defmodule TelegramClaude.MixProject do
  use Mix.Project

  def project do
    [
      app: :telegram_claude,
      version: "0.1.0",
      elixir: "~> 1.18",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      extra_applications: [:logger],
      mod: {TelegramClaude.Application, []}
    ]
  end

  defp deps do
    [
      {:telegex, "~> 1.0"},
      {:jason, "~> 1.4"},
      {:req, "~> 0.5"},
      {:bandit, "~> 1.5"},
      {:plug, "~> 1.16"},
      {:plug_crypto, "~> 2.1"},
      {:ecto_sqlite3, "~> 0.17"},
      {:ecto, "~> 3.12"}
    ]
  end
end
