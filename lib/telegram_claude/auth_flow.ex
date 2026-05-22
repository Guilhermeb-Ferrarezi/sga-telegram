defmodule TelegramClaude.AuthFlow do
  require Logger

  @url_regex ~r/https:\/\/[^\s]+/

  def start(chat_id) do
    claude_bin = System.find_executable("claude") || "/usr/local/bin/claude"

    Task.start(fn ->
      port =
        Port.open({:spawn_executable, claude_bin}, [
          :binary,
          :stderr_to_stdout,
          :exit_status,
          args: ["--print", "test"]
        ])

      wait_for_url(port, chat_id, "")
    end)
  end

  defp wait_for_url(port, chat_id, buffer) do
    receive do
      {^port, {:data, data}} ->
        combined = buffer <> data

        case Regex.run(@url_regex, combined) do
          [url] ->
            TelegramClaude.Telegram.send_message(
              chat_id,
              "🔐 Acesse esta URL para autenticar:\n#{url}\n\nApós o login, o bot estará pronto."
            )

            wait_for_done(port, chat_id)

          nil ->
            wait_for_url(port, chat_id, combined)
        end

      {^port, {:exit_status, 0}} ->
        TelegramClaude.Telegram.send_message(chat_id, "✅ Auth concluído com sucesso!")

      {^port, {:exit_status, _}} ->
        TelegramClaude.Telegram.send_message(chat_id, "❌ Falha no auth. Tente `/auth` novamente.")
    after
      30_000 ->
        safe_close(port)
        TelegramClaude.Telegram.send_message(chat_id, "⏱ Timeout aguardando URL de auth.")
    end
  end

  defp wait_for_done(port, chat_id) do
    receive do
      {^port, {:data, _}} ->
        wait_for_done(port, chat_id)

      {^port, {:exit_status, 0}} ->
        System.cmd("sh", [
          "-c",
          "[ -f /root/.claude.json ] && cp /root/.claude.json /root/.claude/backups/.claude.json.backup.$(date +%s) || true"
        ])

        TelegramClaude.Telegram.send_message(chat_id, "✅ Autenticado! Bot pronto para uso.")

      {^port, {:exit_status, _}} ->
        :ok
    after
      300_000 ->
        safe_close(port)
    end
  end

  defp safe_close(port) do
    try do
      Port.close(port)
    rescue
      _ -> :ok
    catch
      _, _ -> :ok
    end
  end
end
