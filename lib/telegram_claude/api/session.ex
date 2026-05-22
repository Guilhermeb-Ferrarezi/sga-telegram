defmodule TelegramClaude.API.Session do
  @cookie_name "sg_session"
  @max_age 60 * 60 * 24 * 30

  def put(conn, data) do
    token = sign(data)
    Plug.Conn.put_resp_cookie(conn, @cookie_name, token,
      http_only: true,
      same_site: "Lax",
      max_age: @max_age,
      path: "/"
    )
  end

  def get(conn) do
    conn = Plug.Conn.fetch_cookies(conn)
    case Map.get(conn.cookies, @cookie_name) do
      nil -> nil
      token ->
        case verify(token) do
          {:ok, data} -> data
          _ -> nil
        end
    end
  end

  def delete(conn) do
    Plug.Conn.delete_resp_cookie(conn, @cookie_name, path: "/")
  end

  defp sign(data) do
    secret = secret_key()
    payload = data |> Jason.encode!() |> Base.url_encode64(padding: false)
    sig = :crypto.mac(:hmac, :sha256, secret, payload) |> Base.url_encode64(padding: false)
    "#{payload}.#{sig}"
  end

  defp verify(token) do
    secret = secret_key()
    with [payload, sig] <- String.split(token, ".", parts: 2),
         expected <- :crypto.mac(:hmac, :sha256, secret, payload) |> Base.url_encode64(padding: false),
         true <- Plug.Crypto.secure_compare(sig, expected),
         {:ok, json} <- Base.url_decode64(payload, padding: false),
         {:ok, data} <- Jason.decode(json) do
      {:ok, data}
    else
      _ -> {:error, :invalid}
    end
  end

  defp secret_key do
    Application.get_env(:telegram_claude, :api_secret, String.duplicate("x", 32))
  end
end
