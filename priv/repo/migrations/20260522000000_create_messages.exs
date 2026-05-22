defmodule TelegramClaude.Repo.Migrations.CreateMessages do
  use Ecto.Migration

  def change do
    create table(:messages) do
      add :chat_id, :string, null: false
      add :role, :string, null: false
      add :content, :text, null: false
      timestamps(updated_at: false)
    end

    create index(:messages, [:chat_id])
    create index(:messages, [:chat_id, :inserted_at])
  end
end
