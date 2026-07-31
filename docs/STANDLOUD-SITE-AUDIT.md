# Auditoria do site STANDLOUD

Data da auditoria: 30–31 de julho de 2026
Branch local: `feature/skill-guided-site-improvements`
Escopo: implementação local existente, sem deploy e sem alterações visuais nesta fase.

## Resumo executivo

O site já possui uma identidade própria, boa execução técnica e três demonstrações
conceituais visualmente fortes. A proposta central é compreensível no Hero, PT e EN
possuem boa paridade e os fallbacks de movimento funcionam.

O principal problema não é falta de impacto visual. É a diferença entre o que a Home
promete comercialmente e a ação que o visitante consegue concluir. Todos os CTAs de
aquisição chegam a um formulário que simula sucesso, mas não envia a solicitação. Ao
mesmo tempo, o único projeto real conhecido, NUPPAC, existe no conteúdo-fonte mas não
é renderizado; a seção intitulada “Trabalho real” mostra apenas conceitos.

As três cenas longas também elevam a Home para cerca de 19.000–21.000 px. Elas
demonstram capacidade, mas hoje exigem atenção demais antes do contato. A direção
recomendada é incremental: preservar identidade, projetos conceituais e engenharia de
scroll; tornar a prova real visível; encurtar a jornada; remover conteúdo e runtime
obsoletos; corrigir contato, integridade, SEO e teclado.

## Evidência de baseline

- Rotas testadas: `/`, `/pt/`, `/en/` e rotas inexistentes.
- Viewports capturadas: 1440×900, 390×844 e 320×568, PT e EN.
- Seis cenários principais com HTTP 200, zero overflow horizontal e zero erros de
  console, página ou requisição.
- Home desktop: 20.574 px em PT e 20.513 px em EN.
- Home mobile: até 20.987 px.
- DOM: 783 elementos e 58 headings por locale.
- HTML por locale: aproximadamente 40 KB; CSS: 128 KB; JS: 21 KB.
- Reduced motion: as três cenas chegam diretamente ao progresso final.
- Sem JavaScript: conteúdo `.reveal` permanece visível.
- Evidência: `qa/baseline/`.

O contador inicial de “elementos sem nome” era um falso positivo do teste simplificado:
os cinco campos possuem labels associados. A verificação baseada em labels não
encontrou controles visíveis sem nome acessível.

## Pontos fortes a preservar

- **Observado — alto valor:** identidade STANDLOUD reconhecível, coerente e sem
  aparência de template SaaS genérico.
- **Observado — alto valor:** Hero comunica serviço, público e resultado com CTAs
  claros em desktop e em 390 px.
- **Observado — alto valor:** AQUAFORM, BRASA 27 e ATLAS & VALE são visualmente
  distintos e aparecem identificados como projetos conceituais.
- **Observado — alto valor:** cenas usam HTML/CSS real, progresso contínuo,
  `requestAnimationFrame`, reversibilidade e estado final estável.
- **Observado — médio valor:** um H1 por página, labels visíveis, skip link, foco
  visível, landmarks e hierarquia de headings sem saltos.
- **Observado — médio valor:** PT-BR e inglês possuem conteúdo equivalente e navegação
  funcional.
- **Observado — médio valor:** não há imagens externas, bibliotecas de animação
  pesadas ou serviços pagos.
- **Observado — médio valor:** `_site` recebe somente arquivos públicos permitidos e
  o Wrangler continua apontando para `./_site`.

## Achados prioritários

### Crítico

1. **Observado — contato não conclui a ação comercial.** O formulário valida os dados,
   mostra uma mensagem de sucesso e limpa os campos, mas não envia nada. O CTA
   principal da Home leva a esse fluxo. Impacto: uma oportunidade pode acreditar que
   entrou em contato quando nenhum dado foi recebido.

### Alto

2. **Observado — o projeto real não aparece na Home.** O conteúdo e o renderer do
   estudo NUPPAC existem, mas `sectionOrder` não inclui `quickProof` nem `case:nuppac`.
   A vitrine ativa contém somente os três conceitos.
3. **Observado — promessa e evidência entram em conflito.** O heading “Trabalho real,
   conceitos honestos” é seguido apenas por AQUAFORM, BRASA 27 e ATLAS & VALE.
4. **Observado — contato e dados estruturados contêm placeholders.**
   `hello@example.com` é publicado no JSON-LD; o botão com nome “WhatsApp” aponta
   apenas para `#contact`; redes sociais sem URL continuam visíveis como texto
   desabilitado.
5. **Observado — a jornada é excessivamente longa.** As três cenas usam cerca de
   260–320 svh cada. A Home ultrapassa 20 mil px em viewports comuns. Impacto esperado:
   o prospect que chegou por uma demonstração privada demora demais para confirmar
   prova, método e contato.
6. **Observado — CTA estreito em inglês.** Em 320×568 nenhum dos dois CTAs do Hero fica
   completamente visível na primeira dobra; em PT o secundário fica abaixo.
7. **Observado — conteúdo proibido permanece no repositório.** O conteúdo legado de
   Lumina inclui “18 anos”, “64 projetos” e “12 prêmios”; BRASA inclui “Reservas
   limitadas”. Mesmo quando parte desse conteúdo não é renderizada, ele pode voltar à
   Home por engano e viola a regra de integridade definida para o projeto.

### Médio

