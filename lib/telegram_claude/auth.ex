defmodule TelegramClaude.Auth do
  def allowed?(user_id) do
    allowed_ids = Application.get_env(:telegram_claude, :allowed_user_ids, [])
    user_id in allowed_ids
  end
end
