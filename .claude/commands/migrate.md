Executa migrações de banco de dados em um serviço via Easypanel.

**Argumento:** `$ARGUMENTS` (formato: `[serviço] [ação]`)
- Exemplos: `sga-api`, `sga-api run`, `sga-api status`, `sga-api rollback`

Passos:
1. Se `$ARGUMENTS` estiver vazio, liste os serviços disponíveis e pergunte qual usar.
2. Determine a ação:
   - **status** (padrão): mostra o estado atual das migrações — quais foram aplicadas, quais estão pendentes.
   - **run**: executa as migrações pendentes.
   - **rollback**: reverte a última migração aplicada.
3. Para **run** e **rollback**, exiba um resumo antes de executar:
   - Serviço: [nome]
   - Ação: [run/rollback]
   - Migrações afetadas: lista das migrações que serão executadas ou revertidas
   - Aviso: "Esta ação altera o schema do banco de dados em produção."
4. **Aguarde confirmação explícita** ("sim" / "confirmar") antes de executar run ou rollback.
5. Execute o comando no container via API do Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`):
   - Para projetos Elixir/Phoenix: `mix ecto.migrate` ou `mix ecto.rollback`
   - Para projetos Node.js: detecte o runner (Prisma, Knex, Sequelize) e use o comando adequado
   - Para projetos Rails: `rails db:migrate` ou `rails db:rollback`
6. Mostre o output do comando em tempo real e confirme o resultado final.

⚠️ Rollback em produção pode causar perda de dados. Certifique-se de ter um backup antes.
