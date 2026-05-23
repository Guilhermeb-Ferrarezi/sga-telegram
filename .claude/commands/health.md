Verifica o status de saúde de todos os serviços no Easypanel de forma consolidada.

**Argumento:** `$ARGUMENTS` (opcional — nome de um serviço específico, ex: `sga-telegram`)

Passos:
1. Busque a lista de serviços via API do Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`).
2. Se `$ARGUMENTS` especificar um serviço, filtre apenas ele; caso contrário, liste todos.
3. Para cada serviço, exiba:
   - **Status**: 🟢 running / 🔴 stopped / 🟡 deploying / ⚫ error
   - **Nome**: projeto/serviço
   - **Uptime**: tempo desde o último start (se disponível)
   - **Último deploy**: data/hora e resultado (success/failed)
   - **Domínio**: URL do serviço (se configurado)
4. Agrupe os serviços por projeto.
5. Ao final, exiba um resumo: X serviços saudáveis, Y parados, Z com erro.
6. Se houver serviços em erro, destaque-os e sugira executar `/debug [serviço]` para investigar.
