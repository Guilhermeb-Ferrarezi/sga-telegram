Verifica o status dos certificados SSL de domínios configurados no Cloudflare e Easypanel.

**Argumento:** `$ARGUMENTS` (opcional — domínio específico, ex: `santosgames.com.br`)

Passos:
1. Se `$ARGUMENTS` especificar um domínio, verifique apenas ele; caso contrário, busque todos os domínios configurados:
   - Zonas do Cloudflare via API (`$CLOUDFLARE_TOKEN`)
   - Domínios/serviços expostos no Easypanel via API (`$EASYPANEL_URL`, token `$EASYPANEL_TOKEN`)
2. Para cada domínio, verifique o certificado SSL:
   - Execute `openssl s_client -connect [domínio]:443 -servername [domínio]` ou use chamada HTTPS para inspecionar o cert.
   - Extraia: emissor, data de expiração, SANs (Subject Alternative Names), e se é válido.
3. Exiba o status de cada domínio:
   - ✅ Válido — expira em X dias
   - ⚠️ Expira em breve — menos de 30 dias
   - 🔴 Expirado ou inválido
   - ⚫ Não foi possível verificar (domínio inacessível)
4. Se houver certificados expirando em menos de 30 dias, sugira renovação via Cloudflare ou Let's Encrypt.
5. Ao final, exiba um resumo: X válidos, Y expirando em breve, Z expirados.
