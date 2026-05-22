defmodule TelegramClaude.Telegram do
  @base_url "https://api.telegram.org"

  def get_updates(offset) do
    token = token()

    case Req.get("#{@base_url}/bot#{token}/getUpdates",
           params: [offset: offset, timeout: 30],
           receive_timeout: 35_000
         ) do
      {:ok, %{status: 200, body: %{"ok" => true, "result" => updates}}} ->
        {:ok, updates}

      {:ok, %{body: body}} ->
        {:error, inspect(body)}

      {:error, reason} ->
        {:error, inspect(reason)}
    end
  end

  def send_message(chat_id, text) do
    token = token()
    chunks = chunk_text(text, 4096)

    Enum.each(chunks, fn chunk ->
      Req.post("#{@base_url}/bot#{token}/sendMessage",
        json: %{chat_id: chat_id, text: chunk, parse_mode: "Markdown"}
      )
    end)
  end

  def send_message_id(chat_id, text) do
    token = token()

    case Req.post("#{@base_url}/bot#{token}/sendMessage",
           json: %{chat_id: chat_id, text: text}
         ) do
      {:ok, %{body: %{"ok" => true, "result" => %{"message_id" => msg_id}}}} -> {:ok, msg_id}
      _ -> {:error, :send_failed}
    end
  end

  def edit_message(chat_id, message_id, text) do
    token = token()
    chunks = chunk_text(text, 4096)

    [first | rest] = chunks

    Req.post("#{@base_url}/bot#{token}/editMessageText",
      json: %{chat_id: chat_id, message_id: message_id, text: first, parse_mode: "Markdown"}
    )

    Enum.each(rest, fn chunk ->
      Req.post("#{@base_url}/bot#{token}/sendMessage",
        json: %{chat_id: chat_id, text: chunk, parse_mode: "Markdown"}
      )
    end)
  end

  defp chunk_text(text, max) when byte_size(text) <= max, do: [text]

  defp chunk_text(text, max) do
    text
    |> String.graphemes()
    |> Enum.chunk_every(max)
    |> Enum.map(&Enum.join/1)
  end

  defp token do
    Application.fetch_env!(:telegram_claude, :bot_token)
  end
end
