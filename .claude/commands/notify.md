Envia uma notificação ou alerta para canais configurados (Telegram, Slack, Discord).

**Argumento:** `$ARGUMENTS` (formato: `[canal] [mensagem]` ou apenas `[mensagem]`)
- Exemplos: `Deploy concluído com sucesso`, `slack Deploy concluído`, `telegram Alerta: sga-api fora`
- Canal padrão: `telegram` (o próprio chat atual)

Passos:
1. Determine o canal de destino:
   - **telegram**: envia de volta para o chat do Telegram atual (útil para notificações futuras via loop)
   - **slack**: usa o webhook `$SLACK_WEBHOOK_URL` se configurado
   - **discord**: usa o webhook `$DISCORD_WEBHOOK_URL` se configurado
   - Se o canal não estiver configurado, informe e use o Telegram como fallback.
2. Formate a mensagem:
   - Prefixe com o timestamp atual
   - Se a mensagem mencionar um serviço do Easypanel, adicione o status atual (🟢/🔴) automaticamente
   - Suporte a variáveis: `{status:sga-api}` → status atual do serviço
3. Envie a mensagem para o canal escolhido.
4. Confirme o envio com: canal, destinatário e preview da mensagem enviada.

**Casos de uso comuns:**
- Notificar equipe após um deploy: `/notify slack Deploy da sga-api concluído ✅`
- Criar alerta de monitoramento com `/loop`: `/loop 5m /notify se sga-api estiver com erro`
- Confirmar ação manual: `/notify Migração executada com sucesso por [usuário]`
