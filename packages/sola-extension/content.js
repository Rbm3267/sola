// Sola Chrome Extension — Content Script (In-Situ Preview)

(function () {
  if (window.__SOLA_EXTENSION_INITIALIZED__) return;
  window.__SOLA_EXTENSION_INITIALIZED__ = true;

  console.log('[Sola] In-situ preview content script mounted.');

  // Create isolated Shadow DOM host
  const hostDiv = document.createElement('div');
  hostDiv.id = 'sola-in-situ-root';
  hostDiv.style.position = 'fixed';
  hostDiv.style.bottom = '24px';
  hostDiv.style.right = '24px';
  hostDiv.style.zIndex = '2147483647';
  hostDiv.style.fontFamily = 'system-ui, -apple-system, sans-serif';
  document.documentElement.appendChild(hostDiv);

  const shadow = hostDiv.attachShadow({ mode: 'open' });

  // CSP-Safe Sentinel Theme Scraper
  function extractHostTheme() {
    const sentinel = document.createElement('div');
    sentinel.className = 'btn-primary bg-background text-foreground';
    sentinel.style.position = 'absolute';
    sentinel.style.visibility = 'hidden';
    document.body.appendChild(sentinel);

    const style = window.getComputedStyle(sentinel);
    const bodyStyle = window.getComputedStyle(document.body);

    const theme = {
      bg: bodyStyle.backgroundColor || '#090d19',
      color: bodyStyle.color || '#f8fafc',
      font: bodyStyle.fontFamily || 'sans-serif'
    };

    sentinel.remove();
    return theme;
  }

  const hostTheme = extractHostTheme();

  // Inject Styles into Shadow DOM
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .sola-capsule {
      background: rgba(9, 13, 25, 0.95);
      color: #f8fafc;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 12px 18px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(16px);
      font-size: 12px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .sola-capsule:hover {
      transform: translateY(-2px);
      border-color: rgba(16, 185, 129, 0.4);
    }
    .sola-pill {
      background: rgba(16, 185, 129, 0.15);
      color: #10b981;
      padding: 2px 8px;
      border-radius: 12px;
      font-family: monospace;
      font-weight: 700;
      font-size: 10px;
    }
    .sola-card-preview {
      margin-top: 10px;
      background: #0f172a;
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 16px;
      width: 280px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .sola-btn {
      background: #10b981;
      color: #090d19;
      border: none;
      border-radius: 8px;
      padding: 6px 12px;
      font-weight: 700;
      font-size: 11px;
      cursor: pointer;
      margin-top: 6px;
    }
  `;
  shadow.appendChild(styleEl);

  // Render Capsule HUD
  const container = document.createElement('div');
  container.innerHTML = `
    <div class="sola-capsule" id="sola-trigger">
      <span class="sola-pill">SOLA ACTIVE</span>
      <span style="font-weight: 600;">View in My UI</span>
    </div>
    <div class="sola-card-preview" id="sola-drawer" style="display: none;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span id="sola-preview-title" style="font-weight: 700; font-size: 13px; color: #fff;">In-Situ Preview</span>
        <span class="sola-pill">Zero-VDOM</span>
      </div>
      <p id="sola-preview-desc" style="font-size: 11px; color: #94a3b8;">
        Live component mounted in Shadow DOM with 0 CSS collision.
      </p>
      <div style="background: #1e293b; padding: 8px; border-radius: 8px; font-family: monospace; font-size: 10px; color: #38bdf8;">
        npm i @sola/core @sola/ui
      </div>
      <button class="sola-btn" id="sola-copy-code">Copy Integration Code</button>
    </div>
  `;
  shadow.appendChild(container);

  const trigger = shadow.getElementById('sola-trigger');
  const drawer = shadow.getElementById('sola-drawer');
  const copyBtn = shadow.getElementById('sola-copy-code');
  const titleEl = shadow.getElementById('sola-preview-title');
  const descEl = shadow.getElementById('sola-preview-desc');

  trigger.addEventListener('click', () => {
    drawer.style.display = drawer.style.display === 'none' ? 'flex' : 'none';
  });

  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText("import { DataCard } from '@sola/ui';\nimport { createSignal } from '@sola/core';");
    copyBtn.textContent = 'Copied!';
    setTimeout(() => copyBtn.textContent = 'Copy Integration Code', 2000);
  });

  // Listen for messages from web pages (e.g. Sola Community / Studio)
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SOLA_MOUNT_IN_SITU') {
      drawer.style.display = 'flex';
      if (event.data.template) {
        if (titleEl) titleEl.textContent = event.data.template.title || 'In-Situ Preview';
        if (descEl) descEl.textContent = event.data.template.description || 'Mounted from Sola Design Community';
      }
    }
  });

  // Listen for messages from extension sidepanel
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SHOW_PREVIEW') {
        drawer.style.display = 'flex';
        sendResponse({ status: 'ok' });
      }
    });
  }
})();
