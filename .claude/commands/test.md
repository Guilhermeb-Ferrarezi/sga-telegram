Executa a suíte de testes de um serviço e reporta os resultados.

**Argumento:** `$ARGUMENTS` (formato: `[serviço] [filtro]`)
- Exemplos: `sga-api`, `sga-api auth`, `sga-api --only unit`, `sga-api UserController`

Passos:
1. Se `$ARGUMENTS` estiver vazio, use o projeto atual inferindo pelo diretório ou pergunte qual serviço testar.
2. Detecte o runtime e o comando de testes adequado:
   - **Elixir/Phoenix**: `mix test [filtro]`
   - **Node.js/TypeScript**: `npm test` ou `npx vitest run` ou `npx jest [filtro]`
   - **Python**: `pytest [filtro]`
   - **Ruby/Rails**: `bundle exec rspec [filtro]`
3. Execute via `/exec [serviço] [comando de testes]` no container.
4. Parse o output e exiba um resumo estruturado:
   ```
   ✅ Passou:  42 testes
   ❌ Falhou:   3 testes
   ⏭️  Pulado:   1 teste
   ⏱️  Tempo:   4.2s
   ```
5. Para testes que falharam, liste cada um com:
   - Nome do teste
   - Arquivo e linha
   - Mensagem de erro resumida (sem stack trace completo, a menos que pedido)
6. Se todos passarem: `✅ Todos os testes passaram.`
7. Se houver falhas: sugira executar `/debug [serviço]` ou `/exec [serviço] mix test --trace` para mais detalhes.
