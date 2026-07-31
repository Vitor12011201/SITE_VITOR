# STANDLOUD

Site comercial e portfólio bilíngue da STANDLOUD. A Home foi editada em seis blocos:
Hero, projetos, método, estúdio, FAQ e contato. A vitrine começa pelo projeto real
NUPPAC e apresenta AQUAFORM Auto Spa, BRASA 27 e ATLAS & VALE como estudos conceituais
independentes. O projeto não usa Higgsfield, vídeos pagos nem APIs externas.

## Rodar localmente

Requer apenas Node.js:

```bash
npm run build
npm run check
npm run serve
```

Abra `http://127.0.0.1:4173/pt/` ou `/en/`. Se a porta estiver ocupada, o servidor
informa a próxima disponível.

O inglês público segue a convenção en-US. Para QA visual local com Chromium:

```bash
npm run qa:baseline
npm run qa:final
node scripts/qa-interactions.mjs final
```

## Publicação no Cloudflare Worker com Static Assets

O comando abaixo gera e valida as páginas, substitui `_site/` e copia para lá somente
os arquivos públicos necessários:

```bash
npm run build:cloudflare
npm run serve:cloudflare
```

O deploy usa `wrangler.jsonc`, com `assets.directory` fixado em `./_site`.
Não altere esse valor para `.`, pois isso faria o Wrangler tentar publicar arquivos
internos do repositorio.

Configuração da integração Git no Cloudflare:

| Campo | Valor |
| --- | --- |
| Build command | `npm run build:cloudflare` |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |

O Cloudflare executa o build a partir da raiz do repositório. Arquivos públicos futuros
podem ser colocados em `public/`; somente extensões permitidas pelo empacotador serão
copiadas para a raiz de `_site/`. Vídeos públicos em `assets/vid/` são copiados apenas
quando existirem. A versão do Node usada no build está fixada em `.node-version`. Para
sitemap com domínio próprio, defina `SITE_URL` nas variáveis de ambiente do projeto.
Sem essa variável, o build usa `CF_PAGES_URL` quando disponível e depois
`config/site.json > site.baseUrl`; o endereço local é apenas o último fallback.

## Onde editar

- `config/site.json`: nome, paleta, contatos e URLs;
- `config/site.json > home`: ordem explícita dos seis blocos públicos;
- `config/site.json > projectAssets.nuppac`: paths e dimensões das capturas do
  comparador antes/depois;
- `content/pt.json`: textos em português;
- `content/en.json`: textos em inglês;
- `content/lab/`: arquivo bilíngue das oito ideias experimentais fora da Home;
- `prompts/scroll-world.json`: direção artística e descrição das oito cenas;
- `assets/css/styles.css`: identidade visual e responsividade;
- `assets/js/site.js`: transições, navegação, idioma e preparação do contato;
- `assets/brand/`: símbolo, logo horizontal e assinatura completa da STANDLOUD;
- `assets/images/standloud-logo-reference.png`: referência raster original, publicada
  somente como preview Open Graph/Twitter; a interface usa SVG e texto acessível;
- `docs/STANDLOUD-IMPROVEMENT-PLAN.md`: auditoria priorizada e plano incremental atual.
- `docs/STANDLOUD-CONTENT-INVENTORY.md`: inventário e decisão editorial por seção.
- `docs/STANDLOUD-QA-REPORT.md`: matriz, evidências e limitações do QA local.
- `docs/LEGACY_SCROLL_WORLD_PLAN.md`: exploração imersiva histórica, fora do runtime atual.
- `docs/STORYBOARD.md`: enquadramento, câmera, continuidade e áreas livres das oito cenas.
- `docs/HOME_ARCHITECTURE.md`: arquitetura comercial, projetos e rotas futuras.

Depois de alterar configuração ou conteúdo, execute `npm run build`.

## Prompts preparados

`npm run build` cria:

- `prompts/generated/stills/`: 8 prompts de stills;
- `prompts/generated/legs/`: 8 prompts da cadeia de voo contínuo;
- `prompts/generated/manifest.json`: contagem e arquitetura.

Esses arquivos são apenas texto. O build nunca executa Higgsfield.

## Arquitetura da Home

`config/site.json > home.sectionOrder` é a fonte única da jornada pública. Nenhuma
cena longa está ativa na Home. AQUAFORM, BRASA 27 e ATLAS & VALE continuam como
previews e cards conceituais; as experiências longas e as ideias históricas ficam
preservadas em `content/lab/`, `prompts/`, `docs/` e `assets/scenes/`.

O card do NUPPAC contém um comparador acessível, com fallback sem JavaScript e
placeholders explícitos enquanto as duas capturas reais não existirem. Para ativá-lo
com evidência real, adicione imagens equivalentes em:

- `assets/images/projects/nuppac/previous-site.webp`;
- `assets/images/projects/nuppac/new-direction.webp`.

Use o mesmo viewport e recorte nas duas imagens; a configuração atual espera
1440 × 900.

As rotas internas futuras também vivem na configuração. Enquanto uma página estiver
com `implemented: false`, seus links usam uma seção existente da Home como fallback,
evitando links quebrados.

## Contato e pendências

Canonical, hreflang, Open Graph/Twitter, sitemap e robots usam a URL Workers configurada em
`config/site.json > site.baseUrl`. E-mail, WhatsApp e redes permanecem vazios em vez
de publicar placeholders. Enquanto um canal comercial não for aprovado, o formulário
fica explicitamente indisponível e não afirma ter enviado dados.

Antes da publicação de um formulário conectado ainda são necessários: canal comercial
aprovado, política de privacidade adequada ao fluxo escolhido e validação das faixas de
investimento.
