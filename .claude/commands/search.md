Busca por um termo em logs, variáveis de ambiente ou código dos serviços no Easypanel.

**Argumento:** `$ARGUMENTS` (formato: `[escopo] [termo]`)
- Exemplos: `logs erro de conexão`, `env DATABASE`, `logs sga-api timeout`, `code TODO`
- Escopos: `logs` (padrão), `env`, `code`

Passos:
1. Determine o escopo e o termo de busca a partir de `$ARGUMENTS`. Se ambíguo, assuma `logs`.
2. **Escopo `logs`**:
   - Se um serviço for mencionado antes do termo, busque apenas nele; caso contrário, busque em todos os serviços.
   - Consulte logs das últimas 6 horas via API do Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`).
   - Retorne as linhas que contenham o termo, com: serviço, timestamp e linha completa.
   - Destaque o termo encontrado na linha.
   - Agrupe por serviço e mostre no máximo 10 ocorrências por serviço.
3. **Escopo `env`**:
   - Busca pelo nome da variável (não pelo valor) em todos os serviços.
   - Lista em quais serviços a variável existe.
   - **Nunca exiba valores** de variáveis que contenham `password`, `secret`, `token`, `key`, `pass`, `pwd`.
4. **Escopo `code`**:
   - Execute `grep -rn "[termo]" --include="*.ex" --include="*.ts" --include="*.tsx" --include="*.js"` no repositório atual.
   - Exiba arquivo, linha e contexto (2 linhas antes/depois).
5. Ao final, mostre o total de ocorrências encontradas e onde.
