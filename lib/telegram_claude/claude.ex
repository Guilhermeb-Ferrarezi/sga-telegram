defmodule TelegramClaude.Claude do
  require Logger

  def run(prompt, project_dir, on_update \\ nil) do
    claude_bin = System.find_executable("claude") || "/usr/local/bin/claude"
    project_env = load_dotenv(project_dir)

    env =
      [{"SHELL", "/bin/sh"}, {"CLAUDE_PROMPT", prompt} | project_env]
      |> Enum.map(fn {k, v} -> {String.to_charlist(k), String.to_charlist(v)} end)

    cmd = "#{claude_bin} -p \"$CLAUDE_PROMPT\" --output-format text --allowedTools all < /dev/null"

    Logger.info("Executando claude: #{prompt}")

    port = Port.open({:spawn, cmd}, [
      :binary,
      :exit_status,
      :stderr_to_stdout,
      {:cd, project_dir},
      {:env, env}
    ])

    stream_output(port, on_update, "")
  rescue
    e ->
      Logger.error("Erro ao executar claude: #{inspect(e)}")
      {:error, "Falha ao executar claude"}
  end

  defp stream_output(port, on_update, buffer) do
    receive do
      {^port, {:data, data}} ->
        new_buffer = buffer <> data
        lines = String.split(new_buffer, "\n")
        {complete, [rest]} = Enum.split(lines, length(lines) - 1)

        Enum.each(complete, fn line ->
          process_event(line, on_update)
        end)

        stream_output(port, on_update, rest)

      {^port, {:exit_status, 0}} ->
        {:ok, String.trim(buffer)}

      {^port, {:exit_status, code}} ->
        Logger.error("Claude saiu com código #{code}: #{buffer}")
        {:error, "```\n#{String.slice(buffer, 0, 800)}\n```"}
    after
      300_000 ->
        Port.close(port)
        {:error, "Timeout"}
    end
  end

  defp process_event(line, on_update) when is_function(on_update) and byte_size(line) > 0 do
    case Jason.decode(line) do
      {:ok, %{"type" => "assistant", "message" => %{"content" => content}}} ->
        text = extract_text_from_content(content)
        if text != "", do: on_update.({:thinking, text})

      {:ok, %{"type" => "assistant", "message" => %{"content" => content}}} when is_list(content) ->
        Enum.each(content, fn
          %{"type" => "tool_use", "name" => tool} ->
            on_update.({:tool, tool})
          _ -> :ok
        end)

      _ -> :ok
    end
  end
  defp process_event(_, _), do: :ok

  defp extract_text_from_content(content) when is_list(content) do
    content
    |> Enum.filter(&(&1["type"] == "text"))
    |> Enum.map(&(&1["text"]))
    |> Enum.join("")
    |> String.slice(0, 200)
  end
  defp extract_text_from_content(_), do: ""

  defp extract_result(buffer) do
    buffer
    |> String.split("\n", trim: true)
    |> Enum.flat_map(fn line ->
      case Jason.decode(line) do
        {:ok, %{"type" => "result", "result" => result}} -> [result]
        _ -> []
      end
    end)
    |> List.last() || "Concluído."
  end

  defp shell_escape(str) do
    "'#{String.replace(str, "'", "'\\''")}'"
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
