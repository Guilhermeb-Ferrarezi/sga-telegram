defmodule TelegramClaude.API.Router do
  use Plug.Router

  plug Plug.Logger

  plug Plug.Static,
    at: "/",
    from: "/app/priv/static",
    gzip: false,
    only: ~w(assets favicon.ico)

  plug :match
  plug Plug.Parsers,
    parsers: [:json, :multipart],
    pass: ["application/json", "multipart/form-data"],
    json_decoder: Jason,
    multipart_to_params: true
  plug :dispatch

  alias TelegramClaude.API.{AuthController, RepoController, ChatController, UploadController}

  # Auth
  get "/api/auth/github", do: AuthController.github_redirect(conn, conn.query_params)
  get "/api/auth/github/callback", do: AuthController.github_callback(conn, conn.query_params)
  get "/api/auth/me", do: AuthController.me(conn, %{})
  post "/api/auth/logout", do: AuthController.logout(conn, %{})

  # Repos
  get "/api/repos", do: RepoController.list(conn, conn.query_params)
  post "/api/project/use", do: RepoController.use_project(conn, conn.body_params)
  get "/api/project", do: RepoController.current_project(conn, %{})

  # Upload
  post "/api/upload", do: UploadController.upload(conn, conn.body_params)

  # Chat
  post "/api/chat", do: ChatController.stream(conn, conn.body_params)
  get "/api/chat/history", do: ChatController.get_history(conn, %{})
  delete "/api/chat/history", do: ChatController.clear_history(conn, %{})

  # Frontend SPA — serve index.html for all non-API routes
  get _ do
    static_path = Application.get_env(:telegram_claude, :static_path, "/app/priv/static")
    index = Path.join(static_path, "index.html")

    case File.read(index) do
      {:ok, content} ->
        conn
        |> put_resp_content_type("text/html")
        |> send_resp(200, content)

      {:error, _} ->
        conn
        |> put_resp_content_type("text/plain")
        |> send_resp(404, "Frontend not built")
    end
  end

  match _ do
    conn
    |> put_resp_content_type("application/json")
    |> send_resp(404, ~s({"error":"not found"}))
  end
end
