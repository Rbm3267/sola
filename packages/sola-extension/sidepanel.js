// Sidepanel Script for Sola Chrome Extension

document.querySelectorAll('.dock-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'SHOW_PREVIEW' });
      }
    });
  });
});
