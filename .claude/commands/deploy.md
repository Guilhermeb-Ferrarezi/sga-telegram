Faça o deploy de um serviço no Easypanel.

**Argumento:** `$ARGUMENTS` (nome do serviço/projeto a fazer deploy, ex: `sga-telegram`)

Passos:
1. Se `$ARGUMENTS` estiver vazio, liste todos os projetos disponíveis no Easypanel e peça ao usuário qual deseja fazer deploy.
2. Encontre o serviço correspondente ao nome informado na API do Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`).
3. Dispare o deploy do serviço.
4. Aguarde e monitore o status até o deploy completar (com sucesso ou erro).
5. Mostre o resultado final: versão deployada, tempo total, e últimas linhas de log se houver erro.

Confirme ao usuário o que será feito antes de executar se o deploy for destrutivo ou afetar produção.
