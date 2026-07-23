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

## Publicação no GitHub Pages

O workflow `.github/workflows/deploy-pages.yml` constrói, valida e publica somente os
arquivos estáticos necessários. Depois do merge na `main`, o endereço esperado é:

`https://vitor12011201.github.io/SITE_VITOR/`

No GitHub, configure **Settings → Pages → Build and deployment → Source** como
**GitHub Actions**. O workflow também pode ser executado manualmente pela aba Actions.

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
não possui backend. Também faltam domínio/canonical, política de privacidade, favicon e
os cases reais do portfólio.
