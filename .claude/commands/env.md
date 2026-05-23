Gerencia variáveis de ambiente de um serviço no Easypanel.

**Argumento:** `$ARGUMENTS` (formato: `[serviço] [ação] [CHAVE=VALOR]`)
- Exemplos: `sga-telegram`, `sga-telegram list`, `sga-telegram set DATABASE_URL=postgres://...`, `sga-telegram unset OLD_VAR`

Passos:
1. Se `$ARGUMENTS` estiver vazio, liste os projetos disponíveis e pergunte qual serviço gerenciar.
2. Determine a ação solicitada:
   - **list** (padrão): lista todas as variáveis de ambiente do serviço. **Mascare valores sensíveis** — mostre apenas os primeiros 4 e últimos 2 caracteres de valores que pareçam senhas, tokens ou secrets (ex: `sk-ab...xy`).
   - **set CHAVE=VALOR**: adiciona ou atualiza a variável. Confirme antes de aplicar.
   - **unset CHAVE**: remove a variável. Confirme antes de aplicar e alerte se parecer crítica.
3. Use a API do Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`) para ler/escrever as variáveis.
4. Após qualquer alteração, pergunte se o usuário quer fazer um redeploy para aplicar as mudanças.

⚠️ Nunca exiba valores completos de variáveis que contenham palavras como: `password`, `secret`, `token`, `key`, `pass`, `pwd`.
