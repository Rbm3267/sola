const fs = require('fs');

function softenFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  // Replace stark borders with soft fluid subtle gradients or remove them
  code = code.replace(/border-b border-slate-200 dark:border-white\/\[0\.04\]/g, 'border-b border-slate-900/[0.03] dark:border-white/[0.03]');
  code = code.replace(/border-b border-slate-200\/80 dark:border-white\/5/g, 'border-b border-slate-900/[0.03] dark:border-white/[0.03]');
  code = code.replace(/border-t border-slate-200 dark:border-white\/10/g, 'border-t border-slate-900/[0.03] dark:border-white/[0.03]');
  code = code.replace(/border-t border-slate-200\/80 dark:border-white\/5/g, 'border-t border-slate-900/[0.03] dark:border-white/[0.03]');
  code = code.replace(/border-b border-slate-200\/80/g, 'border-b border-slate-900/[0.03]');
  code = code.replace(/border-t border-slate-200/g, 'border-t border-slate-900/[0.03]');

  fs.writeFileSync(filePath, code);
}

softenFile('src/routes/community/+page.svelte');
softenFile('src/routes/components/+page.svelte');
softenFile('src/routes/preview/+page.svelte');
softenFile('src/routes/privacy/+page.svelte');
softenFile('src/routes/docs/+page.svelte');
softenFile('src/routes/demo/+page.svelte');

console.log('Soften borders complete.');
