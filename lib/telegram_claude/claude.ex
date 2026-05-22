defmodule TelegramClaude.Claude do
  require Logger

  def run(prompt, project_dir, _on_update \\ nil) do
    claude_bin = System.find_executable("claude") || "/data/npm-global/bin/claude"
    project_env = load_dotenv(project_dir)

    cmd = "#{claude_bin} -p \"$CLAUDE_PROMPT\" --output-format text --allowedTools all < /dev/null"

    Logger.info("Executando claude: #{String.slice(prompt, 0, 100)}")

    opts = [
      cd: project_dir,
      stderr_to_stdout: true,
      env: [{"CLAUDE_PROMPT", prompt} | project_env]
    ]

    case System.cmd("sh", ["-c", cmd], opts) do
      {output, 0} ->
        {:ok, String.trim(output)}

      {output, code} ->
        Logger.error("Claude saiu com código #{code}: #{output}")
        {:error, "```\n#{String.slice(output, 0, 800)}\n```"}
    end
  rescue
    e ->
      Logger.error("Erro ao executar claude: #{inspect(e)}")
      {:error, "Falha ao executar claude"}
  end

  defp load_dotenv(project_dir) do
    path = Path.join(project_dir, ".env")

    case File.read(path) do
      {:ok, contents} ->
        contents
        |> String.split("\n", trim: true)
        |> Enum.reject(&String.starts_with?(&1, "#"))
        |> Enum.flat_map(fn line ->
          case String.split(line, "=", parts: 2) do
            [key, value] -> [{String.trim(key), String.trim(value)}]
            _ -> []
          end
        end)

      {:error, _} ->
        []
    end
  end
end
