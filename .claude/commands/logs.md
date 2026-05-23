Busca e exibe logs de um serviço no Easypanel.

**Argumento:** `$ARGUMENTS` (formato: `[serviço] [filtro] [opções]`)
- Exemplos: `sga-telegram`, `sga-telegram error`, `sga-telegram --since 2h`, `sga-telegram --lines 100`
- `--since Xh` ou `--since Xm`: janela de tempo (padrão: últimos 30 minutos)
- `--lines N`: número de linhas a exibir (padrão: 50)
- `--errors`: atalho para filtrar apenas linhas de erro/warning

Passos:
1. Se `$ARGUMENTS` estiver vazio, liste os projetos disponíveis no Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`) e pergunte qual serviço o usuário quer ver.
2. Busque os logs do período especificado via API do Easypanel.
3. Se um filtro/palavra-chave foi passado, filtre as linhas que contêm esse termo (case-insensitive).
4. Exiba as linhas com timestamp, destacando:
   - 🔴 linhas com `error`, `exception`, `fatal`, `crash`
   - 🟡 linhas com `warn`, `warning`, `deprecated`
   - 🟢 linhas com `started`, `ready`, `listening`, `connected`
5. Se houver mais de 10 erros no período, agrupe por tipo e mostre frequência antes das linhas brutas.
6. Ao final, faça uma análise breve: há erros recorrentes? O serviço parece saudável? Se sim, sugira `/debug [serviço]` para investigação mais profunda.
