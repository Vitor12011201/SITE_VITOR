# Plano do site — NOVA//FRAME Studio

## 1. Objetivo e estratégia

O site foi planejado como uma peça comercial antes de ser uma demonstração de animação.
A experiência `scroll-world` apresenta a narrativa do estúdio; as seções tradicionais
logo abaixo preservam descoberta, leitura, SEO, acessibilidade e conversão mesmo quando
nenhum vídeo é carregado.

Objetivos mensuráveis para uma fase de produção:

- levar o visitante a entender a proposta em menos de 15 segundos;
- tornar serviços e processo compreensíveis sem depender do efeito visual;
- conduzir aos CTAs de orçamento e WhatsApp;
- registrar cliques em CTAs, início e conclusão do formulário;
- manter bons indicadores de carregamento e estabilidade visual.

## 2. Decisão de câmera

Foi escolhida a arquitetura A da Skill: **um voo contínuo sempre para a frente**.

Cada trecho começa no último frame real do trecho anterior. Isso mantém posição e
velocidade coerentes nas emendas. A alternativa de mergulhos e conectores aéreos
obrigaria a câmera a recuar depois de cada cena; em ambientes arquitetônicos esse
movimento costuma parecer um rewind. O voo contínuo também reduz a quantidade futura
de vídeos de 15 para 8 no desktop.

Ordem narrativa:

1. entrada no estúdio;
2. estratégia;
3. design;
4. desenvolvimento;
5. serviços;
6. impacto para o negócio;
7. portfólio;
8. início de um novo projeto.

## 3. Direção visual

A direção evita o aspecto infantil de um diorama de brinquedo. O mundo é um estúdio
arquitetônico 3D estilizado, maduro e cinematográfico: superfícies escuras, vidro
fumê, estruturas geométricas, luz volumétrica e neon usado com contenção.

A paleta e o nome ficam em `config/site.json`. Alterar esse arquivo e executar
`npm run build` atualiza as duas versões do site e os placeholders.

## 4. Idiomas e URLs

- `/pt/` contém HTML em português e `lang="pt-BR"`;
- `/en/` contém HTML em inglês e `lang="en"`;
- `/` detecta o idioma do navegador na primeira visita;
- a escolha manual PT/EN é salva no navegador;
- cada página possui metadados e links `hreflang`.

Os textos ficam em `content/pt.json` e `content/en.json`, sem tradução automática.

## 5. Conteúdo e conversão

Depois da experiência principal, o site contém:

- posicionamento;
- grade completa de serviços;
- processo em quatro etapas;
- diferenciais;
- portfólio com três estudos explicitamente conceituais;
- perguntas frequentes;
- briefing de orçamento;
- rodapé e redes.

O formulário desta etapa valida os campos no navegador, mas não envia dados. O endpoint,
o e-mail definitivo, o número do WhatsApp e as redes devem ser configurados antes da
publicação.

## 6. Fallbacks e acessibilidade

- os oito cenários têm placeholders SVG locais;
- todo conteúdo importante existe em HTML semântico;
- no mobile, as cenas aparecem como imagens estáticas em sequência;
- `prefers-reduced-motion` remove movimentos e transições;
- foco visível, link para pular conteúdo, labels e status do formulário estão presentes;
- quando os vídeos existirem, os posters continuarão disponíveis durante carregamento ou falha.

## 7. Orçamento futuro de geração

Nenhuma geração foi executada nesta etapa.

Para a arquitetura selecionada:

| Escopo | Imagens base | Vídeos | Reserva de re-roll (~15%) |
| --- | ---: | ---: | ---: |
| Desktop 16:9 | 8 | 8 | planejar aproximadamente 9 imagens e 10 vídeos |
| Desktop + mobile 9:16 nativo | 8 | 16 | planejar aproximadamente 9 imagens e 19 vídeos |

O mobile nativo é uma segunda cadeia de 8 vídeos em retrato, e não um recorte da versão
desktop. Antes de qualquer gasto, a decisão mobile, o modelo e o tier precisam ser
aprovados.

Os créditos não devem ser estimados apenas por tabela genérica. Na fase de render, deve-se
medir o saldo antes e depois de **uma imagem e um vídeo de calibração**, extrapolar o custo
real do plano e só então pedir aprovação do lote completo. Como referência não vinculante
registrada pela Skill em julho de 2026, uma imagem foi observada em torno de 15 créditos
e um vídeo Standard entre 40 e 55, mas planos podem variar.

Recomendação: gerar primeiro um previz completo com `seedance_2_0_mini`, revisar ritmo e
enquadramento, e somente depois decidir se os trechos finais justificam o tier Standard.

## 8. Próximas etapas

1. substituir e-mail, WhatsApp, redes e, se necessário, o nome provisório;
2. escolher desktop apenas ou desktop + mobile 9:16;
3. escolher tier Draft, Standard ou Alternate;
4. calibrar custo com uma imagem e um vídeo, após aprovação explícita;
5. gerar e revisar os oito stills como um conjunto;
6. gerar os oito trechos em sequência, sempre usando o último frame real;
7. codificar os vídeos para scrub, integrar, testar em desktop/mobile e validar reduced motion;
8. conectar formulário, analytics consentido, domínio e metadados finais.

## 9. Organização dos arquivos

```text
.
├── config/site.json              # fonte única para marca, paleta e contatos
├── content/
│   ├── pt.json                   # conteúdo português
│   └── en.json                   # conteúdo inglês
├── prompts/
│   ├── scroll-world.json         # direção e descrição editável das cenas
│   └── generated/
│       ├── stills/               # oito prompts 3:2
│       └── legs/                 # oito prompts do voo 16:9
├── assets/
│   ├── css/styles.css
│   ├── js/site.js
│   ├── scenes/                   # placeholders SVG temporários
│   └── vid/                      # futuros encodes da cadeia
├── pt/index.html                 # página gerada em português
├── en/index.html                 # página gerada em inglês
├── scripts/
│   ├── build.mjs                 # gera páginas e placeholders
│   ├── build-prompts.mjs         # materializa os prompts sem chamar APIs
│   ├── check.mjs                 # verificações automatizadas
│   └── serve.mjs                 # preview local
└── README.md
```

Os HTMLs e os prompts em `generated/` são saídas de build. As fontes de verdade são
`config/`, `content/` e `prompts/scroll-world.json`.
