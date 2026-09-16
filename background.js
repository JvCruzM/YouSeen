const DEFAULTS = {
  youseenEnabled: true,
  youseenThreshold: 95,
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get(DEFAULTS, (current) => {
    chrome.storage.sync.set(current);
  });
});
