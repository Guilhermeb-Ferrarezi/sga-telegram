Inspeciona e gerencia o banco de dados de um serviço no Easypanel.

**Argumento:** `$ARGUMENTS` (formato: `[serviço] [ação] [parâmetros]`)
- Exemplos: `sga-api`, `sga-api tables`, `sga-api size`, `sga-api query "SELECT count(*) FROM users"`, `sga-api connections`

Passos:
1. Se `$ARGUMENTS` estiver vazio, liste os serviços com banco de dados configurado e pergunte qual usar.
2. Determine a ação:
   - **tables** (padrão): lista todas as tabelas com contagem de linhas e tamanho em disco.
   - **size**: mostra o tamanho total do banco, tabela por tabela, ordenado do maior para o menor.
   - **connections**: mostra conexões ativas, idle e o limite configurado.
   - **query "SQL"**: executa uma query SELECT. **Bloqueie** qualquer query que não seja SELECT (INSERT, UPDATE, DELETE, DROP, TRUNCATE) sem confirmação explícita.
   - **slow**: lista as queries mais lentas (se `pg_stat_statements` estiver disponível).
3. Execute via `/exec [serviço] [comando]` no container usando o CLI do banco (psql, mysql, sqlite3).
4. Exiba o resultado em formato de tabela quando possível.
5. Para queries destrutivas confirmadas, mostre quantas linhas serão afetadas antes de executar.

⚠️ Nunca execute queries de escrita sem confirmação explícita. Em caso de dúvida, recuse e peça ao usuário para confirmar a intenção.
