# Plano incremental de melhoria — STANDLOUD

Fonte: `docs/STANDLOUD-SITE-AUDIT.md` e evidências em `qa/baseline/`.

## Direção

Preservar a identidade e a stack estática. Melhorar a Home
como jornada comercial:

**atenção → entendimento → relevância → prova → método → confiança → ação**

Não será feita migração de framework nem reconstrução ampla. A arquitetura atual
permite as melhorias com mudanças localizadas em configuração, conteúdo, gerador,
CSS, JS e verificadores.

## P0 — integridade da conversão

### P0.1 — dar um destino real ao contato

- **Problema:** o formulário simula sucesso e descarta os dados.
- **Evidência:** teste de envio local termina com status de sucesso e reset; não existe
  `formEndpoint`.
- **Solução:** renderizar e executar somente um fluxo compatível com um canal comercial
  aprovado. Sem canal, nunca afirmar que a solicitação foi enviada. Remover o falso
  atalho de WhatsApp.
- **Arquivos prováveis:** `config/site.json`, `content/pt.json`, `content/en.json`,
  `scripts/build.mjs`, `assets/js/site.js`, `scripts/check.mjs`.
- **Risco:** publicação acidental de contato pessoal; depende de aprovação humana.
- **Impacto esperado:** eliminar perda silenciosa de oportunidades.
- **Validação:** submissão controlada, estado de erro/sucesso verdadeiro, teclado,
  no-JS e inspeção do HTML público.

## P1 — clareza, prova e confiança

### P1.0 — arquitetura de informação e redução de conteúdo

- **Problema:** 15 seções principais repetem projetos, processo, serviços,
  diferenciais e diagnóstico; a Home ultrapassa 20 mil px.
- **Evidência:** inventário em `docs/STANDLOUD-CONTENT-INVENTORY.md` e baseline em
  `qa/baseline/`.
- **Solução:** consolidar a Home em Hero, Projetos, Método, Sobre, FAQ e
  Contato/diagnóstico; preservar conteúdo detalhado como fonte para páginas futuras.
- **Arquivos:** configuração, conteúdo PT/EN, gerador, CSS, JS e documentação.
- **Risco:** remover prova útil junto com repetição. Manter NUPPAC, conceitos honestos,
  autoria, método e objeções decisivas.
- **Validação:** comparação antes/depois, contagem de seções/palavras, headings,
  CTAs, rotas, mobile e revisão visual.

### P1.1 — colocar o NUPPAC na jornada

- **Problema:** o único projeto real conhecido não é renderizado.
- **Solução:** fazer a vitrine começar pelo projeto real, com comparador antes/depois,
  e separar claramente os três conceitos. Contexto extenso permanece reservado para
  página individual futura.
- **Arquivos:** `config/site.json`, conteúdo PT/EN, `scripts/build.mjs`, CSS e checks.
- **Risco:** transformar conteúdo não comprovado em resultado; usar apenas os fatos já
  presentes: institucional, cursos, pagamento, responsividade e publicação.
- **Validação:** screenshot, ordem do DOM e testes de presença/rotulagem.

### P1.2 — explicar o método “mostramos primeiro”

- **Problema:** o diferencial comercial principal está implícito nas cenas.
- **Solução:** inserir a abordagem de demonstração no bloco de processo/prova, com copy
  direta e sem promessas de resultado.
- **Arquivos:** conteúdo PT/EN e renderer de processo/prova.
- **Risco:** repetição; manter uma formulação principal e uma explicação concreta.
- **Validação:** leitura acima do primeiro projeto, paridade PT/EN e revisão humana.

### P1.3 — retirar cenas repetidas da Home sem apagar o trabalho

- **Problema:** Home de 19–21 mil px com três trechos de 260–320 svh.
- **Solução:** retirar as três cenas longas da renderização pública; preservar ideias,
  fontes, prompts e assets no Lab/repositório. Não adicionar animação nova.
- **Arquivos:** configuração, gerador, JS e documentação.
- **Risco:** perder material autoral. Preservar o conteúdo-fonte e manter previews
  compactos dos conceitos no Hero e na vitrine.
- **Impacto esperado:** projeto real, método e contato chegam muito antes.
- **Validação:** comparar altura final, confirmar zero cenas ativas e executar QA
  responsivo.

### P1.4 — remover alegações e escassez sem fonte

- **Problema:** métricas falsas de Lumina e “Reservas limitadas” permanecem no conteúdo.
- **Solução:** substituir por informação neutra ou arquivar conceitos antigos fora do
  conteúdo ativo; proibir essas strings nos checks.
- **Arquivos:** conteúdo PT/EN, Lab quando necessário e `scripts/check.mjs`.
- **Risco:** perder referência experimental. Preservar apenas o que for útil, marcado
  como conceito e sem alegações.
