const fs = require('fs');
let code = fs.readFileSync('src/routes/preview/+page.svelte', 'utf8');

code = code.replace('Download Extension .zip', 'Install Extension');
code = code.replace(
  '<svg class="w-5 h-5 group-hover:-translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>',
  '<svg class="w-5 h-5 group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="21.17" y1="8" x2="12" y2="8"/><line x1="3.95" y1="6.06" x2="8.54" y2="14"/><line x1="10.88" y1="21.94" x2="15.46" y2="14"/></svg>'
);
code = code.replace('Load Unpacked', 'Add to Chrome');
code = code.replace('Go to <code class="font-mono text-[10px] bg-slate-200/50 dark:bg-black/30 px-1 py-0.5 rounded">chrome://extensions</code>, enable Developer Mode, and upload the unzipped folder.', 'Click the button above to securely install the official Sola extension directly from the Chrome Web Store.');

fs.writeFileSync('src/routes/preview/+page.svelte', code);
