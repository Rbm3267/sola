// Sola Chrome Extension - Background Service Worker (Manifest V3)

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Only handle messages from this extension's own pages
  if (sender.id !== chrome.runtime.id) return;
  if (message.type === 'INJECT_SOLA_WIDGET') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        }, () => {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            sendResponse(response);
          });
        });
      }
    });
    return true;
  }
});
