Gere um changelog legível a partir dos commits recentes do repositório atual.

**Argumento:** `$ARGUMENTS` (opcional — número de commits, range ou tag, ex: `20`, `v1.0..HEAD`, `v1.2`, `--since 7d`)
- Padrão: últimos 20 commits
- `--since Nd`: commits dos últimos N dias
- `--version X.Y.Z`: inclui o número de versão no cabeçalho do changelog

Passos:
1. Execute `git log` com o range especificado para obter os commits com hash, autor, data e mensagem.
2. Agrupe os commits nas seguintes categorias com base nas mensagens:
   - 🚀 **Novas features** — commits com "feat", "add", "novo", "nova", "adiciona"
   - 🐛 **Correções** — commits com "fix", "bug", "corrig", "erro"
   - ⚡ **Melhorias** — commits com "perf", "optim", "melhoria", "refactor", "update"
   - 🔧 **Manutenção** — commits com "chore", "ci", "config", "deps", "bump"
   - 📝 **Documentação** — commits com "doc", "readme"
   - Outros commits não categorizados
3. Para cada entrada, inclua o hash curto do commit como link (`[abc1234]`) para facilitar rastreabilidade.
4. Formate o changelog em markdown com data do período coberto e versão (se `--version` fornecido).
5. Ao final, escreva um parágrafo resumindo as mudanças mais importantes em linguagem de usuário final (não técnica).
