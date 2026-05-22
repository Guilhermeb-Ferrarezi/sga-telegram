defmodule TelegramClaude.History do
  import Ecto.Query
  alias TelegramClaude.{Repo, Message}

  @max_context 20
  @assistant_preview 500

  def add(chat_id, role, content) do
    %Message{}
    |> Ecto.Changeset.change(
      chat_id: to_string(chat_id),
      role: to_string(role),
      content: content
    )
    |> Repo.insert()

    :ok
  end

  def get(chat_id) do
    Message
    |> where([m], m.chat_id == ^to_string(chat_id))
    |> order_by([m], asc: m.inserted_at)
    |> limit(@max_context)
    |> select([m], {m.role, m.content})
    |> Repo.all()
    |> Enum.map(fn {role, content} -> {String.to_atom(role), content} end)
  end

  def get_for_api(chat_id) do
    Message
    |> where([m], m.chat_id == ^to_string(chat_id))
    |> order_by([m], asc: m.inserted_at)
    |> Repo.all()
  end

  def format(chat_id) do
    chat_id
    |> get()
    |> Enum.map(fn
      {:user, text} -> "Usuário: #{text}"
      {:assistant, text} -> "Assistente: #{String.slice(text, 0, @assistant_preview)}"
    end)
    |> Enum.join("\n")
  end

  def clear(chat_id) do
    Message
    |> where([m], m.chat_id == ^to_string(chat_id))
    |> Repo.delete_all()

    :ok
  end
end
