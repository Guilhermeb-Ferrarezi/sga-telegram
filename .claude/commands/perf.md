Analisa a performance de um serviço com base em logs e métricas do Easypanel.

**Argumento:** `$ARGUMENTS` (opcional — serviço e período, ex: `sga-api`, `sga-api 1h`, `sga-api 24h`)
- Período padrão: `1h`

Passos:
1. Se `$ARGUMENTS` estiver vazio, liste os serviços e pergunte qual analisar.
2. Busque logs e métricas do período especificado via API do Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`).
3. Analise os logs de requisição HTTP para extrair:
   - **Tempo de resposta**: p50, p95, p99 e média
   - **Throughput**: requisições por minuto (rpm)
   - **Taxa de erro**: % de respostas 4xx e 5xx
   - **Endpoints mais lentos**: top 5 por tempo médio de resposta
   - **Endpoints mais chamados**: top 5 por volume
4. Analise métricas de infraestrutura:
   - **CPU**: uso médio e pico no período
   - **Memória**: uso médio e pico, e se houve OOM kill
   - **Restart count**: quantas vezes o container reiniciou
5. Exiba um dashboard textual com os dados acima.
6. Se houver degradação visível (p95 > 2s, error rate > 1%, restarts > 0), destaque em 🔴 e sugira causas com base nos logs.
7. Compare com o período anterior se possível e indique tendência (↑ piorando / ↓ melhorando / → estável).
