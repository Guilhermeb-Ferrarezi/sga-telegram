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

    cmd =
      "#{claude_bin} -p \"$CLAUDE_PROMPT\" --output-format stream-json --allowedTools all --dangerously-skip-permissions < /dev/null"

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

    # state: final_result | nil, last_turn_text, line_buf
    collect_output(port, nil, "", "", on_update)
  rescue
    e ->
      Logger.error("Erro ao executar claude: #{inspect(e)}")
      {:error, "Falha ao executar claude"}
  end

  defp collect_output(port, result, last_turn_text, line_buf, on_update) do
    receive do
      {^port, {:data, data}} ->
        combined = line_buf <> data
        lines = String.split(combined, "\n")
        {complete, [buf]} = Enum.split(lines, -1)

        {new_result, new_last} =
          Enum.reduce(complete, {result, last_turn_text}, fn line, {r, lt} ->
            process_line(line, r, lt, on_update)
          end)

        collect_output(port, new_result, new_last, buf, on_update)

      {^port, {:exit_status, 0}} ->
        {:ok, String.trim(result || last_turn_text)}

      {^port, {:exit_status, code}} ->
        Logger.error("Claude saiu com código #{code}: #{last_turn_text}")
        {:error, "```\n#{String.slice(last_turn_text, 0, 800)}\n```"}
    after
      300_000 ->
        safe_close(port)
        {:error, "Timeout: Claude demorou mais de 5 minutos"}
    end
  end

  defp process_line("", result, last_turn, _), do: {result, last_turn}

  defp process_line(line, result, last_turn, on_update) do
    case Jason.decode(line) do
      {:ok, event} -> handle_event(event, result, last_turn, on_update)
      {:error, _} -> {result, last_turn}
    end
  end

  defp handle_event(
         %{"type" => "assistant", "message" => %{"content" => content}},
         result,
         last_turn,
         on_update
       )
       when is_list(content) do
    # Emit status for tool calls
    Enum.each(content, fn
      %{"type" => "tool_use", "name" => name, "input" => input} ->
        if on_update, do: on_update.({:status, tool_description(name, input)})

      _ ->
        :ok
    end)

    # Extract text and compute delta
    text =
      content
      |> Enum.filter(&match?(%{"type" => "text"}, &1))
      |> Enum.map_join("", & &1["text"])

    if text != "" do
      delta =
        if String.starts_with?(text, last_turn) do
          String.slice(text, String.length(last_turn)..-1//1)
        else
          text
        end

      if on_update && delta != "", do: on_update.({:chunk, delta})

      new_last = if String.starts_with?(text, last_turn), do: text, else: last_turn <> text
      {result, new_last}
    else
      {result, last_turn}
    end
  end

  defp handle_event(
         %{"type" => "result", "is_error" => false, "result" => final},
         _result,
         last_turn,
         _on_update
       ) do
    {final || last_turn, last_turn}
  end

  defp handle_event(%{"type" => "result", "is_error" => true}, _result, last_turn, _on_update) do
    {nil, last_turn}
  end

  defp handle_event(_, result, last_turn, _), do: {result, last_turn}

  defp tool_description("Bash", %{"command" => cmd}),
    do: "Rodando: #{String.slice(cmd, 0, 80)}"

  defp tool_description("Read", %{"file_path" => path}), do: "Lendo: #{path}"
  defp tool_description("Write", %{"file_path" => path}), do: "Escrevendo: #{path}"
  defp tool_description("Edit", %{"file_path" => path}), do: "Editando: #{path}"
  defp tool_description("MultiEdit", %{"file_path" => path}), do: "Editando: #{path}"
  defp tool_description("Glob", _), do: "Listando arquivos..."
  defp tool_description("Grep", %{"pattern" => p}), do: "Buscando: #{p}"
  defp tool_description("LS", %{"path" => p}), do: "Listando: #{p}"
  defp tool_description("TodoWrite", _), do: "Atualizando tarefas..."
  defp tool_description("WebSearch", %{"query" => q}), do: "Pesquisando: #{q}"
  defp tool_description("WebFetch", %{"url" => u}), do: "Acessando: #{u}"
  defp tool_description(name, _), do: "#{name}..."

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
