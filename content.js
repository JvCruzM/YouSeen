(() => {
  'use strict';

  const DEFAULTS = { youseenEnabled: true, youseenThreshold: 95 };
  const HIDDEN_CLASS = 'youseen-hidden-video';
  const STYLE_TAG_ID = 'youseen-style-tag';
  const PROCESSED_ATTR = 'data-youseen-percent';

  const RENDERER_SELECTORS = [
    'ytd-rich-item-renderer',
    'ytd-grid-video-renderer',
    'ytd-video-renderer',
    'ytd-compact-video-renderer',
    'ytd-playlist-video-renderer',
    'ytd-reel-item-renderer',
  ].join(',');

  let state = { ...DEFAULTS };
  let scanTimer = null;
  let lateScanTimer = null;

  function isChannelPage() {
    const path = window.location.pathname;

    return (
      /^\/@[^/]+(?:\/|$)/.test(path) ||
      /^\/channel\/[^/]+(?:\/|$)/.test(path) ||
      /^\/c\/[^/]+(?:\/|$)/.test(path) ||
      /^\/user\/[^/]+(?:\/|$)/.test(path)
    );
  }

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

  function getWatchedPercent(renderer) {
    const newProgressEl = renderer.querySelector(
      'yt-thumbnail-overlay-progress-bar-view-model ' +
        '.ytThumbnailOverlayProgressBarHostWatchedProgressBarSegment',
    );

    if (newProgressEl?.style.width) {
      const percent = parseFloat(newProgressEl.style.width);

      if (!Number.isNaN(percent)) {
        return percent;
      }
    }

    const oldProgressEl = renderer.querySelector(
      '#progress.ytd-thumbnail-overlay-resume-playback-renderer',
    );

    if (oldProgressEl?.style.width) {
      const percent = parseFloat(oldProgressEl.style.width);

      if (!Number.isNaN(percent)) {
        return percent;
      }
    }

    return null;
  }

  function processRenderer(renderer) {
    if (!isChannelPage()) {
      renderer.classList.remove(HIDDEN_CLASS);
      renderer.removeAttribute(PROCESSED_ATTR);
      return;
    }

    const percent = getWatchedPercent(renderer);

    if (percent === null) {
      renderer.classList.remove(HIDDEN_CLASS);
      renderer.removeAttribute(PROCESSED_ATTR);
      return;
    }

    renderer.setAttribute(PROCESSED_ATTR, String(percent));
    renderer.classList.toggle(HIDDEN_CLASS, percent >= state.youseenThreshold);
  }

  function clearHiddenVideos() {
    document.querySelectorAll(`.${HIDDEN_CLASS}`).forEach((renderer) => {
      renderer.classList.remove(HIDDEN_CLASS);
      renderer.removeAttribute(PROCESSED_ATTR);
    });
  }

  function scan(root) {
    if (!isChannelPage()) {
      clearHiddenVideos();
      return;
    }

    const target = root || document;

    if (
      target.nodeType === Node.ELEMENT_NODE &&
      target.matches?.(RENDERER_SELECTORS)
    ) {
      processRenderer(target);
    }

    target.querySelectorAll(RENDERER_SELECTORS).forEach(processRenderer);
  }

  function countStats() {
    if (!isChannelPage()) {
      return { total: 0, hidden: 0, channel: false };
    }

    const all = document.querySelectorAll(RENDERER_SELECTORS);
    let hidden = 0;

    all.forEach((el) => {
      if (el.classList.contains(HIDDEN_CLASS)) {
        hidden += 1;
      }
    });

    return { total: all.length, hidden, channel: true };
  }

  function scheduleScan(delay = 200) {
    clearTimeout(scanTimer);

    scanTimer = setTimeout(() => {
      scan();
      scanTimer = null;
    }, delay);

    if (lateScanTimer === null) {
      lateScanTimer = setTimeout(() => {
        scan();
        lateScanTimer = null;
      }, 1000);
    }
  }

  const observer = new MutationObserver((mutations) => {
    if (!isChannelPage()) {
      return;
    }

    const hasAddedNodes = mutations.some(
      (mutation) => mutation.addedNodes.length > 0,
    );

    if (hasAddedNodes) {
      scheduleScan();
    }
  });

  function startObserving() {
    if (!document.body) {
      return;
    }

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  function handleNavigation() {
    scheduleScan(300);
  }

  document.addEventListener('yt-navigate-finish', handleNavigation);
  document.addEventListener('yt-page-data-updated', handleNavigation);
  window.addEventListener('popstate', handleNavigation);

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') {
      return;
    }

    let needsRescan = false;

    if (changes.youseenEnabled) {
      state.youseenEnabled = changes.youseenEnabled.newValue;
      applyEnabledState();
      needsRescan = true;
    }

    if (changes.youseenThreshold) {
      state.youseenThreshold = changes.youseenThreshold.newValue;
      needsRescan = true;
    }

    if (needsRescan) {
      scheduleScan(50);
    }
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message && message.type === 'YOUSEEN_GET_STATS') {
      sendResponse(countStats());
    }

    return true;
  });

  chrome.storage.sync.get(DEFAULTS, (items) => {
    state = items;
    applyEnabledState();
    scan();
    startObserving();
  });
})();
