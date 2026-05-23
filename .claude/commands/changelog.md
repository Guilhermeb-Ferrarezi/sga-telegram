Gere um changelog legível a partir dos commits recentes do repositório atual.

**Argumento:** `$ARGUMENTS` (opcional — número de commits ou range, ex: `20` ou `v1.0..HEAD`. Padrão: últimos 20 commits)

Passos:
1. Execute `git log` com o range especificado (ou últimos 20 commits se não especificado) para obter os commits com hash, autor, data e mensagem.
2. Agrupe os commits nas seguintes categorias com base nas mensagens:
   - 🚀 **Novas features** — commits com "feat", "add", "novo", "nova"
   - 🐛 **Correções** — commits com "fix", "bug", "corrig", "erro"
   - ⚡ **Melhorias** — commits com "perf", "optim", "melhoria", "refactor"
   - 🔧 **Manutenção** — commits com "chore", "ci", "config", "deps", "bump"
   - 📝 **Documentação** — commits com "doc", "readme"
   - Outros commits não categorizados

3. Formate o changelog em markdown com data do período coberto.
4. Ao final, escreva um parágrafo resumindo as mudanças mais importantes.
