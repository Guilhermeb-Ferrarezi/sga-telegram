defmodule TelegramClaudeTest do
  use ExUnit.Case
  doctest TelegramClaude

  test "greets the world" do
    assert TelegramClaude.hello() == :world
  end
end
