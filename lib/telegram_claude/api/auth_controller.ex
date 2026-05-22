defmodule TelegramClaude.API.AuthController do
  import Plug.Conn
  require Logger

  @github_authorize_url "https://github.com/login/oauth/authorize"
  @github_token_url "https://github.com/login/oauth/access_token"
  @github_user_url "https://api.github.com/user"

  def github_redirect(conn, _params) do
    client_id = Application.get_env(:telegram_claude, :github_client_id, "")
    redirect_uri = Application.get_env(:telegram_claude, :github_redirect_uri, "")

    url =
      "#{@github_authorize_url}?client_id=#{client_id}&redirect_uri=#{URI.encode_www_form(redirect_uri)}&scope=repo"

    conn
    |> put_resp_header("location", url)
    |> send_resp(302, "")
  end

  def github_callback(conn, %{"code" => code}) do
    client_id = Application.get_env(:telegram_claude, :github_client_id, "")
    client_secret = Application.get_env(:telegram_claude, :github_client_secret, "")

    with {:ok, access_token} <- exchange_code(client_id, client_secret, code),
         {:ok, user} <- fetch_user(access_token) do
      session = %{
        "github_token" => access_token,
        "login" => user["login"],
        "avatar_url" => user["avatar_url"],
        "name" => user["name"]
      }

      frontend_url = Application.get_env(:telegram_claude, :frontend_url, "/dashboard")

      conn
      |> TelegramClaude.API.Session.put(session)
      |> put_resp_header("location", frontend_url)
      |> send_resp(302, "")
    else
      {:error, reason} ->
        Logger.error("GitHub OAuth error: #{inspect(reason)}")
        conn |> put_resp_header("location", "/login?error=auth_failed") |> send_resp(302, "")
    end
  end

  def github_callback(conn, _params) do
    conn |> put_resp_header("location", "/login?error=no_code") |> send_resp(302, "")
  end

  def me(conn, _params) do
    case TelegramClaude.API.Session.get(conn) do
      nil ->
        conn |> put_resp_content_type("application/json") |> send_resp(401, ~s({"error":"unauthenticated"}))

      session ->
        json = Jason.encode!(%{
          login: session["login"],
          avatar_url: session["avatar_url"],
          name: session["name"]
        })
        conn |> put_resp_content_type("application/json") |> send_resp(200, json)
    end
  end

  def logout(conn, _params) do
    conn
    |> TelegramClaude.API.Session.delete()
    |> put_resp_content_type("application/json")
    |> send_resp(200, ~s({"ok":true}))
  end

  defp exchange_code(client_id, client_secret, code) do
    case Req.post(@github_token_url,
           form: [client_id: client_id, client_secret: client_secret, code: code],
           headers: [{"accept", "application/json"}]
         ) do
      {:ok, %{status: 200, body: %{"access_token" => token}}} -> {:ok, token}
      {:ok, resp} -> {:error, resp.body}
      {:error, reason} -> {:error, reason}
    end
  end

  defp fetch_user(token) do
    case Req.get(@github_user_url,
           headers: [
             {"authorization", "Bearer #{token}"},
             {"user-agent", "SantosGames-Bot"}
           ]
         ) do
      {:ok, %{status: 200, body: user}} -> {:ok, user}
      {:ok, resp} -> {:error, resp.body}
      {:error, reason} -> {:error, reason}
    end
  end
end
