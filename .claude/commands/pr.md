Cria um pull request bem descrito para o branch atual.

**Argumento:** `$ARGUMENTS` (opcional — título do PR. Se vazio, será gerado automaticamente)

Passos:
1. Execute `git status`, `git log main..HEAD --oneline` e `git diff main..HEAD --stat` para entender o que muda neste branch.
2. Leia os arquivos modificados mais relevantes para entender o contexto das mudanças.
3. Gere um título conciso (se não fornecido em `$ARGUMENTS`) e um corpo completo para o PR com:
   - **Resumo**: o que foi feito e por quê (2-4 bullets)
   - **Tipo de mudança**: feature / bugfix / refactor / docs / infra
   - **Como testar**: passos para validar a mudança
   - **Screenshots** (se houver mudanças de UI, mencione onde tirar)
   - **Checklist**: [ ] testes passando, [ ] build ok, [ ] sem secrets no código
4. Verifique se o branch tem remote (`git push -u origin HEAD` se necessário).
5. Crie o PR com `gh pr create` usando o título e corpo gerados.
6. Retorne a URL do PR criado.
