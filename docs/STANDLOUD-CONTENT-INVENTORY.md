# Inventário de conteúdo e arquitetura — STANDLOUD

Data: 31 de julho de 2026
Escopo: estado local anterior à consolidação P1.

## Páginas públicas atuais

- `/`: seletor/redirecionamento de idioma, sem conteúdo comercial indexável.
- `/pt/`: Home completa em português.
- `/en/`: Home equivalente em inglês en-US.
- `404.html`: retorno bilíngue para PT ou EN.

As rotas de projetos, serviços, processo, sobre, contato e Lab estão apenas
configuradas para o futuro. Nenhum link público aponta para uma página inexistente;
os links usam anchors reais da Home.

## Inventário da Home PT/EN

| Página | Seção | Função | Manter | Reduzir | Unir | Mover | Remover | Motivo |
| --- | --- | --- | :---: | :---: | :---: | :---: | :---: | --- |
| Home | Hero | Explicar e conduzir | ✓ | ✓ |  |  |  | Proposta e CTAs funcionam; o carrossel já antecipa projetos. |
| Home | Prova rápida | Gerar confiança |  | ✓ | ✓ |  |  | Repete projetos, processo e a frase “mostramos primeiro”. |
| Home | Problemas | Explicar |  |  | ✓ |  |  | Repete benefícios de serviços e diferenciais. |
| Home | Serviços | Explicar |  |  | ✓ |  |  | Três cards longos repetem método, entregas e contato. |
| Home | Projetos | Demonstrar | ✓ | ✓ |  |  |  | É prova central, mas cada card funciona como mini case study. |
| Home | Cena AQUAFORM | Demonstrar |  |  |  | ✓ | ✓ | Repete o projeto já presente no Hero e no card; alonga a jornada. |
| Home | Processo | Diferenciar | ✓ | ✓ | ✓ |  |  | Cinco etapas podem virar três e absorver o melhor de serviços/diferenciais. |
| Home | Case NUPPAC | Gerar confiança |  | ✓ | ✓ | ✓ | O card do projeto real deve carregar a prova; detalhes pertencem à futura página. |
| Home | Cena BRASA 27 | Demonstrar |  |  |  | ✓ | ✓ | Repete Hero e card sem acrescentar prova real. |
| Home | Diferenciais | Diferenciar |  |  | ✓ |  |  | Repete processo, mobile, movimento e ausência de template. |
| Home | Sobre | Gerar confiança | ✓ | ✓ | ✓ |  |  | Deve receber somente a prova institucional essencial. |
| Home | Cena ATLAS & VALE | Demonstrar |  |  |  | ✓ | ✓ | Terceira repetição do mesmo tipo de prova conceitual. |
| Home | Diagnóstico | Conduzir à ação |  |  | ✓ |  |  | Repete o bloco de contato e usa o mesmo CTA. |
| Home | FAQ | Gerar confiança | ✓ | ✓ |  |  |  | Oito perguntas são mais do que a Home precisa; manter as decisivas. |
| Home | Contato | Conduzir à ação | ✓ | ✓ | ✓ |  |  | Deve absorver o diagnóstico e ser o próximo passo único. |
| Site | Footer | Orientar e encerrar | ✓ | ✓ |  |  |  | Navegação deve refletir somente a arquitetura final. |

## Repetições observadas

- “Não pedimos que o cliente imagine. Mostramos primeiro.” aparece em prova e
  processo; deve existir uma única vez, no método.
- Estratégia, clareza, mobile, desenvolvimento e publicação aparecem em serviços,
  processo e diferenciais com formulações próximas.
- NUPPAC aparece em prova rápida, card e case completo.
- AQUAFORM, BRASA 27 e ATLAS & VALE aparecem no Hero, nos cards e novamente em cenas
  longas.
- Diagnóstico e contato possuem a mesma função e o mesmo destino.
- “Projeto real e conceitos independentes” aparece antes e dentro da vitrine.
- Vários CTAs específicos competem com “Solicitar diagnóstico”.

## Conteúdo a mover ou preservar fora da Home

- Contexto completo, objetivo, decisões, escopo e detalhes técnicos dos projetos:
  preservar no conteúdo-fonte para futuras páginas individuais.
- Cenas longas dos três conceitos: retirar da renderização da Home; as ideias e
  assets históricos permanecem no repositório/Lab.
- Perguntas secundárias sobre copy, domínio, manutenção e pagamento: preservar no
  conteúdo-fonte; podem voltar em página de contato/serviços quando ela existir.

## Métrica antes da consolidação

- 15 seções principais configuradas na Home.
- 40 elementos `<section>` por locale quando os sites demonstrativos internos são
  contados.
- Aproximadamente 1.733 palavras no HTML PT e 1.752 no HTML EN, incluindo o conteúdo
  dos previews e das cenas.
- CTA principal dividido entre `#diagnostic` e `#contact`.

## Arquitetura proposta

1. Hero — entendimento e CTA.
2. Projetos selecionados — prova real e conceitual, com cards editados.
3. Método — diferenciação em três etapas.
4. Sobre — confiança e autoria.
5. FAQ essencial — remoção de objeções.
6. Contato/diagnóstico — ação final.

O objetivo não é apenas reduzir altura. É retirar demonstrações e argumentos
duplicados para que projeto real, método, autoria e contato apareçam mais cedo.

## Resultado implementado

- 6 seções principais configuradas, contra 15 no estado anterior.
- 22 elementos `<section>` no HTML por locale, contra 40; os elementos internos
  restantes pertencem aos previews reais em HTML dos projetos.
- 871 palavras no HTML PT e 884 no HTML EN, contra 1.733 e 1.752.
- Redução aproximada: 49,7% em PT e 49,5% em EN.
- Altura em 1440×900: 7.713 px em PT, contra 20.574 px no baseline.
- Altura em 390×844: 10.079 px em PT, contra 20.987 px no baseline.
- Um único CTA principal em toda a jornada: `Solicitar diagnóstico` /
  `Request a review`, apontando para `#contact`.
- Prova rápida, problemas, serviços e diferenciais foram consolidados em projetos,
  método e sobre.
- O case NUPPAC foi condensado no primeiro card; o comparador substitui o visual
  estático, sem adicionar outra seção.
- Diagnóstico foi unido ao contato.
- FAQ foi reduzido de oito para seis perguntas decisivas.
- AQUAFORM, BRASA 27 e ATLAS & VALE continuam identificados como projetos
  conceituais independentes.
- As cenas longas foram retiradas da Home, não apagadas do conteúdo-fonte.
