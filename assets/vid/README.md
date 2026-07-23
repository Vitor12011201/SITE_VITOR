# Futuros vídeos scroll-world

Esta pasta está reservada para os arquivos codificados da cadeia.

Arquitetura escolhida: voo contínuo para a frente, sem conectores.

Nomes previstos no desktop:

`01-studio.mp4` até `08-launch.mp4`

Se a cadeia mobile 9:16 for aprovada:

`01-studio-m.mp4` até `08-launch-m.mp4`

Não coloque renders brutos aqui. Guarde os masters fora da pasta pública e publique
somente os encodes sem áudio, com faststart e GOP curto definidos na Skill.

Encodes públicos versionados nesta pasta são incluídos por `npm run build:cloudflare`.
Materiais brutos devem permanecer em `assets/vid/raw/`, `assets/vid/masters/` ou
`assets/vid/sources/`; essas pastas são ignoradas pelo Git e nunca entram em `_site/`.

Os arquivos não existem nesta etapa e não devem ser substituídos por vídeos genéricos.
Quando forem aprovados, a integração deve:

- manter o SVG/still como poster até o primeiro frame decodificar;
- buscar cada clipe como `Blob` para permitir seeking em hospedagem estática;
- carregar somente o trecho atual e o próximo;
- dirigir `currentTime` com scroll via `requestAnimationFrame`;
- preservar conteúdo e navegação caso fetch, decode, seek ou JavaScript falhe;
- não carregar vídeo com `prefers-reduced-motion`;
- manter o fallback estático no mobile até uma cadeia 9:16 nativa ser aprovada.

O contrato de câmera e as emendas estão em `docs/STORYBOARD.md`.
