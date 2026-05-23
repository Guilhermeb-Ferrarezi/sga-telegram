Executa um comando arbitrário dentro de um container no Easypanel.

**Argumento:** `$ARGUMENTS` (formato: `[serviço] [comando]`)
- Exemplos: `sga-api`, `sga-api ls -la /app`, `sga-api mix deps.get`, `sga-api iex -S mix`

Passos:
1. Se `$ARGUMENTS` estiver vazio, liste os serviços disponíveis e pergunte qual usar.
2. Se apenas o serviço for informado, mostre exemplos de comandos úteis para o runtime detectado (Elixir, Node, Python, etc).
3. **Antes de executar**, exiba:
   - Serviço: [nome]
   - Comando: `[comando completo]`
   - Se o comando parecer destrutivo (`rm`, `drop`, `delete`, `truncate`, `kill`), adicione aviso explícito e peça confirmação.
4. Execute o comando no container via API do Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`).
5. Mostre o output completo com formatação adequada (código, se for output técnico).
6. Se o comando falhar, mostre o stderr e sugira causas prováveis.

⚠️ Nunca execute comandos destrutivos sem confirmação explícita do usuário.
