# YouSeen

Extensão para o Vivaldi (e qualquer navegador baseado em Chromium) que oculta vídeos do YouTube já assistidos por completo, para você ver rapidamente o que ainda falta assistir em um canal, playlist, na Home ou nos resultados de busca.

## Como funciona

O próprio YouTube já guarda, na sua conta, o quanto você assistiu de cada vídeo — e desenha essa informação como uma barrinha vermelha por baixo da thumbnail. O YouSeen lê essa barrinha (sem criar nenhum rastreamento próprio) e, quando o progresso passa do limite configurado, oculta o card do vídeo.

Por usar o progresso salvo na sua conta do Google, funciona mesmo para vídeos assistidos em outro dispositivo.

## Instalação (modo desenvolvedor)

1. Baixe/clone este repositório.
2. No Vivaldi, acesse `vivaldi://extensions`.
3. Ative o **Modo de desenvolvedor** (canto superior direito).
4. Clique em **Carregar sem compactação** (Load unpacked) e selecione a pasta do projeto.
5. Abra o YouTube — os vídeos assistidos por completo somem automaticamente.

## Uso

Clique no ícone do YouSeen na barra de extensões para:
- Ligar/desligar a ocultação a qualquer momento.
- Escolher a partir de qual % de progresso um vídeo é considerado "assistido" (100%, 95%, 90% ou 80%).
- Ver quantos vídeos estão ocultos na página atual.

## Tecnologias

- JavaScript
- HTML
- CSS
- Chrome Extensions API
- Manifest V3

## Status

Em desenvolvimento.
