# Arquitetura comercial da Home

## Jornada

A Home segue a sequência atenção → compreensão → confiança → demonstração → contato.
As animações são provas de capacidade inseridas no fluxo comercial e não substituem
serviços, projetos, processo, estudo de caso ou formulário.

## Controle das cenas

`config/site.json` contém:

- `home.maxScenes`: limite estrutural de quatro cenas;
- `home.scenes`: registro único de cenas e seu estado;
- `home.sectionOrder`: ordem única de seções e cenas.

O gerador possui um mapa de renderizadores em `scripts/build.mjs`. Uma cena desabilitada
retorna uma string vazia e não produz seção, espaço, asset ou placeholder na Home.

Estado atual:

| Cena | Estado | Uso |
| --- | --- | --- |
| `lumina` | ativa | Do conceito ao projeto publicado |
| `brandGravity` | ativa | Gravidade da marca |
| `attentionToAction` | desabilitada | Arquitetura futura, sem renderização |

## Laboratório

As oito ideias experimentais originais permanecem em `content/lab/pt.json` e
`content/lab/en.json`. Storyboard e prompts continuam em `docs/`, `prompts/` e
`assets/scenes/`, mas o runtime antigo não é carregado pela Home.

As rotas futuras `/pt/lab/` e `/en/lab/` estão registradas, porém com
`implemented: false`. Até a página Lab existir, a navegação utiliza um fallback real
da Home.

## Rotas futuras

Todas as rotas PT e EN solicitadas estão em `config/site.json > routes`. O helper
`routeHref()` publica a URL interna apenas quando `implemented` for `true`; caso
contrário, usa a âncora de fallback. Isso permite construir páginas internas
gradualmente sem criar links quebrados.

## Formulário

O formulário valida os campos no navegador, mostra estados de processamento, sucesso
e erro, bloqueia submissões imediatas e contém um campo honeypot. Nenhuma informação é
enviada externamente até a futura autorização de uma integração.
