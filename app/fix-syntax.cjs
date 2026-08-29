const fs = require('fs');
let code = fs.readFileSync('src/routes/studio/+page.svelte', 'utf-8');
code = code.replace(/\{card\.cols === 3 \?  dark:bg-\[#0f172a\]"lg:col-span-3 md:col-span-2' : card\.cols === 2 \? 'md:col-span-2' : 'col-span-1'\}/g, "{card.cols === 3 ? 'lg:col-span-3 md:col-span-2' : card.cols === 2 ? 'md:col-span-2' : 'col-span-1'}");
fs.writeFileSync('src/routes/studio/+page.svelte', code);
console.log('Fixed syntax error');
