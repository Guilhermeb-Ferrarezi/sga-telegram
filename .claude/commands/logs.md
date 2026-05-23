Busca e exibe logs de um serviço no Easypanel.

**Argumento:** `$ARGUMENTS` (formato: `[serviço] [filtro]`, ex: `sga-telegram error` ou apenas `sga-telegram`)

Passos:
1. Se `$ARGUMENTS` estiver vazio, liste os projetos disponíveis no Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`) e pergunte qual serviço o usuário quer ver.
2. Busque os logs mais recentes do serviço informado via API do Easypanel.
3. Se um filtro/palavra-chave foi passado como segundo argumento, filtre as linhas que contêm esse termo (case-insensitive).
4. Exiba as últimas 50 linhas relevantes com timestamp, destacando:
   - 🔴 linhas com `error`, `exception`, `fatal`, `crash`
   - 🟡 linhas com `warn`, `warning`, `deprecated`
   - 🟢 linhas com `started`, `ready`, `listening`, `connected`
5. Ao final, faça uma análise breve: há erros recorrentes? O serviço parece saudável?
