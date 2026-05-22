defmodule TelegramClaude.Claude do
  require Logger

  def run(prompt, project_dir, on_update \\ nil) do
    claude_bin = System.find_executable("claude") || "/data/npm-global/bin/claude"
    project_env = load_dotenv(project_dir)

    custom_env = Map.new([{"CLAUDE_PROMPT", prompt} | project_env])

    merged_env =
      System.get_env()
      |> Map.merge(custom_env)
      |> Enum.filter(fn {k, v} -> is_binary(k) and is_binary(v) end)
      |> Enum.map(fn {k, v} -> {String.to_charlist(k), String.to_charlist(v)} end)

    cmd = "#{claude_bin} -p \"$CLAUDE_PROMPT\" --output-format text --allowedTools all --dangerously-skip-permissions < /dev/null"

    Logger.info("Executando claude: #{String.slice(prompt, 0, 100)}")

    port =
      Port.open({:spawn_executable, "/bin/bash"}, [
        :binary,
        :stderr_to_stdout,
        :exit_status,
        {:cd, project_dir},
        {:env, merged_env},
        {:args, ["-c", cmd]}
      ])

    collect_output(port, "", on_update, :os.system_time(:millisecond))
  rescue
    e ->
      Logger.error("Erro ao executar claude: #{inspect(e)}")
      {:error, "Falha ao executar claude"}
  end

  defp collect_output(port, acc, on_update, last_update) do
    receive do
      {^port, {:data, data}} ->
        new_acc = acc <> data
        now = :os.system_time(:millisecond)

        if on_update && now - last_update > 2000 do
          on_update.({:streaming, new_acc})
          collect_output(port, new_acc, on_update, now)
        else
          collect_output(port, new_acc, on_update, last_update)
        end

      {^port, {:exit_status, 0}} ->
        {:ok, String.trim(acc)}

      {^port, {:exit_status, code}} ->
        Logger.error("Claude saiu com código #{code}: #{acc}")
        {:error, "```\n#{String.slice(acc, 0, 800)}\n```"}
    after
      300_000 ->
        safe_close(port)
        {:error, "Timeout: Claude demorou mais de 5 minutos"}
    end
  end

  defp safe_close(port) do
    try do
      Port.close(port)
    rescue
      _ -> :ok
    catch
      _, _ -> :ok
    end
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
