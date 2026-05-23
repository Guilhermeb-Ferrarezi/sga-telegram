Gera um relatório de standup diário com base na atividade recente do repositório.

**Argumento:** `$ARGUMENTS` (opcional — seu nome ou @usuario do git, ou `--copy` para formatar pronto para colar)
- Exemplos: `guilherme`, `--copy`, `guilherme --copy`
- `--copy`: formata o output como texto puro (sem markdown) pronto para colar no Slack/Discord

Passos:
1. Execute `git log --since="yesterday" --oneline --author="$ARGUMENTS"` (ou sem `--author` se vazio) para pegar os commits das últimas 24h. Se não houver commits de ontem, expanda para os últimos 2 dias.
2. Execute `git diff --stat HEAD~5..HEAD` para ter uma noção do volume de mudanças.
3. Verifique se há PRs abertos com `gh pr list --author="$ARGUMENTS"` (se `gh` disponível).
4. Verifique o status dos serviços no Easypanel para mencionar se houve algum deploy ou incidente.
5. Monte o relatório no formato de standup:

---
## Standup — [data de hoje]

**✅ O que fiz:**
[lista dos commits agrupados por tema, em linguagem humana — não apenas copie as mensagens de commit]

**🔄 O que vou fazer hoje:**
[inferido a partir do contexto: issues abertas, PRs em review, próximos passos lógicos]

**🚧 Bloqueios:**
[mencione apenas se houver branches sem merge há muito tempo, conflitos pendentes, ou PRs sem review]

---

Seja direto e use linguagem natural, não técnica demais.
