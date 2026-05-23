Faz um code review detalhado das mudanças do branch atual em relação ao main.

**Argumento:** `$ARGUMENTS` (opcional — foco do review, ex: `segurança`, `performance`, `testes`, `PR #42`)

Passos:
1. Execute `git diff main..HEAD` e `git log main..HEAD --oneline` para obter as mudanças.
2. Se `$ARGUMENTS` referenciar um PR (ex: `PR #42` ou um número), use `gh pr diff` para obter o diff desse PR específico.
3. Leia os arquivos modificados completos (não só o diff) para ter contexto.
4. Realize o review com foco nas seguintes categorias — dê atenção especial ao foco especificado em `$ARGUMENTS` se houver:

   **🐛 Bugs e corretude**
   - Lógica incorreta, condições de borda não tratadas, null/undefined não verificados

   **🔒 Segurança**
   - Injeção de código, secrets expostos, validação de entrada insuficiente, autenticação/autorização

   **⚡ Performance**
   - Queries N+1, loops desnecessários, falta de cache, blocking I/O

   **🧹 Qualidade de código**
   - Duplicação, funções muito longas, nomes confusos, comentários desnecessários

   **✅ Testes**
   - Falta de cobertura para casos críticos, testes frágeis

5. Para cada problema encontrado, indique: arquivo, linha aproximada, severidade (🔴 crítico / 🟡 sugestão / 🔵 nitpick) e a correção recomendada.
6. Finalize com um veredito geral: ✅ Aprovado / ⚠️ Aprovado com ressalvas / ❌ Mudanças necessárias.
