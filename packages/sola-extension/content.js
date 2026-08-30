// Sola UI — Content Script (Live Page Component Preview)

(function () {
  if (window.__SOLA_INITIALIZED__) return;
  window.__SOLA_INITIALIZED__ = true;

  let currentPreview = null;
  let hostDiv = null;

  // Component preview definitions — each renders a self-contained HTML preview
  const COMPONENTS = {
    datacard: {
      title: 'DataCard',
      code: `import { DataCard } from '@sola/ui';`,
      render: () => `
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;width:260px;">
          <div style="font-size:11px;color:#64748b;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Monthly Revenue</div>
          <div style="font-size:28px;font-weight:800;color:#fff;margin:8px 0 4px;">$84,230</div>
          <div style="display:flex;align-items:center;gap:6px;font-size:11px;">
            <span style="color:#10b981;font-weight:600;">+12.4%</span>
            <span style="color:#64748b;">vs last month</span>
          </div>
          <div style="margin-top:12px;height:32px;display:flex;align-items:end;gap:2px;">
            ${[30,45,35,55,40,65,50,70,60,80,75,90].map(h => `<div style="flex:1;background:rgba(16,185,129,0.3);height:${h}%;border-radius:2px;"></div>`).join('')}
          </div>
        </div>`
    },
    gauge: {
      title: 'GaugeCard',
      code: `import { GaugeCard } from '@sola/ui';`,
      render: () => `
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;width:200px;text-align:center;">
          <svg width="120" height="70" viewBox="0 0 120 70">
            <path d="M 10 65 A 50 50 0 0 1 110 65" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="8" stroke-linecap="round"/>
            <path d="M 10 65 A 50 50 0 0 1 92 25" fill="none" stroke="#10b981" stroke-width="8" stroke-linecap="round"/>
          </svg>
          <div style="font-size:24px;font-weight:800;color:#fff;margin-top:4px;">78%</div>
          <div style="font-size:11px;color:#64748b;margin-top:2px;">System Health</div>
        </div>`
    },
    waterfall: {
      title: 'FlowWaterfall',
      code: `import { FlowWaterfall } from '@sola/ui';`,
      render: () => `
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;width:280px;">
          <div style="font-size:11px;color:#64748b;font-weight:600;margin-bottom:12px;">REVENUE BRIDGE</div>
          <div style="display:flex;align-items:end;gap:4px;height:100px;">
            <div style="flex:1;text-align:center;">
              <div style="background:#3b82f6;height:80px;border-radius:4px;"></div>
              <div style="font-size:9px;color:#64748b;margin-top:4px;">Start</div>
            </div>
            <div style="flex:1;text-align:center;">
              <div style="background:#10b981;height:30px;border-radius:4px;margin-top:50px;"></div>
              <div style="font-size:9px;color:#64748b;margin-top:4px;">New</div>
            </div>
            <div style="flex:1;text-align:center;">
              <div style="background:#10b981;height:20px;border-radius:4px;margin-top:60px;"></div>
              <div style="font-size:9px;color:#64748b;margin-top:4px;">Expand</div>
            </div>
            <div style="flex:1;text-align:center;">
              <div style="background:#ef4444;height:15px;border-radius:4px;margin-top:65px;"></div>
              <div style="font-size:9px;color:#64748b;margin-top:4px;">Churn</div>
            </div>
            <div style="flex:1;text-align:center;">
              <div style="background:#8b5cf6;height:95px;border-radius:4px;"></div>
              <div style="font-size:9px;color:#64748b;margin-top:4px;">End</div>
            </div>
          </div>
        </div>`
    },
    dial: {
      title: 'TactileDial',
      code: `import { TactileDialCard } from '@sola/ui';`,
      render: () => `
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;width:200px;text-align:center;">
          <div style="font-size:11px;color:#64748b;font-weight:600;margin-bottom:10px;">CAPACITY</div>
          <svg width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="6"/>
            <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" stroke-width="6" stroke-dasharray="188 63" stroke-linecap="round" transform="rotate(-90 50 50)"/>
            <circle cx="50" cy="50" r="4" fill="#10b981"/>
            <line x1="50" y1="50" x2="50" y2="18" stroke="#10b981" stroke-width="2" stroke-linecap="round" transform="rotate(110 50 50)"/>
          </svg>
          <div style="font-size:20px;font-weight:800;color:#fff;margin-top:6px;">74%</div>
        </div>`
    },
    toggle: {
      title: 'Toggle Switch',
      code: `import { ToggleSwitch } from '@sola/ui';`,
      render: () => `
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;width:240px;display:flex;flex-direction:column;gap:12px;">
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:#fff;font-weight:500;">Dark Mode</span>
            <div style="width:36px;height:20px;background:#10b981;border-radius:10px;position:relative;cursor:pointer;">
              <div style="width:16px;height:16px;background:#fff;border-radius:50%;position:absolute;top:2px;right:2px;"></div>
            </div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:12px;color:#fff;font-weight:500;">Notifications</span>
            <div style="width:36px;height:20px;background:#334155;border-radius:10px;position:relative;cursor:pointer;">
              <div style="width:16px;height:16px;background:#94a3b8;border-radius:50%;position:absolute;top:2px;left:2px;"></div>
            </div>
          </div>
        </div>`
    },
    slider: {
      title: 'Range Slider',
      code: `import { RangeSlider } from '@sola/ui';`,
      render: () => `
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;width:260px;">
          <div style="display:flex;justify-content:space-between;font-size:11px;color:#64748b;margin-bottom:8px;">
            <span>Price Range</span><span style="color:#10b981;font-weight:600;">$200 — $800</span>
          </div>
          <div style="position:relative;height:6px;background:#1e293b;border-radius:3px;margin:12px 0;">
            <div style="position:absolute;left:20%;right:25%;height:100%;background:#10b981;border-radius:3px;"></div>
            <div style="position:absolute;left:20%;top:-5px;width:16px;height:16px;background:#fff;border-radius:50%;border:2px solid #10b981;transform:translateX(-50%);"></div>
            <div style="position:absolute;right:25%;top:-5px;width:16px;height:16px;background:#fff;border-radius:50%;border:2px solid #10b981;transform:translateX(50%);"></div>
          </div>
        </div>`
    },
    listblock: {
      title: 'ListBlock',
      code: `import { ListBlock } from '@sola/ui';`,
      render: () => `
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:16px;width:260px;">
          <div style="font-size:11px;color:#64748b;font-weight:600;margin-bottom:10px;">RECENT ACTIVITY</div>
          ${['Deploy v2.4.1 to production', 'Schema migration completed', 'Alert: CPU > 90% threshold', 'New team member onboarded'].map((item, i) => `
            <div style="display:flex;align-items:center;gap:8px;padding:8px 0;${i < 3 ? 'border-bottom:1px solid rgba(255,255,255,0.05);' : ''}">
              <div style="width:6px;height:6px;border-radius:50%;background:${['#10b981','#3b82f6','#ef4444','#8b5cf6'][i]};flex-shrink:0;"></div>
              <span style="font-size:11px;color:#cbd5e1;">${item}</span>
            </div>
          `).join('')}
        </div>`
    },
    stream: {
      title: 'StreamView',
      code: `import { StreamView } from '@sola/ui';`,
      render: () => `
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:16px;width:280px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <span style="font-size:11px;color:#64748b;font-weight:600;">LIVE EVENTS</span>
            <span style="width:6px;height:6px;border-radius:50%;background:#10b981;animation:pulse 2s infinite;"></span>
          </div>
          ${['[INFO] Signal mesh connected', '[OK] Component hydrated in 0.3ms', '[WARN] Stale cache invalidated', '[INFO] WebSocket heartbeat OK'].map(msg => `
            <div style="font-family:monospace;font-size:10px;color:#94a3b8;padding:4px 0;border-bottom:1px solid rgba(255,255,255,0.03);">${msg}</div>
          `).join('')}
        </div>`
    },
    sentinel: {
      title: 'SentinelCapsule',
      code: `import { SentinelCapsule } from '@sola/ui';`,
      render: () => `
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:16px;width:240px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
            <div style="width:10px;height:10px;border-radius:50%;background:#10b981;box-shadow:0 0 8px rgba(16,185,129,0.4);"></div>
            <span style="font-size:12px;font-weight:700;color:#fff;">System Healthy</span>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
            <div style="background:#1e293b;padding:8px;border-radius:8px;text-align:center;">
              <div style="font-size:16px;font-weight:800;color:#10b981;">99.9%</div>
              <div style="font-size:9px;color:#64748b;">Uptime</div>
            </div>
            <div style="background:#1e293b;padding:8px;border-radius:8px;text-align:center;">
              <div style="font-size:16px;font-weight:800;color:#3b82f6;">12ms</div>
              <div style="font-size:9px;color:#64748b;">Latency</div>
            </div>
          </div>
        </div>`
    },
    button: {
      title: 'Button',
      code: `import { SolaButton } from '@sola/ui';`,
      render: () => `
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;width:260px;display:flex;flex-wrap:wrap;gap:8px;">
          <button style="background:#10b981;color:#090d19;border:none;border-radius:10px;padding:8px 16px;font-weight:700;font-size:12px;cursor:pointer;">Primary</button>
          <button style="background:rgba(255,255,255,0.1);color:#f8fafc;border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:8px 16px;font-weight:600;font-size:12px;cursor:pointer;">Secondary</button>
          <button style="background:transparent;color:#94a3b8;border:none;border-radius:10px;padding:8px 16px;font-weight:600;font-size:12px;cursor:pointer;">Ghost</button>
          <button style="background:#ef4444;color:#fff;border:none;border-radius:10px;padding:8px 16px;font-weight:700;font-size:12px;cursor:pointer;">Destructive</button>
        </div>`
    },
    tabs: {
      title: 'Tabs',
      code: `import { SolaTabs } from '@sola/ui';`,
      render: () => `
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:16px;width:260px;">
          <div style="display:inline-flex;background:rgba(255,255,255,0.05);border-radius:10px;padding:3px;gap:2px;margin-bottom:12px;">
            <div style="padding:6px 14px;background:#10b981;color:#090d19;border-radius:8px;font-size:11px;font-weight:700;">Overview</div>
            <div style="padding:6px 14px;color:#64748b;font-size:11px;font-weight:600;">Analytics</div>
            <div style="padding:6px 14px;color:#64748b;font-size:11px;font-weight:600;">Settings</div>
          </div>
          <div style="font-size:11px;color:#94a3b8;line-height:1.5;">Tab content renders here based on the active selection.</div>
        </div>`
    },
    avatar: {
      title: 'Avatar',
      code: `import { SolaAvatar } from '@sola/ui';`,
      render: () => `
        <div style="background:#0f172a;border:1px solid rgba(255,255,255,0.1);border-radius:16px;padding:20px;width:260px;display:flex;align-items:center;gap:12px;">
          <div style="position:relative;">
            <div style="width:40px;height:40px;border-radius:50%;background:#3b82f6;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;">JD</div>
            <div style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:#10b981;border:2px solid #0f172a;"></div>
          </div>
          <div style="position:relative;">
            <div style="width:40px;height:40px;border-radius:50%;background:#8b5cf6;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;">AK</div>
            <div style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:#ef4444;border:2px solid #0f172a;"></div>
          </div>
          <div style="position:relative;">
            <div style="width:40px;height:40px;border-radius:50%;background:#f59e0b;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:14px;color:#fff;">MR</div>
            <div style="position:absolute;bottom:0;right:0;width:10px;height:10px;border-radius:50%;background:#64748b;border:2px solid #0f172a;"></div>
          </div>
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

    const comp = COMPONENTS[componentId];
    if (!comp) return;

    // Remove existing preview
    removePreview();

    const shadow = hostDiv.attachShadow({ mode: 'open' });

    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      @keyframes slideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
      .preview-wrapper {
        animation: slideIn 0.2s ease-out;
      }
      .preview-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }
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
      .close-btn {
        background: none;
        border: none;
        color: #64748b;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        display: flex;
        align-items: center;
      }
      .close-btn:hover { color: #fff; background: rgba(255,255,255,0.1); }
      .code-bar {
        margin-top: 8px;
        background: #030712;
        border: 1px solid rgba(255,255,255,0.06);
        border-radius: 8px;
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
        border: none;
        padding: 3px 8px;
        border-radius: 4px;
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
      <div class="preview-header">
        <span class="preview-label"><span class="preview-dot"></span>Sola Preview</span>
        <button class="close-btn" id="sola-close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      ${comp.render()}
      <div class="code-bar">
        <span>${comp.code}</span>
        <button class="copy-btn" id="sola-copy">Copy</button>
      </div>
    `;
    shadow.appendChild(wrapper);

    const closeBtn = shadow.getElementById('sola-close');
    closeBtn.addEventListener('click', removePreview);

    const copyBtn = shadow.getElementById('sola-copy');
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(comp.code);
      copyBtn.textContent = 'Copied';
      setTimeout(() => copyBtn.textContent = 'Copy', 1500);
    });

    currentPreview = componentId;
  }

  function removePreview() {
    if (hostDiv && hostDiv.shadowRoot) {
      hostDiv.remove();
      hostDiv = null;
    }
    // Reset for new host
    hostDiv = null;
    currentPreview = null;
  }

  // Listen for messages from extension
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

  // Also listen for postMessage from Sola web pages
  window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SOLA_MOUNT_IN_SITU' && event.data.component) {
      showComponent(event.data.component);
    }
  });
})();
