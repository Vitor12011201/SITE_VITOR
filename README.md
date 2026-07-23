# STANDLOUD

Site comercial e portfólio bilíngue da STANDLOUD. A Home combina conteúdo de aquisição
com duas demonstrações controladas pelo scroll: Lumina e Gravidade da Marca. O projeto
não usa Higgsfield, vídeos pagos nem APIs externas.

## Rodar localmente

Requer apenas Node.js:

```bash
npm run build
npm run check
npm run serve
```

Abra `http://127.0.0.1:4173/pt/` ou `/en/`.

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
Sem essa variável, o build usa `CF_PAGES_URL` quando disponível e, no preview local,
usa `http://127.0.0.1:4173`.

## Onde editar

- `config/site.json`: nome, paleta, contatos e URLs;
- `config/site.json > home`: ordem das seções e lista explícita de até quatro cenas;
- `content/pt.json`: textos em português;
- `content/en.json`: textos em inglês;
- `content/lab/`: arquivo bilíngue das oito ideias experimentais fora da Home;
- `prompts/scroll-world.json`: direção artística e descrição das oito cenas;
- `assets/css/styles.css`: identidade visual e responsividade;
- `assets/js/site.js`: transições, navegação, idioma e formulário demonstrativo;
- `assets/brand/`: símbolo, logo horizontal e assinatura completa da STANDLOUD;
- `assets/images/standloud-logo-reference.png`: referência raster original, não publicada;
- `docs/PLAN.md`: decisões, custos futuros e sequência de produção.
- `docs/STORYBOARD.md`: enquadramento, câmera, continuidade e áreas livres das oito cenas.
- `docs/HOME_ARCHITECTURE.md`: arquitetura comercial, cenas ativas e rotas futuras.

Depois de alterar configuração ou conteúdo, execute `npm run build`.

## Prompts preparados

`npm run build` cria:

- `prompts/generated/stills/`: 8 prompts de stills;
- `prompts/generated/legs/`: 8 prompts da cadeia de voo contínuo;
- `prompts/generated/manifest.json`: contagem e arquitetura.

Esses arquivos são apenas texto. O build nunca executa Higgsfield.

## Arquitetura da Home

`config/site.json` limita a experiência a quatro cenas configuradas. Atualmente apenas
`lumina` e `brandGravity` estão ativas. `attentionToAction` já possui uma entrada
desabilitada, mas não gera HTML ou placeholder até receber uma implementação.

As rotas internas futuras também vivem na configuração. Enquanto uma página estiver
com `implemented: false`, seus links usam uma seção existente da Home como fallback,
evitando links quebrados.

## Pendências antes de publicar

O e-mail, WhatsApp e redes em `config/site.json` são placeholders. O formulário ainda
não possui backend. Também faltam domínio/canonical, política de privacidade e os cases
reais do portfólio.
