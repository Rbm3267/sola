// Sola UI — Sidepanel Script

// Dismiss guide
const dismissBtn = document.getElementById('dismiss-guide');
const guide = document.getElementById('setup-guide');
if (dismissBtn && guide) {
  // Check if already dismissed
  chrome.storage.local.get('guideDismissed', (data) => {
    if (data.guideDismissed) guide.style.display = 'none';
  });
  dismissBtn.addEventListener('click', () => {
    guide.style.display = 'none';
    chrome.storage.local.set({ guideDismissed: true });
  });
}

// Track which component is currently previewing
let activeComponent = null;

document.querySelectorAll('.dock-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const componentId = btn.dataset.component;

    // Toggle off if same component clicked again
    if (activeComponent === componentId) {
      activeComponent = null;
      btn.classList.remove('active');
      // Send remove message
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]?.id) {
          chrome.tabs.sendMessage(tabs[0].id, { type: 'SOLA_REMOVE_PREVIEW' });
        }
      });
      return;
    }

    // Deactivate previous
    document.querySelectorAll('.dock-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeComponent = componentId;

    // Inject content script and send component info
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          files: ['content.js']
        }, () => {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'SOLA_SHOW_COMPONENT',
            component: componentId
          });
        });
      }
    });
  });
});
