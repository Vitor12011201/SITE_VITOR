# Arquitetura futura de Private Preview

Situação atual: não existe sistema de preview privado no projeto. Nenhuma rota, PIN,
cookie ou lógica de autenticação foi adicionada nesta tarefa.

## Integração recomendada

- Rotas isoladas por slug, por exemplo `/preview/{slug}/`.
- Proteção no Worker antes de entregar qualquer asset do preview; ocultação por
  JavaScript no navegador não é proteção.
- PIN armazenado como hash em secret/variável do ambiente, nunca no repositório ou no
  bundle estático.
- Cookie curto, `HttpOnly`, `Secure`, `SameSite=Strict`, limitado ao path do preview.
- Logout explícito e expiração configurável.
- Slug desconhecido retorna 404, sem revelar quais prospects existem.
- Página de acesso e conteúdo protegidos com `noindex, nofollow` e cabeçalho
  `X-Robots-Tag`.
- Limitação de tentativas por origem e janela de tempo.
- Disclosure visível: demonstração independente, escopo conceitual e ausência de
  afiliação até aprovação.
- CTA do preview leva à STANDLOUD sem inventar resultados, urgência ou vínculo.

## Dependências futuras

Essa arquitetura exige código Worker, secrets e decisão de infraestrutura. Deve ser
tratada como tarefa separada, com autorização explícita, threat model, testes de 404,
cookie, rate limit e acesso mobile antes de produção.
