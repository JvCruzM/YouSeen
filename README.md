# YouSeen

<p align="center">
  <img src="icons/icon128.png" alt="YouSeen" width="110">
</p>

<p align="center">
  <strong>Veja o que ainda falta assistir.</strong><br>
  Uma extensão para Vivaldi/Chromium que oculta vídeos já assistidos dentro de canais do YouTube.
</p>

## Sobre

O YouSeen foi criado para uma situação simples: você entra em um canal, vê dezenas de vídeos e precisa identificar rapidamente quais ainda não assistiu.

A extensão aproveita o progresso que o próprio YouTube exibe nas thumbnails. Quando o percentual de reprodução de um vídeo atinge o limite configurado, o card é ocultado.

O YouSeen não mantém uma lista própria de vídeos assistidos e não envia esses dados para um servidor.

## Recursos

- Oculta vídeos assistidos nas páginas de canais do YouTube.
- Funciona ao trocar entre **Em alta**, **Mais recentes** e **Mais antigos**.
- Continua funcionando enquanto novos vídeos são carregados ao rolar a página.
- Permite escolher o limite de **80%, 90%, 95% ou 100%**.
- Permite ativar ou desativar a ocultação pelo popup.
- Mostra quantos vídeos estão ocultos na página atual.

## Como funciona

O YouTube mostra uma barra de progresso na thumbnail quando existe histórico de reprodução. O YouSeen lê essa informação diretamente no DOM da página para decidir se o card deve ser ocultado.

Os dados usados pelo YouSeen permanecem no navegador. As únicas preferências salvas pela extensão são o estado de ativação e o limite escolhido, usando `chrome.storage.sync`.

## Instalação para desenvolvimento

1. Clone este repositório.
2. Abra `vivaldi://extensions`.
3. Ative o **Modo de desenvolvedor**.
4. Clique em **Carregar sem compactação**.
5. Selecione a pasta do projeto.
6. Abra um canal do YouTube e teste a extensão.

## Estrutura

```text
YouSeen/
├── icons/
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   ├── icon128.png
│   └── icon256.png
├── background.js
├── content.js
├── manifest.json
├── popup.css
├── popup.html
├── popup.js
├── PRIVACY.md
├── LICENSE
└── README.md
```

## Tecnologias

- JavaScript
- HTML
- CSS
- Chrome Extensions API
- Manifest V3

## Compatibilidade

Desenvolvido com foco no **Vivaldi** e baseado nas APIs de extensões Chromium. O Vivaldi informa que extensões disponíveis na Chrome Web Store podem ser instaladas no navegador. 

## Privacidade

Leia a [Política de Privacidade](PRIVACY.md).

## Licença

Este projeto está disponível sob a licença [MIT](LICENSE).

## Status

**Versão 0.3.0 — candidata a publicação.**

A extensão está em fase de preparação para distribuição pública e pode precisar de ajustes caso o YouTube altere novamente a estrutura das thumbnails.
