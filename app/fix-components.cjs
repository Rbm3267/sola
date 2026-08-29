const fs = require('fs');
let code = fs.readFileSync('src/routes/components/+page.svelte', 'utf8');

// 1. Fix the categories array
const categoriesReplacement = `const categories = [
    'All',
    ...Array.from(new Set(SAAS_ECOSYSTEM.map(item => item.category)))
  ];`;
code = code.replace(/const categories = \[[\s\S]*?\];/, categoriesReplacement);

// 2. Change View on My UI button to Open in Studio
code = code.replace(
  /href=\{'\/preview\?preset=' \+ getPresetForIntegration\(selectedIntegration\) \+ '&component=' \+ getComponentParam\(selectedIntegration\.primaryComponent\)\}/,
  "href='/studio'"
);
code = code.replace(/<span>View on My UI<\/span>/, '<span>Open in Studio</span>');

// 3. 1-Click Embed logic
// Currently "1-Click Embed" just toggles viewMode = 'embed'.
// In embed mode, it shows a code snippet. That's actually correct and works! It shows the snippet to embed the component.

// Remove unused functions
code = code.replace(/function getPresetForIntegration[\s\S]*?\}\n/, '');
code = code.replace(/function getComponentParam[\s\S]*?\}\n/, '');

fs.writeFileSync('src/routes/components/+page.svelte', code);
console.log('Fixed components page');
