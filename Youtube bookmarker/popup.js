document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = new URL(tab.url);
  if (!url.hostname.includes("youtube.com")) {
    document.body.innerHTML = "<p>This extension works on YouTube only.</p>";
    return;
  }

  const videoId = url.searchParams.get("v");
  const timestamp = Math.floor(tab.url.includes("t=") ? parseInt(url.searchParams.get("t")) : 0);
  const key = `ytbm_${videoId}_${timestamp}`;

  document.getElementById("save").addEventListener("click", () => {
    const title = document.getElementById("title").value;
    const note = document.getElementById("note").value;

    chrome.storage.sync.set({
      [key]: { title, note, videoId, timestamp }
    }, () => {
      loadBookmarks();
    });
  });

  function loadBookmarks() {
    chrome.storage.sync.get(null, (items) => {
      const list = document.getElementById("bookmarks");
      list.innerHTML = "";
      for (const [key, val] of Object.entries(items)) {
        if (val.videoId) {
          const li = document.createElement("li");
          const link = `https://www.youtube.com/watch?v=${val.videoId}&t=${val.timestamp}s`;
          li.innerHTML = `<a href="${link}" target="_blank">${val.title || "Untitled"}</a>: ${val.note || ""}`;
          list.appendChild(li);
        }
      }
    });
  }

  loadBookmarks();
});
