Cria um pull request bem descrito para o branch atual.

**Argumento:** `$ARGUMENTS` (opcional — título do PR ou flags)
- Exemplos: `Corrige login com Google`, `--draft`, `--reviewer guilherme`
- `--draft`: cria o PR como rascunho
- `--reviewer @usuario`: adiciona revisor automaticamente
- `--base branch`: branch de destino (padrão: main)

Passos:
1. Execute `git status`, `git log main..HEAD --oneline` e `git diff main..HEAD --stat` para entender o que muda neste branch.
2. Leia os arquivos modificados mais relevantes para entender o contexto das mudanças.
3. Verifique se já existe um PR aberto para este branch com `gh pr list --head $(git branch --show-current)`. Se sim, ofereça atualizar o existente em vez de criar um novo.
4. Gere um título conciso (se não fornecido em `$ARGUMENTS`) e um corpo completo para o PR com:
   - **Resumo**: o que foi feito e por quê (2-4 bullets)
   - **Tipo de mudança**: feature / bugfix / refactor / docs / infra
   - **Como testar**: passos para validar a mudança
   - **Screenshots** (se houver mudanças de UI, mencione onde tirar)
   - **Checklist**: [ ] testes passando, [ ] build ok, [ ] sem secrets no código
5. Verifique se o branch tem remote (`git push -u origin HEAD` se necessário).
6. Crie o PR com `gh pr create` usando o título e corpo gerados, aplicando as flags passadas.
7. Retorne a URL do PR criado.
