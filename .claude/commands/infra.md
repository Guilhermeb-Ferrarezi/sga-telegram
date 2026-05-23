Verifique o status atual da infraestrutura da Santos Games.

Execute as seguintes verificações em paralelo usando as ferramentas disponíveis:

1. **Easypanel** (`$EASYPANEL_URL`): Liste todos os projetos/serviços e mostre o status de cada um (running, stopped, error). Use a API do Easypanel com o token `$EASYPANEL_TOKEN`.

2. **Cloudflare**: Liste as zonas DNS configuradas e verifique se há algum registro com problema. Use o token `$CLOUDFLARE_TOKEN`.

Apresente um resumo no seguinte formato:
- ✅ serviços saudáveis
- ⚠️ serviços com atenção
- ❌ serviços com erro ou parados

Ao final, dê uma avaliação geral da saúde da infraestrutura em 1-2 frases.
