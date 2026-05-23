Analisa erros recentes de um serviço e sugere causas e soluções.

**Argumento:** `$ARGUMENTS` (nome do serviço, ex: `sga-telegram`. Se vazio, usa o projeto atual)

Passos:
1. Identifique o serviço: use `$ARGUMENTS` ou infira pelo diretório atual.
2. Busque os logs das últimas 2 horas via API do Easypanel (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`), focando em linhas de erro, exception, crash ou warning.
3. Analise os erros encontrados e agrupe por tipo/frequência.
4. Para cada grupo de erro, forneça:
   - **Erro**: descrição do problema (stack trace resumida se houver)
   - **Frequência**: quantas vezes ocorreu e quando foi a última
   - **Causa provável**: explique em linguagem simples o que pode estar causando
   - **Soluções sugeridas**: passos concretos para investigar e resolver, em ordem de probabilidade
5. Se o erro estiver relacionado a código do repositório atual, localize o arquivo/função responsável e sugira a correção.
6. Se não houver erros, confirme que o serviço está operando normalmente e mostre as métricas positivas.