- **Validação:** busca textual e build.

### P1.5 — tornar o Hero robusto em 320 px

- **Problema:** CTAs EN ficam fora da primeira dobra de 320×568.
- **Solução:** ajustar escala/ritmo apenas no breakpoint estreito e reduzir a presença
  do preview abaixo da mensagem.
- **Arquivos:** CSS.
- **Risco:** densidade excessiva; manter corpo legível e alvos de toque adequados.
- **Validação:** 320×568 PT/EN, 360×800, 390×844 e 430×932.

## P2 — qualidade, acessibilidade, SEO e manutenção

### P2.1 — teclado e fallback sem JavaScript

- Fechar menu com Escape e clique externo.
- Atualizar `aria-expanded` e o nome do botão.
- Exibir navegação utilizável quando JS está indisponível.
- Manter validação nativa do formulário sem JS.
- **Arquivos:** CSS, JS e gerador.
- **Validação:** teclado, no-JS e leitor semântico por inspeção.

### P2.2 — SEO bilíngue real

- Padronizar inglês em **en-US**.
- Adicionar canonical, hreflang absoluto, `og:url`, `og:locale`, `og:site_name`.
- Usar a referência raster oficial da STANDLOUD apenas como preview social; a
  interface continua usando o sistema SVG/HTML responsivo.
- Gerar JSON-LD apenas com dados reais e sem e-mail placeholder.
- Usar a URL Workers existente como base configurável, sem alterar infraestrutura.
- Atualizar sitemap e robots.
- **Arquivos:** configuração, conteúdo, build e build Cloudflare.
- **Validação:** HTML gerado, sitemap, robots e checks.

### P2.3 — 404 bilíngue e útil

- Criar `public/404.html` leve, marcado `noindex`, com STANDLOUD, PT/EN e retorno às
  Homes.
- **Risco:** comportamento depende da entrega de Static Assets; validar localmente e no
  artefato, sem acessar Cloudflare.
- **Validação:** HTTP 404 mantendo conteúdo de marca no servidor local ajustado.

### P2.4 — limpar runtime obsoleto

- Remover da Home/bundle renderers, JS e CSS de Lumina/Nexora que não são configuráveis
  como cenas ativas atuais.
- Preservar ideias históricas apenas como fonte de Lab/documentação quando forem
  honestas.
- **Risco:** seletores compartilhados. Executar busca de referências e smoke test após
  cada grupo.
- **Impacto esperado:** CSS/JS menores e menos dívida técnica.
- **Validação:** tamanho de artefato, checks e regressão visual.

### P2.5 — alinhar documentação e configuração

- Atualizar README para três estudos conceituais ativos e NUPPAC real.
- Documentar en-US, canonical, limitações de contato e comandos de QA.
- Remover afirmações de arquitetura já superadas.

### P2.6 — refinar apresentação de projetos

- Cada entrada deve registrar tipo, contexto, objetivo, direção, decisões e escopo.
- NUPPAC: apenas fatos sustentados no repositório.
- AQUAFORM, BRASA 27 e ATLAS & VALE: sempre “projeto conceitual / independent concept”.
- Links permanecem em anchors reais; não criar páginas vazias.
- **Arquivos:** conteúdo, renderer de projetos e CSS.
- **Validação:** PT/EN, links, headings, leitura mobile.

## P3 — opcionais, somente se permanecerem pequenos

- Ocultar redes não configuradas.
- Trocar “Novos projetos” por informação neutra de processo.
- Refinar ritmo vertical após a redução das cenas.
- Criar um pequeno bloco futuro de Private Preview apenas na documentação, sem
  autenticação ou rota nesta tarefa.

## Ordem de implementação

1. Integridade do conteúdo e configuração.
2. Prova NUPPAC e arquitetura comercial.
3. Apresentação de projetos e copy PT/en-US.
4. SEO, 404, navegação e formulário.
5. Remoção das cenas repetidas da Home e refinamento visual.
6. Remoção segura do runtime legado.
7. Build e smoke test após cada grupo.
8. QA completa, revisão independente e preparação local para entrega.

## Critérios de validação

- Build e check passam.
- NUPPAC é visível como projeto real.
- Os três estudos são rotulados como conceituais.
- Nenhuma métrica, escassez, cliente ou resultado sem fonte.
- Formulário não afirma envio inexistente.
- CTA principal visível em 320×568 PT e EN.
- Escape, no-JS e reduced motion funcionam.
- Canonical/hreflang/sitemap/robots coerentes.
- Rotas diretas PT/EN e 404 verificadas.
- Zero overflow e zero erros de console nos viewports definidos.
- Artefato `_site` limpo e reproduzível.
