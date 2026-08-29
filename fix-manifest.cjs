const fs = require('fs');

const manifestPath = 'packages/sola-extension/manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

delete manifest.host_permissions;
delete manifest.content_scripts;

if (!manifest.permissions.includes('scripting')) {
  manifest.permissions.push('scripting');
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

const sidepanelPath = 'packages/sola-extension/sidepanel.js';
const sidepanelCode = `// Sidepanel Script for Sola Chrome Extension

document.querySelectorAll('.dock-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        }, () => {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'SHOW_PREVIEW' });
        });
      }
    });
  });
});
`;
fs.writeFileSync(sidepanelPath, sidepanelCode);

const bgPath = 'packages/sola-extension/background.js';
const bgCode = `// Sola Chrome Extension - Background Service Worker (Manifest V3)

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
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
`;
fs.writeFileSync(bgPath, bgCode);

console.log('Fixed extension permissions');
