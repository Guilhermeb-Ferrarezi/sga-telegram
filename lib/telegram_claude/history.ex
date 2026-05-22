defmodule TelegramClaude.History do
  use Agent

  @max_messages 10

  def start_link(_opts) do
    Agent.start_link(fn -> %{} end, name: __MODULE__)
  end

  def add(chat_id, role, text) do
    Agent.update(__MODULE__, fn state ->
      history = Map.get(state, chat_id, [])
      trimmed = Enum.take(history ++ [{role, text}], -@max_messages)
      Map.put(state, chat_id, trimmed)
    end)
  end

  def get(chat_id) do
    Agent.get(__MODULE__, fn state -> Map.get(state, chat_id, []) end)
  end

  def format(chat_id) do
    chat_id
    |> get()
    |> Enum.map(fn
      {:user, text} -> "Usuário: #{text}"
      {:assistant, text} -> "Assistente: #{String.slice(text, 0, 300)}"
    end)
    |> Enum.join("\n")
  end

  def clear(chat_id) do
    Agent.update(__MODULE__, &Map.delete(&1, chat_id))
  end
end
