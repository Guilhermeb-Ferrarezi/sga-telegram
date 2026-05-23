Identifica e limpa recursos ociosos: branches git antigas, serviços parados no Easypanel e variáveis de ambiente não utilizadas.

**Argumento:** `$ARGUMENTS` (opcional — escopo: `git`, `easypanel`, `all`. Padrão: `all`)

Passos:
1. **Branches git antigas** (se escopo `git` ou `all`):
   - Execute `git branch -r --merged main` para listar branches remotas já mergeadas.
   - Execute `git for-each-ref --sort=committerdate refs/remotes/ --format='%(refname:short) %(committerdate:relative)'` para ver as mais antigas.
   - Liste as branches com mais de 30 dias sem commit e que já foram mergeadas no main.
   - Pergunte quais deletar antes de agir.

2. **Serviços parados no Easypanel** (se escopo `easypanel` ou `all`):
   - Busque a lista de serviços via API do Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`).
   - Filtre serviços com status `stopped` ou `error` há mais de 7 dias.
   - Mostre: nome, projeto, status, último deploy, uso de memória/CPU se disponível.
   - **Não delete** automaticamente — liste e pergunte o que fazer.

3. **Resumo e ações recomendadas**:
   - Mostre um resumo: X branches para deletar, Y serviços parados, Z recursos ociosos.
   - Para cada item, sugira a ação (`git push origin --delete <branch>`, restart ou remoção no Easypanel).
   - **Aguarde confirmação explícita** antes de qualquer ação destrutiva.
   - Após confirmação, execute as ações e confirme o resultado.

⚠️ Nunca delete branches ou serviços sem confirmação explícita do usuário.
