# Arquitetura comercial da Home

## Jornada pública

A Home segue a sequência entendimento → prova → diferenciação → confiança → contato.
`config/site.json > home.sectionOrder` mantém uma única ordem:

1. `hero`;
2. `projects`;
3. `process`;
4. `about`;
5. `faq`;
6. `contact`.

Esses são os seis blocos comerciais principais. O footer encerra e orienta, mas não é
contado como seção de argumento. Não existem placeholders ou cenas longas ativas.

## Projetos

- NUPPAC aparece primeiro e é o único projeto identificado como real.
- Seu visual principal é um comparador antes/depois. O build usa imagens reais apenas
  quando os dois arquivos configurados existem; caso contrário, publica placeholders
  claramente identificados.
- AQUAFORM, BRASA 27 e ATLAS & VALE aparecem como projetos conceituais independentes.
- O Hero antecipa os três conceitos em previews compactos, sem criar blocos adicionais
  no fluxo.

## Laboratório

As oito ideias experimentais originais permanecem em `content/lab/pt.json` e
`content/lab/en.json`. Storyboard, prompts e assets continuam em `docs/`, `prompts/`
e `assets/scenes/`, mas nenhuma seção experimental é renderizada pela Home.

Lumina e Nexora permanecem resumidas em `content/lab/legacy-concepts-pt.json` e
`content/lab/legacy-concepts-en.json`. Não competem com a jornada comercial pública.

As rotas futuras `/pt/lab/` e `/en/lab/` estão registradas, porém com
`implemented: false`. Até a página Lab existir, a navegação utiliza um fallback real
da Home.

## Rotas futuras

Todas as rotas PT e EN solicitadas estão em `config/site.json > routes`. O helper
`routeHref()` publica a URL interna apenas quando `implemented` for `true`; caso
contrário, usa a âncora de fallback. Isso permite construir páginas internas
gradualmente sem criar links quebrados.

## Formulário

O formulário mantém validação nativa, bloqueio contra submissão imediata e honeypot.
Sem e-mail comercial aprovado, o botão permanece desabilitado e a página informa que
nenhum dado foi enviado. Quando um e-mail for configurado, o fluxo prepara uma mensagem
no aplicativo de e-mail do visitante; não existe backend nesta etapa.
