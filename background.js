// YouSeen - background service worker
// Único papel: garantir que existam valores padrão salvos na primeira instalação
// (o resto da lógica mora em content.js e popup.js).

const DEFAULTS = {
  youseenEnabled: true,
  youseenThreshold: 95, // % assistido a partir do qual o vídeo é considerado "visto"
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(DEFAULTS, (current) => {
    chrome.storage.sync.set(current);
  });
});
