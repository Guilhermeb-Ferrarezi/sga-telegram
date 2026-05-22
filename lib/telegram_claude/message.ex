defmodule TelegramClaude.Message do
  use Ecto.Schema

  schema "messages" do
    field :chat_id, :string
    field :role, :string
    field :content, :string
    timestamps(updated_at: false)
  end
end
