Reverte um serviço no Easypanel para um deploy anterior.

**Argumento:** `$ARGUMENTS` (formato: `[serviço] [índice]`, ex: `sga-telegram` ou `sga-telegram 2`)
- Índice 1 = deploy imediatamente anterior, 2 = dois antes, etc.

Passos:
1. Se `$ARGUMENTS` estiver vazio, liste os projetos disponíveis e pergunte qual serviço reverter.
2. Busque o histórico de deploys do serviço via API do Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`).
3. Liste os deploys disponíveis com: índice, data/hora, commit ou imagem, e status (success/failed).
4. Se um índice foi fornecido, use-o; caso contrário, mostre a lista e peça que o usuário escolha.
5. **Antes de executar**, mostre um resumo claro:
   - Deploy atual: [data, versão]
   - Deploy alvo: [data, versão]
   - Aviso: "Esta ação irá substituir o deploy atual em produção."
6. Aguarde confirmação explícita do usuário ("sim" / "confirmar") antes de executar.
7. Dispare o rollback e monitore até completar.
8. Confirme o resultado com o status final do serviço.
