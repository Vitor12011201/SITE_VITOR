# NOVA//FRAME Studio

Site institucional e portfólio bilíngue com um previz local da experiência
`scroll-world`. Esta primeira etapa não usa Higgsfield, vídeos pagos nem APIs externas.

## Rodar localmente

Requer apenas Node.js:

```bash
npm run build
npm run check
npm run serve
```

Abra `http://127.0.0.1:4173/pt/` ou `/en/`.

## Publicação no Cloudflare Pages

O comando abaixo gera e valida as páginas, substitui `_site/` e copia para lá somente
os arquivos públicos necessários:

```bash
npm run build:cloudflare
npm run serve:cloudflare
```

Configuração da integração Git no Cloudflare Pages:

| Campo | Valor |
| --- | --- |
| Framework preset | `None` |
| Production branch | `main` |
| Build command | `npm run build:cloudflare` |
| Build output directory | `_site` |
| Root directory | deixar vazio |

O Cloudflare executa o build a partir da raiz do repositório. Arquivos públicos futuros
podem ser colocados em `public/`; somente extensões permitidas pelo empacotador serão
copiadas para a raiz de `_site/`. Vídeos públicos em `assets/vid/` são copiados apenas
quando existirem. A versão do Node usada no build está fixada em `.node-version`. Para
sitemap com domínio próprio, defina `SITE_URL` nas variáveis de ambiente do projeto;
sem essa variável, o build usa `CF_PAGES_URL`, fornecida pelo Cloudflare, e no preview
local usa `http://127.0.0.1:4173`.

## Onde editar

- `config/site.json`: nome, paleta, contatos e URLs;
- `content/pt.json`: textos em português;
- `content/en.json`: textos em inglês;
- `prompts/scroll-world.json`: direção artística e descrição das oito cenas;
- `assets/css/styles.css`: identidade visual e responsividade;
- `assets/js/site.js`: transições, navegação, idioma e formulário demonstrativo;
- `docs/PLAN.md`: decisões, custos futuros e sequência de produção.
- `docs/STORYBOARD.md`: enquadramento, câmera, continuidade e áreas livres das oito cenas.

Depois de alterar configuração ou conteúdo, execute `npm run build`.

## Prompts preparados

`npm run build` cria:

- `prompts/generated/stills/`: 8 prompts de stills;
- `prompts/generated/legs/`: 8 prompts da cadeia de voo contínuo;
- `prompts/generated/manifest.json`: contagem e arquitetura.

Esses arquivos são apenas texto. O build nunca executa Higgsfield.

## Pendências antes de publicar

O e-mail, WhatsApp e redes em `config/site.json` são placeholders. O formulário ainda
não possui backend. Também faltam domínio/canonical, política de privacidade e os cases
reais do portfólio.
