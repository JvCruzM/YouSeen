const DEFAULTS = { youseenEnabled: true, youseenThreshold: 95 };

const enabledToggle = document.getElementById('enabledToggle');
const thresholdSelect = document.getElementById('thresholdSelect');
const statsText = document.getElementById('statsText');
const statusBadge = document.getElementById('statusBadge');
const channelNotice = document.getElementById('channelNotice');

function isChannelUrl(url) {
  try {
    const { pathname } = new URL(url);

    return (
      /^\/@[^/]+(?:\/|$)/.test(pathname) ||
      /^\/channel\/[^/]+(?:\/|$)/.test(pathname) ||
      /^\/c\/[^/]+(?:\/|$)/.test(pathname) ||
      /^\/user\/[^/]+(?:\/|$)/.test(pathname)
    );
  } catch {
    return false;
  }
}

function updateStatusBadge() {
  const enabled = enabledToggle.checked;
  statusBadge.textContent = enabled ? 'Ativo' : 'Desativado';
  statusBadge.classList.toggle('off', !enabled);
}

function loadOptions() {
  chrome.storage.sync.get(DEFAULTS, (items) => {
    enabledToggle.checked = items.youseenEnabled;
    thresholdSelect.value = String(items.youseenThreshold);
    updateStatusBadge();
  });
}

function saveOptions() {
  const values = {
    youseenEnabled: enabledToggle.checked,
    youseenThreshold: Number(thresholdSelect.value),
  };

  chrome.storage.sync.set(values, () => {
    updateStatusBadge();
    loadStats();
  });
}

function loadStats() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];

    if (!tab?.id || !tab.url || !tab.url.includes('youtube.com')) {
      channelNotice.hidden = false;
      statsText.textContent = 'Disponível nas páginas de canais do YouTube.';
      statsText.classList.remove('error');
      return;
    }

    const channel = isChannelUrl(tab.url);
    channelNotice.hidden = channel;

    if (!channel) {
      statsText.textContent = 'Abra um canal do YouTube para ver as estatísticas.';
      statsText.classList.remove('error');
      return;
    }

    chrome.tabs.sendMessage(tab.id, { type: 'YOUSEEN_GET_STATS' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        statsText.textContent = 'Recarregue o canal para ativar o YouSeen.';
        statsText.classList.add('error');
        return;
      }

      statsText.classList.remove('error');

      if (response.total === 0) {
        statsText.textContent = 'Nenhum vídeo carregado nesta página ainda.';
        return;
      }

      statsText.textContent = `${response.hidden} de ${response.total} vídeos ocultos.`;
    });
  });
}

enabledToggle.addEventListener('change', saveOptions);
thresholdSelect.addEventListener('change', saveOptions);

loadOptions();
loadStats();
