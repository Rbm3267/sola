const fs = require('fs');

// Fix components/+page.svelte syntax error
let compCode = fs.readFileSync('src/routes/components/+page.svelte', 'utf8');
compCode = compCode.replace(/    \}\n\n  const filteredIntegrations/, '\n  const filteredIntegrations');
fs.writeFileSync('src/routes/components/+page.svelte', compCode);

// Fix community/+page.svelte a11y error
let commCode = fs.readFileSync('src/routes/community/+page.svelte', 'utf8');
commCode = commCode.replace(
  '<button onclick={() => activeModalTemplate = null} class="w-8 h-8', 
  '<button aria-label="Close" onclick={() => activeModalTemplate = null} class="w-8 h-8'
);
fs.writeFileSync('src/routes/community/+page.svelte', commCode);
