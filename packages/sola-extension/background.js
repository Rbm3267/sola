// Sola Chrome Extension - Background Service Worker (Manifest V3)

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.session.set({ solaTabId: tab.id });
  chrome.sidePanel.open({ windowId: tab.windowId });
});
