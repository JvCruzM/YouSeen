// YouSeen - popup.js
const DEFAULTS = { youseenEnabled: true, youseenThreshold: 95 };

const enabledToggle = document.getElementById('enabledToggle');
const thresholdSelect = document.getElementById('thresholdSelect');
const statsText = document.getElementById('statsText');

function loadOptions() {
  chrome.storage.sync.get(DEFAULTS, (items) => {
    enabledToggle.checked = items.youseenEnabled;
    thresholdSelect.value = String(items.youseenThreshold);
  });
}

function saveOptions() {
  chrome.storage.sync.set({
    youseenEnabled: enabledToggle.checked,
    youseenThreshold: Number(thresholdSelect.value),
  });
}

function loadStats() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url || !tab.url.includes('youtube.com')) {
      statsText.textContent = 'Abra uma página do YouTube para ver as estatísticas.';
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: 'YOUSEEN_GET_STATS' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        statsText.textContent = 'Recarregue a aba do YouTube para ativar o YouSeen aqui.';
        return;
      }
      const { total, hidden } = response;
      statsText.textContent = total > 0
        ? `${hidden} de ${total} vídeos ocultos nesta página.`
        : 'Nenhum vídeo detectado nesta página ainda.';
    });
  });
}

enabledToggle.addEventListener('change', saveOptions);
thresholdSelect.addEventListener('change', saveOptions);

loadOptions();
loadStats();
