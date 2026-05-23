Exibe o histórico de ações recentes nos serviços: deploys, mudanças de env e reinicializações.

**Argumento:** `$ARGUMENTS` (opcional — serviço e período, ex: `sga-api`, `sga-api 7d`, `24h`)
- Período padrão: `24h`

Passos:
1. Busque o histórico de eventos via API do Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`):
   - Deploys: quem disparou, commit/imagem, resultado (success/failed), timestamp
   - Mudanças de variáveis de ambiente: quando ocorreram (sem exibir valores sensíveis)
   - Reinicializações e crashes: timestamp e motivo se disponível
2. Se `$ARGUMENTS` especificar um serviço, filtre apenas ele; caso contrário, agrupe por serviço.
3. Exiba a timeline em ordem cronológica decrescente (mais recente primeiro):
   ```
   [timestamp] 🚀 Deploy — sga-api — commit abc1234 — ✅ success
   [timestamp] ⚙️  Env changed — sga-api — 2 variáveis alteradas
   [timestamp] 🔄 Restart — sga-api — exit code 137 (OOM)
   [timestamp] 🚀 Deploy — sga-api — commit def5678 — ❌ failed
   ```
4. Destaque eventos críticos (falhas, crashes, OOM) em 🔴.
5. Ao final, mostre um resumo do período: X deploys (Y sucesso, Z falha), W restarts.
