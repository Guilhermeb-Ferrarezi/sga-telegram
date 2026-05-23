Gerencia incidentes de infraestrutura: abre, atualiza e fecha ocorrências com timeline.

**Argumento:** `$ARGUMENTS` (formato: `[ação] [parâmetros]`)
- Exemplos: `(vazio)`, `open sga-api está fora`, `update #1 identificamos a causa`, `close #1 serviço restaurado`, `list`

Passos:
1. **Sem argumento ou `list`**: mostra todos os incidentes abertos com ID, serviço, descrição, duração e última atualização.
2. **`open [descrição]`**: abre um novo incidente.
   - Registre: título, timestamp de início, serviço afetado (infira da descrição se possível).
   - Automaticamente execute `/health` para capturar o estado atual dos serviços como snapshot inicial.
   - Salve o incidente em `.claude/incidents/YYYY-MM-DD-NNN.md` com a timeline.
   - Confirme com o ID gerado (ex: `#1`).
3. **`update #N [mensagem]`**: adiciona uma atualização à timeline do incidente.
   - Registre timestamp e mensagem.
   - Mostre a timeline completa atualizada.
4. **`close #N [resolução]`**: fecha o incidente.
   - Registre timestamp de fim e descrição da resolução.
   - Calcule duração total do incidente.
   - Gere um post-mortem resumido: o que aconteceu, impacto, causa raiz, resolução e próximos passos.
5. **`show #N`**: exibe a timeline completa de um incidente (aberto ou fechado).

Formato da timeline:
```
## Incidente #N — [título]
- **Início**: [timestamp]
- **Serviço**: [nome]
- **Status**: 🔴 Aberto / ✅ Resolvido

### Timeline
- HH:MM — [descrição inicial]
- HH:MM — [update 1]
- HH:MM — ✅ Resolvido: [resolução]
```
