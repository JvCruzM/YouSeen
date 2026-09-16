const watchedCount = document.getElementById("watched-count");
const clearHistoryButton = document.getElementById("clear-history");

function updateCount() {
  chrome.storage.local.get(["watchedVideos"], (result) => {
    const watchedVideos = result.watchedVideos || [];
    watchedCount.textContent = watchedVideos.length;
  });
}

clearHistoryButton.addEventListener("click", () => {
  chrome.storage.local.set({ watchedVideos: [] }, () => {
    updateCount();
  });
});

updateCount();