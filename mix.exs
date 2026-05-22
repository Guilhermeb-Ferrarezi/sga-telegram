defmodule TelegramClaude.MixProject do
  use Mix.Project

  def project do
    [
      app: :telegram_claude,
      version: "0.1.0",
      elixir: "~> 1.19",
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
      {:req, "~> 0.5"}
    ]
  end
end
