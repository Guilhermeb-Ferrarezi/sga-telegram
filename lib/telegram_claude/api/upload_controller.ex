defmodule TelegramClaude.API.UploadController do
  import Plug.Conn
  require Logger

  @upload_dir "/tmp/claude_uploads"

  def upload(conn, %{"file" => %Plug.Upload{path: tmp_path, filename: filename, content_type: ct}}) do
    with session when not is_nil(session) <- TelegramClaude.API.Session.get(conn),
         true <- String.starts_with?(ct, "image/") do
      File.mkdir_p!(@upload_dir)
      ext = Path.extname(filename)
      dest = Path.join(@upload_dir, "#{:erlang.unique_integer([:positive])}#{ext}")
      File.copy!(tmp_path, dest)
      Logger.info("Imagem salva: #{dest}")
      conn
      |> put_resp_content_type("application/json")
      |> send_resp(200, Jason.encode!(%{path: dest}))
    else
      nil ->
        conn |> put_resp_content_type("application/json") |> send_resp(401, ~s({"error":"unauthenticated"}))
      false ->
        conn |> put_resp_content_type("application/json") |> send_resp(400, ~s({"error":"apenas imagens são permitidas"}))
    end
  end

  def upload(conn, _) do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(400, ~s({"error":"nenhum arquivo enviado"}))
  end
end
