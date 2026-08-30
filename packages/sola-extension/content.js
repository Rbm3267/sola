// Sola UI — Content Script (Live Page Component Preview & DOM Insertion Engine)

(function () {
  if (window.__SOLA_INITIALIZED__) return;
  window.__SOLA_INITIALIZED__ = true;

  let currentPreview = null;
  let hostDiv = null;
  let isTargetMode = false;
  let targetElement = null;
  let targetOverlay = null;

  // Component preview definitions — each renders a self-contained HTML preview
  const COMPONENTS = {
    datacard: {
      title: 'DataCard',
      code: `import { DataCard } from '@sola/ui';`,
      render: () => `
        <div style="background:#0c1222;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;width:280px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
          <div style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Monthly Revenue</div>
          <div style="font-size:28px;font-weight:800;color:#fff;margin:8px 0 4px;font-family:monospace;">$84,230</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;">
            <span style="color:#10b981;font-weight:700;">+12.4%</span>
            <span style="color:#64748b;">vs last month</span>
          </div>
          <div style="margin-top:12px;height:32px;display:flex;align-items:end;gap:2px;">
            ${[30,45,35,55,40,65,50,70,60,80,75,90].map(h => `<div style="flex:1;background:rgba(16,185,129,0.35);height:${h}%;border-radius:2px;"></div>`).join('')}
          </div>
        </div>`
    },
    gauge: {
      title: 'GaugeCard',
      code: `import { GaugeCard } from '@sola/ui';`,
      render: () => `
        <div style="background:#0c1222;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;width:220px;text-align:center;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
          <svg width="120" height="70" viewBox="0 0 120 70">
            <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8" stroke-linecap="round"/>
            <path d="M 10 65 A 50 50 0 0 1 92 25" fill="none" stroke="#10b981" stroke-width="8" stroke-linecap="round"/>
          </svg>
          <div style="font-size:24px;font-weight:800;color:#fff;margin-top:4px;font-family:monospace;">78%</div>
          <div style="font-size:11px;color:#94a3b8;margin-top:2px;">System Capacity</div>
        </div>`
    },
    waterfall: {
      title: 'FlowWaterfall',
      code: `import { FlowWaterfall } from '@sola/ui';`,
      render: () => `
        <div style="background:#0c1222;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;width:300px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
          <div style="font-size:11px;color:#94a3b8;font-weight:600;margin-bottom:12px;">REVENUE SETTLEMENT</div>
          <div style="display:flex;align-items:end;gap:4px;height:100px;">
            <div style="flex:1;text-align:center;">
              <div style="background:#0ea5e9;height:80px;border-radius:4px;"></div>
              <div style="font-size:9px;color:#64748b;margin-top:4px;">Gross</div>
            </div>
            <div style="flex:1;text-align:center;">
              <div style="background:#10b981;height:30px;border-radius:4px;margin-top:50px;"></div>
              <div style="font-size:9px;color:#64748b;margin-top:4px;">Upsell</div>
            </div>
            <div style="flex:1;text-align:center;">
              <div style="background:#f43f5e;height:15px;border-radius:4px;margin-top:65px;"></div>
              <div style="font-size:9px;color:#64748b;margin-top:4px;">Fee</div>
            </div>
            <div style="flex:1;text-align:center;">
              <div style="background:#8b5cf6;height:95px;border-radius:4px;"></div>
              <div style="font-size:9px;color:#64748b;margin-top:4px;">Net</div>
            </div>
          </div>
        </div>`
    },
    dial: {
      title: 'TactileDial',
      code: `import { TactileDialCard } from '@sola/ui';`,
      render: () => `
        <div style="background:#0c1222;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;width:220px;text-align:center;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
          <div style="font-size:11px;color:#94a3b8;font-weight:600;margin-bottom:10px;">RATE THROTTLE</div>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="6" stroke-dasharray="188 63" stroke-linecap="round" transform="rotate(-90 50 50)"/>
            <circle cx="50" cy="50" r="4" fill="#10b981"/>
            <line x1="50" y1="50" x2="50" y2="18" stroke="#10b981" stroke-width="2" stroke-linecap="round" transform="rotate(110 50 50)"/>
          </svg>
          <div style="font-size:20px;font-weight:800;color:#fff;margin-top:6px;font-family:monospace;">74%</div>
        </div>`
    }
  };

  function createHost() {
    if (hostDiv) return;
    hostDiv = document.createElement('div');
    hostDiv.id = 'sola-preview-root';
    Object.assign(hostDiv.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: '2147483647',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    });
    document.documentElement.appendChild(hostDiv);
  }

  function showComponent(componentId) {
    createHost();

    const comp = COMPONENTS[componentId] || COMPONENTS.datacard;

    removePreview();

    const shadow = hostDiv.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      @keyframes slideIn { from { opacity: 0; transform: translateY(12px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      .preview-wrapper {
        animation: slideIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        cursor: default;
      }
      .preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        padding: 6px 10px;
        background: #090d19;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 12px;
        cursor: grab;
        user-select: none;
      }
      .preview-header:active { cursor: grabbing; }
      .preview-label {
        font-size: 10px;
        font-weight: 700;
        color: #10b981;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .preview-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #10b981;
      }
      .controls-row {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .ctrl-btn {
        background: rgba(255,255,255,0.05);
        border: 1px solid rgba(255,255,255,0.1);
        color: #94a3b8;
        cursor: pointer;
        padding: 3px 6px;
        border-radius: 6px;
        font-size: 10px;
        display: flex;
        align-items: center;
        transition: all 0.15s;
      }
      .ctrl-btn:hover { color: #fff; background: rgba(255,255,255,0.15); }
      .close-btn {
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 3px 5px;
        border-radius: 4px;
        font-size: 12px;
      }
      .close-btn:hover { color: #f43f5e; background: rgba(244,63,94,0.1); }
      .code-bar {
        margin-top: 8px;
        background: #030712;
        border: 1px solid rgba(255,255,255,0.08);
        border-radius: 10px;
        padding: 8px 10px;
        font-family: monospace;
        font-size: 10px;
        color: #38bdf8;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .copy-btn {
        background: rgba(16,185,129,0.15);
        color: #10b981;
        border: 1px solid rgba(16,185,129,0.3);
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 9px;
        font-weight: 700;
        cursor: pointer;
        font-family: monospace;
      }
      .copy-btn:hover { background: rgba(16,185,129,0.25); }
    `;
    shadow.appendChild(style);

    const wrapper = document.createElement('div');
    wrapper.className = 'preview-wrapper';
    wrapper.innerHTML = `
      <div class="preview-header" id="sola-drag-header">
        <span class="preview-label"><span class="preview-dot"></span>Sola Shadow DOM</span>
        <div class="controls-row">
          <button class="ctrl-btn" id="sola-target-btn" title="Click to mount inside a specific page element">🎯 Target Element</button>
          <button class="ctrl-btn" id="sola-snap-btn" title="Cycle corner placement">📍 Snap</button>
          <button class="close-btn" id="sola-close" title="Close Preview">✕</button>
        </div>
      </div>
      ${comp.render()}
      <div class="code-bar">
        <span>${comp.code}</span>
        <button class="copy-btn" id="sola-copy">Copy Code</button>
      </div>
    `;
    shadow.appendChild(wrapper);

    // Make Draggable
    let isDragging = false;
    let startX = 0, startY = 0, initialLeft = 0, initialTop = 0;
    const header = shadow.getElementById('sola-drag-header');

    header.addEventListener('mousedown', (e) => {
      if (e.target.tagName === 'BUTTON') return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = hostDiv.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      hostDiv.style.bottom = 'auto';
      hostDiv.style.right = 'auto';
      hostDiv.style.left = `${initialLeft}px`;
      hostDiv.style.top = `${initialTop}px`;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      hostDiv.style.left = `${initialLeft + dx}px`;
      hostDiv.style.top = `${initialTop + dy}px`;
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Snap positions (Cycle: Bottom-Right -> Bottom-Left -> Top-Right -> Top-Left)
    let snapIdx = 0;
    const snapPositions = [
      { bottom: '24px', right: '24px', top: 'auto', left: 'auto' },
      { bottom: '24px', left: '24px', top: 'auto', right: 'auto' },
      { top: '24px', right: '24px', bottom: 'auto', left: 'auto' },
      { top: '24px', left: '24px', bottom: 'auto', right: 'auto' }
    ];

    const snapBtn = shadow.getElementById('sola-snap-btn');
    snapBtn.addEventListener('click', () => {
      snapIdx = (snapIdx + 1) % snapPositions.length;
      const pos = snapPositions[snapIdx];
      Object.assign(hostDiv.style, pos);
    });

    // Target Element Mode
    const targetBtn = shadow.getElementById('sola-target-btn');
    targetBtn.addEventListener('click', () => {
      startTargetPicker(componentId);
    });

    // Close button
    const closeBtn = shadow.getElementById('sola-close');
    closeBtn.addEventListener('click', removePreview);

    // Copy Code button
    const copyBtn = shadow.getElementById('sola-copy');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(comp.code);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy Code', 1500);
    });

    currentPreview = componentId;
  }

  function startTargetPicker(componentId) {
    if (isTargetMode) return;
    isTargetMode = true;

    // Create high-contrast hover target indicator
    targetOverlay = document.createElement('div');
    Object.assign(targetOverlay.style, {
      position: 'fixed',
      pointerEvents: 'none',
      border: '2px dashed #10b981',
      background: 'rgba(16,185,129,0.08)',
      borderRadius: '8px',
      zIndex: '2147483646',
      transition: 'all 0.1s ease-out',
      display: 'none'
    });
    document.body.appendChild(targetOverlay);

    function onMouseOver(e) {
      if (!isTargetMode) return;
      if (hostDiv && hostDiv.contains(e.target)) return;
      const target = e.target;
      const rect = target.getBoundingClientRect();
      Object.assign(targetOverlay.style, {
        display: 'block',
        left: `${rect.left}px`,
        top: `${rect.top}px`,
        width: `${rect.width}px`,
        height: `${rect.height}px`
      });
    }

    function onClick(e) {
      if (!isTargetMode) return;
      if (hostDiv && hostDiv.contains(e.target)) return;
      e.preventDefault();
      e.stopPropagation();

      const clickedElem = e.target;
      isTargetMode = false;
      if (targetOverlay) targetOverlay.remove();
      window.removeEventListener('mouseover', onMouseOver, true);
      window.removeEventListener('click', onClick, true);

      // Dock Sola preview directly relative to the targeted element
      const rect = clickedElem.getBoundingClientRect();
      Object.assign(hostDiv.style, {
        position: 'absolute',
        left: `${window.scrollX + rect.left}px`,
        top: `${window.scrollY + rect.bottom + 8}px`,
        bottom: 'auto',
        right: 'auto'
      });
    }

    window.addEventListener('mouseover', onMouseOver, true);
    window.addEventListener('click', onClick, true);
  }

  function removePreview() {
    if (hostDiv && hostDiv.shadowRoot) {
      hostDiv.remove();
      hostDiv = null;
    }
    hostDiv = null;
    currentPreview = null;
  }

  // Listen for messages from extension sidepanel
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === 'SOLA_SHOW_COMPONENT') {
        showComponent(message.component);
        sendResponse({ status: 'ok' });
      } else if (message.type === 'SOLA_REMOVE_PREVIEW') {
        removePreview();
        sendResponse({ status: 'removed' });
      }
      return true;
    });
  }

  // Listen for postMessage from Sola web pages
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SOLA_MOUNT_IN_SITU' && event.data.component) {
      showComponent(event.data.component);
    }
  });
})();
