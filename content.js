// YouSeen - content.js
// Roda em qualquer página do youtube.com (Home, Assinaturas, canal, busca, playlists...)
// e oculta os "cards" de vídeo cujo progresso de reprodução (dado que o próprio YouTube
// já guarda e mostra como uma barrinha vermelha no thumbnail) indica que já foram
// assistidos até o fim.

(() => {
  'use strict';

  const DEFAULTS = { youseenEnabled: true, youseenThreshold: 95 };
  const HIDDEN_CLASS = 'youseen-hidden-video';
  const STYLE_TAG_ID = 'youseen-style-tag';
  const PROCESSED_ATTR = 'data-youseen-percent';

  // Tipos de "card" de vídeo que o YouTube usa em diferentes páginas
  const RENDERER_SELECTORS = [
    'ytd-rich-item-renderer',        // Home, canal (grade)
    'ytd-grid-video-renderer',       // grades antigas / algumas playlists
    'ytd-video-renderer',            // resultados de busca, listas verticais
    'ytd-compact-video-renderer',    // barra lateral "próximos vídeos"
    'ytd-playlist-video-renderer',   // dentro de uma playlist
    'ytd-reel-item-renderer',        // Shorts em grade
  ].join(',');

  let state = { ...DEFAULTS };

  function ensureStyleTag() {
    let tag = document.getElementById(STYLE_TAG_ID);
    if (!tag) {
      tag = document.createElement('style');
      tag.id = STYLE_TAG_ID;
      document.documentElement.appendChild(tag);
    }
    return tag;
  }

  function applyEnabledState() {
    const tag = ensureStyleTag();
    tag.textContent = state.youseenEnabled
      ? `.${HIDDEN_CLASS} { display: none !important; }`
      : '';
  }

  // Lê a % de progresso que o próprio YouTube desenha no thumbnail.
  // Estrutura real: <div id="progress" class="style-scope ytd-thumbnail-overlay-resume-playback-renderer" style="width: 87%;">
  function getWatchedPercent(renderer) {
    const progressEl = renderer.querySelector(
      '#progress.ytd-thumbnail-overlay-resume-playback-renderer'
    );
    if (!progressEl || !progressEl.style.width) return null;
    const percent = parseFloat(progressEl.style.width);
    return Number.isNaN(percent) ? null : percent;
  }

  function processRenderer(renderer) {
    const percent = getWatchedPercent(renderer);

    if (percent === null) {
      // Vídeo sem progresso registrado (nunca assistido) -> nunca ocultar
      renderer.classList.remove(HIDDEN_CLASS);
      renderer.removeAttribute(PROCESSED_ATTR);
      return;
    }

    renderer.setAttribute(PROCESSED_ATTR, String(percent));
    renderer.classList.toggle(HIDDEN_CLASS, percent >= state.youseenThreshold);
  }

  function scan(root) {
    (root || document).querySelectorAll(RENDERER_SELECTORS).forEach(processRenderer);
  }

  function countStats() {
    const all = document.querySelectorAll(RENDERER_SELECTORS);
    let hidden = 0;
    all.forEach((el) => {
      if (el.classList.contains(HIDDEN_CLASS)) hidden += 1;
    });
    return { total: all.length, hidden };
  }

  // --- Observa a página, que é uma SPA (não recarrega ao navegar) ---

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return;
        if (node.matches && node.matches(RENDERER_SELECTORS)) {
          processRenderer(node);
        }
        if (node.querySelectorAll) {
          node.querySelectorAll(RENDERER_SELECTORS).forEach(processRenderer);
        }
      });
    }
  });

  function startObserving() {
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // O YouTube dispara este evento customizado ao trocar de página via SPA
  document.addEventListener('yt-navigate-finish', () => {
    // pequeno atraso para o novo conteúdo já estar no DOM
    setTimeout(() => scan(), 300);
  });

  // --- Sincroniza com as opções escolhidas no popup ---

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    let needsRescan = false;

    if (changes.youseenEnabled) {
      state.youseenEnabled = changes.youseenEnabled.newValue;
      applyEnabledState();
    }
    if (changes.youseenThreshold) {
      state.youseenThreshold = changes.youseenThreshold.newValue;
      needsRescan = true;
    }
    if (needsRescan) scan();
  });

  // --- Responde ao popup quando ele pede estatísticas da página atual ---

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message && message.type === 'YOUSEEN_GET_STATS') {
      sendResponse(countStats());
    }
    return true;
  });

  // --- Inicialização ---

  chrome.storage.sync.get(DEFAULTS, (items) => {
    state = items;
    applyEnabledState();
    scan();
    startObserving();
  });
})();
