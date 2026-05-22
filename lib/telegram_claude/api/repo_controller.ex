defmodule TelegramClaude.API.RepoController do
  import Plug.Conn
  require Logger

  @github_api "https://api.github.com"

  def list(conn, params) do
    with session when not is_nil(session) <- TelegramClaude.API.Session.get(conn) do
      page = Map.get(params, "page", "1")
      per_page = Map.get(params, "per_page", "30")
      token = session["github_token"]

      case Req.get("#{@github_api}/user/repos",
             headers: [
               {"authorization", "Bearer #{token}"},
               {"user-agent", "SantosGames-Bot"}
             ],
             params: [page: page, per_page: per_page, sort: "updated", affiliation: "owner,collaborator"]
           ) do
        {:ok, %{status: 200, body: repos}} ->
          filtered =
            Enum.map(repos, fn r ->
              %{
                id: r["id"],
                name: r["name"],
                full_name: r["full_name"],
                description: r["description"],
                language: r["language"],
                stargazers_count: r["stargazers_count"],
                private: r["private"],
                html_url: r["html_url"],
                updated_at: r["updated_at"]
              }
            end)

          conn
          |> put_resp_content_type("application/json")
          |> send_resp(200, Jason.encode!(filtered))

        {:ok, %{status: status, body: body}} ->
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(status, Jason.encode!(%{error: inspect(body)}))

        {:error, reason} ->
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(500, Jason.encode!(%{error: inspect(reason)}))
      end
    else
      nil ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(401, ~s({"error":"unauthenticated"}))
    end
  end

  def use_project(conn, params) do
    with session when not is_nil(session) <- TelegramClaude.API.Session.get(conn),
         %{"owner" => owner, "repo" => repo} <- params do
      base_dir = Application.get_env(:telegram_claude, :project_dir, "/app/project")
      project_path = Path.join(base_dir, "#{owner}-#{repo}")
      token = session["github_token"]
      clone_url = "https://oauth2:#{token}@github.com/#{owner}/#{repo}.git"

      result =
        if File.dir?(Path.join(project_path, ".git")) do
          Logger.info("Pulling #{owner}/#{repo}")
          System.cmd("git", ["-C", project_path, "pull", "--ff-only"],
            stderr_to_stdout: true
          )
        else
          Logger.info("Cloning #{owner}/#{repo}")
          File.mkdir_p!(project_path)
          System.cmd("git", ["clone", clone_url, project_path], stderr_to_stdout: true)
        end

      case result do
        {_, 0} ->
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(200, Jason.encode!(%{path: project_path, full_name: "#{owner}/#{repo}"}))

        {output, code} ->
          Logger.error("Git error #{code}: #{output}")
          conn
          |> put_resp_content_type("application/json")
          |> send_resp(500, Jason.encode!(%{error: "Git failed: #{String.slice(output, 0, 200)}"}))
      end
    else
      nil ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(401, ~s({"error":"unauthenticated"}))

      _ ->
        conn
        |> put_resp_content_type("application/json")
        |> send_resp(400, ~s({"error":"owner and repo are required"}))
    end
  end

  def current_project(conn, _params) do
    session = TelegramClaude.API.Session.get(conn)
    project_dir = Application.get_env(:telegram_claude, :project_dir, "/app/project")

    cond do
      is_nil(session) ->
        conn |> put_resp_content_type("application/json") |> send_resp(401, ~s({"error":"unauthenticated"}))

      true ->
        case find_active_project(project_dir) do
          nil ->
            conn |> put_resp_content_type("application/json") |> send_resp(404, ~s({"error":"no project"}))
          project ->
            conn |> put_resp_content_type("application/json") |> send_resp(200, Jason.encode!(project))
        end
    end
  end

  defp find_active_project(base_dir) do
    case File.ls(base_dir) do
      {:ok, entries} ->
        entries
        |> Enum.filter(fn e -> File.dir?(Path.join([base_dir, e, ".git"])) end)
        |> Enum.map(fn e ->
          path = Path.join(base_dir, e)
          stat = File.stat!(path)
          {stat.mtime, %{path: path, full_name: String.replace(e, "-", "/", global: false)}}
        end)
        |> Enum.sort_by(fn {mtime, _} -> mtime end, :desc)
        |> case do
          [{_, project} | _] -> project
          [] -> nil
        end

      _ -> nil
    end
  end
end
