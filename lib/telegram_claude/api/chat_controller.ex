defmodule TelegramClaude.API.ChatController do
  import Plug.Conn
  require Logger

  def stream(conn, params) do
    with session when not is_nil(session) <- TelegramClaude.API.Session.get(conn),
         prompt when is_binary(prompt) and prompt != "" <- Map.get(params, "prompt") do
      project_path = Map.get(params, "project_path") ||
        Application.get_env(:telegram_claude, :project_dir, "/app/project")

      chat_id = "web_#{session["login"]}"
      TelegramClaude.History.add(chat_id, :user, prompt)

      history_text = TelegramClaude.History.format(chat_id)

      full_prompt =
        if history_text != "" do
          "Histórico da conversa:\n#{history_text}\n\nNova mensagem do usuário: #{prompt}"
        else
          prompt
        end

      conn =
        conn
        |> put_resp_content_type("text/event-stream")
        |> put_resp_header("cache-control", "no-cache")
        |> put_resp_header("x-accel-buffering", "no")
        |> put_resp_header("connection", "keep-alive")
        |> send_chunked(200)

      on_update = fn
        {:chunk, delta} ->
          event = Jason.encode!(%{type: "chunk", text: delta})
          chunk(conn, "data: #{event}\n\n")

        {:status, desc} ->
          event = Jason.encode!(%{type: "status", text: desc})
          chunk(conn, "data: #{event}\n\n")
      end

      case TelegramClaude.Claude.run(full_prompt, project_path, on_update) do
        {:ok, response} ->
          TelegramClaude.History.add(chat_id, :assistant, response)
          event = Jason.encode!(%{type: "done", text: response})
          chunk(conn, "data: #{event}\n\n")

        {:error, reason} ->
          event = Jason.encode!(%{type: "error", text: reason})
          chunk(conn, "data: #{event}\n\n")
      end

      conn
    else
      nil ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(401, ~s({"error":"unauthenticated"}))

      _ ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(400, ~s({"error":"prompt is required"}))
    end
  end

  def clear_history(conn, _params) do
    case TelegramClaude.API.Session.get(conn) do
      nil ->
        conn |> put_resp_content_type("application/json") |> send_resp(401, ~s({"error":"unauthenticated"}))

      session ->
        TelegramClaude.History.clear("web_#{session["login"]}")
        conn |> put_resp_content_type("application/json") |> send_resp(200, ~s({"ok":true}))
    end
  end
end
