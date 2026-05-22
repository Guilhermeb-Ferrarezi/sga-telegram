defmodule TelegramClaude.Claude do
  require Logger

  @timeout 300_000

  def run(prompt, project_dir) do
    claude_bin = System.find_executable("claude") || "/usr/local/bin/claude"

    args = [
      "-p", prompt,
      "--output-format", "text",
      "--allowedTools", "all"
    ]

    Logger.info("Executando claude: #{prompt}")

    opts = [
      cd: project_dir,
      stderr_to_stdout: true
    ]

    case System.cmd(claude_bin, args, opts) do
      {output, 0} ->
        {:ok, String.trim(output)}

      {output, code} ->
        Logger.error("Claude saiu com código #{code}: #{output}")
        {:error, "Claude retornou erro (código #{code})"}
    end
  rescue
    e ->
      Logger.error("Erro ao executar claude: #{inspect(e)}")
      {:error, "Falha ao executar claude"}
  end
end
