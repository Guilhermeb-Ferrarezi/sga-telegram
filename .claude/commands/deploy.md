Faça o deploy de um serviço no Easypanel.

**Argumento:** `$ARGUMENTS` (formato: `[serviço] [opções]`)
- Exemplos: `sga-telegram`, `sga-api --watch`, `sga-api --dry-run`
- `--watch`: mantém monitorando os logs após o deploy até estabilizar (30s sem erros)
- `--dry-run`: mostra o que seria feito sem executar

Passos:
1. Se `$ARGUMENTS` estiver vazio, liste todos os projetos disponíveis no Easypanel e peça ao usuário qual deseja fazer deploy.
2. Encontre o serviço correspondente ao nome informado na API do Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`).
3. Mostre o estado atual antes de deployar: último commit deployado, status atual e há quanto tempo está rodando.
4. Dispare o deploy do serviço.
5. Aguarde e monitore o status até o deploy completar (com sucesso ou erro).
6. Mostre o resultado final: versão deployada, tempo total, e últimas linhas de log se houver erro.
7. Se o deploy falhar, execute automaticamente `/debug [serviço]` para ajudar a diagnosticar a causa.
8. Se `--watch` estiver ativo, continue monitorando os logs por 30s após o deploy e alerte se aparecerem erros.

Confirme ao usuário o que será feito antes de executar se o deploy for destrutivo ou afetar produção.
