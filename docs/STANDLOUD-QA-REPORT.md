# Relatório local de QA — STANDLOUD

Data: 31 de julho de 2026
Branch: `feature/skill-guided-site-improvements`
Ambiente: Chromium local, artefato `_site`, sem deploy.

## Resultado

- `npm run check`: aprovado.
- `npm run build:cloudflare`: aprovado; 22 arquivos públicos, 1.044.483 bytes.
- Dois builds consecutivos geraram o mesmo hash agregado:
  `b39c91e0d6572af62a15596114457a6e9bd76045ffa97b27c99fce29f4e17a12`.
- QA responsivo: 16 cenários, zero falhas técnicas.
- QA de interações: zero achados.
- Rotas `/`, `/pt/` e `/en/`: HTTP 200.
- Rotas futuras e desconhecida: HTTP 404; nenhum link público aponta para elas.
- Zero overflow horizontal, erro de console, erro de página ou requisição falha nos
  cenários testados.
- Um H1 por locale, foco visível e imagens sem alt ausente.

## Matriz

As Homes PT-BR e en-US foram testadas em:

- 1920×1080;
- 1440×900;
- 1024×768;
- 768×1024;
- 430×932;
- 390×844;
- 360×800;
- 320×568.

As evidências estão em `qa/final/`; métricas completas em
`qa/final/results.json`. A matriz final usa explicitamente o artefato `_site` em
`http://127.0.0.1:4174`.

## Comparador NUPPAC

Validado em PT e EN:

- posição inicial 50%;
- setas: passos de 5%;
- Shift + seta: passo ampliado;
- Home: 0%;
- End: 100%;
- arraste com mouse;
- Pointer Events equivalentes a toque;
- resize preservando posição;
- foco visível;
- `role="slider"` e valores ARIA atualizados;
- `touch-action: pan-y` e seleção de texto bloqueada;
- reduced motion sem transição;
- fallback a 50% sem JavaScript.

Capturas específicas:

- `pt-1440x900-nuppac-comparison-25.png`;
- `pt-1440x900-nuppac-comparison-50.png`;
- `pt-1440x900-nuppac-comparison-75.png`;
- `pt-320x568-nuppac-comparison-50.png`;
- equivalentes em inglês.

Os screenshots reais do NUPPAC ainda não existem. Os placeholders publicados são
explicitamente identificados; nenhuma imagem ou transformação foi fabricada.

## Acessibilidade e fallbacks

- Menu mobile abre, fecha por Escape e fecha ao selecionar um link.
- Navegação permanece visível sem JavaScript.
- Conteúdo `.reveal` permanece visível sem JavaScript.
- Reduced motion mostra todo o conteúdo sem depender de scrub.
- Formulário mantém validação nativa e não simula envio.
- O canal comercial não está configurado; o botão permanece desabilitado e informa
  que nenhum dado foi enviado.

## Comparação com o baseline

- Home PT 1440×900: 20.574 px → 7.713 px.
- Home PT 390×844: 20.987 px → 10.079 px.
- HTML decodificado PT: 40.888 → 30.368 bytes.
- Seções principais configuradas: 15 → 6.
- Palavras PT: aproximadamente 1.733 → 871.
- Palavras EN: aproximadamente 1.752 → 884.

A inspeção visual confirmou que o Hero, o primeiro projeto, o método, o About, a FAQ,
o contato e o footer mantêm hierarquia e respiro nos viewports-alvo. Capturar uma
imagem não foi tratado como aprovação: os estados 25/50/75 do comparador foram
inspecionados para alinhamento e legibilidade.

## Limitações e decisões humanas

- Faltam as duas capturas reais equivalentes do NUPPAC.
- Falta aprovar um canal comercial para o formulário.
- Firefox e WebKit não foram baixados nem testados; a autorização cobria Chromium.
- Não houve teste em Cloudflare ou produção, por restrição explícita.
- As faixas de investimento continuam dependendo de validação comercial.

## Revisão independente

`review-agent` não estava exposta nesta sessão. Foi executada uma segunda revisão
read-only de referências públicas, IDs, anchors, conteúdo, artefato, segredos,
temporários, rotas e configuração do Worker.

Um achado de processo foi corrigido: a primeira matriz final apontava para uma
instância antiga na porta 4173, que não servia a página 404 do artefato. As evidências
foram substituídas por uma nova execução contra 4174. Não restaram achados P0 ou P1;
os bloqueios de produção são o canal de contato e os screenshots reais do NUPPAC.
