defmodule TelegramClaude.Bot do
  use GenServer
  require Logger

  @poll_interval 1_000

  def start_link(_opts) do
    GenServer.start_link(__MODULE__, %{offset: 0}, name: __MODULE__)
  end

  @impl true
  def init(state) do
    Logger.info("Bot iniciado, aguardando mensagens...")
    schedule_poll()
    {:ok, state}
  end

  @impl true
  def handle_info(:poll, %{offset: offset} = state) do
    new_offset =
      case TelegramClaude.Telegram.get_updates(offset) do
        {:ok, updates} when updates != [] ->
          Enum.each(updates, &handle_update/1)
          last = List.last(updates)
          last["update_id"] + 1

        _ ->
          offset
      end

    schedule_poll()
    {:noreply, %{state | offset: new_offset}}
  end

  defp handle_update(%{"message" => message}) do
    chat_id = get_in(message, ["chat", "id"])
    user_id = get_in(message, ["from", "id"])
    text = Map.get(message, "text", "")
    chat_type = get_in(message, ["chat", "type"])

    cond do
      not TelegramClaude.Auth.allowed?(user_id) ->
        Logger.info("Usuário #{user_id} não autorizado")

      chat_type in ["group", "supergroup"] ->
        bot_username = Application.get_env(:telegram_claude, :bot_username, "")
        mention = "@#{bot_username}"

        if String.starts_with?(text, mention) or String.starts_with?(text, "/claude") do
          prompt = text |> String.replace(mention, "") |> String.replace("/claude", "") |> String.trim()
          dispatch(chat_id, prompt)
        end

      true ->
        dispatch(chat_id, text)
    end
  end

  defp handle_update(_), do: :ok

  defp dispatch(_chat_id, ""), do: :ok
  defp dispatch(chat_id, "/auth"), do: TelegramClaude.AuthFlow.start(chat_id)
  defp dispatch(chat_id, "/limpar") do
    TelegramClaude.History.clear(chat_id)
    TelegramClaude.Telegram.send_message(chat_id, "🗑 Histórico apagado.")
  end
  defp dispatch(chat_id, prompt), do: Task.start(fn -> process_prompt(chat_id, prompt) end)

  defp process_prompt(chat_id, prompt) do
    TelegramClaude.History.add(chat_id, :user, prompt)

    {:ok, msg_id} = TelegramClaude.Telegram.send_message_id(chat_id, "⏳ Iniciando...")

    project_dir = Application.get_env(:telegram_claude, :project_dir, "/app/project")

    history_text = TelegramClaude.History.format(chat_id)

    full_prompt =
      if history_text != "" do
        "Histórico da conversa:\n#{history_text}\n\nNova mensagem do usuário: #{prompt}"
      else
        prompt
      end

    last_edit_ref = :atomics.new(1, [])
    :atomics.put(last_edit_ref, 1, :os.system_time(:millisecond))

    on_update = fn
      {:thinking, text} ->
        now = :os.system_time(:millisecond)
        if now - :atomics.get(last_edit_ref, 1) > 2000 do
          :atomics.put(last_edit_ref, 1, now)
          TelegramClaude.Telegram.edit_message(chat_id, msg_id, "💭 #{String.slice(text, 0, 200)}")
        end

      {:tool, tool} ->
        now = :os.system_time(:millisecond)
        if now - :atomics.get(last_edit_ref, 1) > 1000 do
          :atomics.put(last_edit_ref, 1, now)
          TelegramClaude.Telegram.edit_message(chat_id, msg_id, "🔧 Usando: `#{tool}`")
        end
    end

    case TelegramClaude.Claude.run(full_prompt, project_dir, on_update) do
      {:ok, response} ->
        TelegramClaude.History.add(chat_id, :assistant, response)
        TelegramClaude.Telegram.edit_message(chat_id, msg_id, response)

      {:error, reason} ->
        TelegramClaude.Telegram.edit_message(chat_id, msg_id, "❌ Erro: #{reason}")
    end
  end

  defp schedule_poll do
    Process.send_after(self(), :poll, @poll_interval)
  end
end
