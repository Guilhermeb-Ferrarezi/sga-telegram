Ajusta os recursos (réplicas, CPU, memória) de um serviço no Easypanel.

**Argumento:** `$ARGUMENTS` (formato: `[serviço] [ação] [valor]`)
- Exemplos: `sga-telegram`, `sga-telegram replicas 3`, `sga-telegram cpu 500m`, `sga-telegram memory 512m`

Passos:
1. Se `$ARGUMENTS` estiver vazio, liste os serviços disponíveis e pergunte qual escalar.
2. Se apenas o serviço for informado, mostre a configuração atual de recursos:
   - Réplicas: N instâncias rodando
   - CPU: limite atual (ex: `500m` = 0.5 core)
   - Memória: limite atual (ex: `512m`)
3. Determine a ação:
   - **replicas N**: define o número de réplicas do serviço
   - **cpu VALUE**: define o limite de CPU (ex: `250m`, `500m`, `1000m`)
   - **memory VALUE**: define o limite de memória (ex: `256m`, `512m`, `1g`)
4. **Antes de aplicar**, exiba um resumo claro:
   - Serviço: [nome]
   - Alteração: [parâmetro] de [valor atual] → [novo valor]
   - Aviso: "Esta ação pode causar reinicialização do serviço."
5. **Aguarde confirmação explícita** antes de aplicar a mudança.
6. Aplique via API do Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`) e confirme o novo estado.

⚠️ Escalas muito baixas (menos de 1 réplica, CPU < 100m) podem causar instabilidade. Alerte o usuário nesses casos.