8. **Observado — menu mobile não fecha com Escape.** Ele fecha pelo botão e por links,
   mas falha no teste de teclado.
9. **Observado — fallback mobile sem JavaScript é incompleto.** O conteúdo permanece
   visível, porém o botão de menu também permanece visível sem funcionar e a navegação
   mobile continua recolhida.
10. **Observado — metadados incompletos.** Faltam canonical, `og:url`, locale Open
    Graph e uma imagem social adequada. O `og:image` aponta para um SVG experimental
    antigo, não para uma representação aprovada da STANDLOUD.
11. **Observado — inglês não possui dialeto explícito.** O documento usa `lang="en"` e
    `hreflang="en"`. A redação atual é compatível com en-US; essa deve ser a convenção
    documentada e aplicada.
12. **Observado — 404 sem marca.** Rotas inexistentes retornam 404 correto, mas apenas
    texto simples, sem navegação PT/EN nem retorno à Home.
13. **Observado — runtime legado é enviado sem uso.** CSS, JS, renderers e conteúdo de
    Lumina/Nexora continuam no bundle embora nenhuma dessas cenas seja habilitada.
    Isso adiciona manutenção e bytes sem benefício na Home.
14. **Observado — documentação diverge do código.** O README declara Lumina e
    Gravidade da Marca ativas; a configuração real ativa AQUAFORM, BRASA 27 e
    ATLAS & VALE.
15. **Inferido — prova sobre o estúdio chega tarde.** O About é correto, mas o único
    nome real por trás do trabalho e o método aparecem depois de três demonstrações.
    Para prospects vindos de preview privado, confiança precisa chegar antes.
16. **Observado — formulário e mensagem não têm destino alternativo.** Sem backend,
    não há e-mail comercial aprovado, WhatsApp real, link de agenda ou ação de copiar
    a solicitação.
17. **Observado — no-JS usa `novalidate`.** Se o script externo falhar, o formulário
    perde a validação nativa e tenta navegar com os dados na URL atual.

### Baixo

18. **Observado — redes ausentes ocupam espaço no footer.** É mais claro ocultar canais
    não configurados do que mostrar nomes desabilitados.
19. **Observado — disponibilidade não verificada.** “Novos projetos / Open for new
    projects” é uma afirmação operacional que não possui fonte no repositório. Pode ser
    substituída por uma expectativa neutra de processo.
20. **Inferido — valores de orçamento podem envelhecer.** As faixas PT e USD são
    decisões comerciais, não falhas técnicas; devem permanecer configuráveis e ser
    validadas pelo responsável antes da publicação.

## Oportunidades

- Colocar NUPPAC antes dos estudos conceituais e explicar contexto, desafio, solução e
  entregas sem inventar resultados.
- Transformar a mensagem “mostramos primeiro” em diferenciação comercial explícita,
  conectando Private Previews ao método do estúdio.
- Usar os três conceitos como evidência de raciocínio por segmento, não apenas como
  espetáculo visual.
- Reduzir a duração das cenas sem eliminar seus estados narrativos.
- Fazer a Home chegar mais cedo a projeto real, método, responsável e contato.
- Limpar o runtime não utilizado e definir um contrato de conteúdo que impeça métricas
  ou escassez sem fonte.
- Preparar canonical, hreflang en-US, JSON-LD honesto, sitemap com domínio estável e
  404 bilíngue.

## Riscos

- Alterar profundamente as cenas pode apagar o melhor ativo visual atual. A melhoria
  deve limitar duração e conteúdo periférico, preservando arte e mecânica.
- Publicar um e-mail pessoal sem autorização cria risco de privacidade. A resolução do
  formulário depende de um canal comercial aprovado.
- Criar páginas individuais para todos os conceitos agora aumentaria escopo e
  duplicação sem prova de ganho; anchors existentes são suficientes nesta etapa.
- Remover conteúdo legado sem preservar referência pode apagar trabalho anterior.
  Quando necessário, ele deve ficar arquivado fora do bundle público.

## Não alterar nesta etapa

- Logo e sistema visual STANDLOUD.
- Identidade distinta de AQUAFORM, BRASA 27 e ATLAS & VALE.
- Classificação conceitual visível desses três projetos.
- Stack estática, build Cloudflare e `assets.directory: "./_site"`.
- Rotas públicas atuais `/`, `/pt/` e `/en/`.
- Progresso reversível, `requestAnimationFrame` e fallback reduced motion.
- Conteúdo factual do NUPPAC sem fonte adicional.

## Decisões humanas necessárias

- Qual e-mail, WhatsApp, agenda ou endpoint comercial pode ser publicado e receber o
  formulário.
- Se as faixas de investimento atuais devem permanecer.
- URL pública definitiva caso o domínio Workers atual deixe de ser o canonical.
- Links reais de redes sociais, caso devam aparecer.

## Melhorias que podem prosseguir imediatamente

- Renderizar prova rápida e estudo NUPPAC.
- Reestruturar a vitrine para NUPPAC + três conceitos, com integridade explícita.
- Corrigir Escape, fallback mobile sem JS e validação nativa.
- Remover placeholders visíveis, escassez e métricas não comprovadas.
- Encurtar as cenas preservando a narrativa.
- Aplicar en-US consistentemente.
- Melhorar canonical, hreflang, Open Graph, sitemap e 404.
- Atualizar testes, documentação e limpeza do runtime legado.
