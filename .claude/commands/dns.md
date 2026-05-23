Gerencia registros DNS no Cloudflare.

**Argumento:** `$ARGUMENTS` (formato: `[domínio] [ação] [parâmetros]`)
- Exemplos: `(vazio)`, `lista`, `santosgames.com.br`, `santosgames.com.br add A api 1.2.3.4`, `santosgames.com.br del A www`

Passos:
1. **Sem argumento ou `lista`**: mostre todas as zonas DNS configuradas com domínio, status (active/paused) e nameservers.
2. **Só domínio** (ex: `santosgames.com.br`): liste todos os registros DNS da zona — tipo, nome, valor, TTL, proxy (🟠 proxied / ⚫ DNS only).
3. **`[domínio] add [TIPO] [NOME] [VALOR] [ttl]`**: cria um novo registro DNS. Confirme antes de criar.
4. **`[domínio] del [TIPO] [NOME]`**: remove um registro DNS. **Exija confirmação explícita** antes de deletar.
5. **`[domínio] check`**: verifica a propagação DNS do domínio — resolve o domínio em múltiplos resolvers (1.1.1.1, 8.8.8.8) e verifica se o certificado SSL está válido.

Use a API do Cloudflare com o token `$CLOUDFLARE_TOKEN`.

⚠️ Para ações de escrita (add/del), sempre descreva o que vai fazer e aguarde confirmação do usuário.
