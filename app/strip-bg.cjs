const fs = require('fs');

function stripBgFrom(pathStr) {
  if (fs.existsSync(pathStr)) {
    let code = fs.readFileSync(pathStr, 'utf8');
    code = code.replace(/class=\"min-h-screen[^\"]*\"/, 'class=\"flex flex-col w-full\"');
    fs.writeFileSync(pathStr, code);
  }
}

stripBgFrom('src/routes/+page.svelte');
stripBgFrom('src/routes/community/+page.svelte');
stripBgFrom('src/routes/components/+page.svelte');
stripBgFrom('src/routes/demo/+page.svelte');
stripBgFrom('src/routes/docs/+page.svelte');
stripBgFrom('src/routes/preview/+page.svelte');
stripBgFrom('src/routes/privacy/+page.svelte');
stripBgFrom('src/routes/studio/+page.svelte');

// Update +layout.svelte
let layout = fs.readFileSync('src/routes/+layout.svelte', 'utf8');
if (!layout.includes('min-h-screen')) {
  layout = layout.replace('{@render children()}', '<div class="min-h-screen flex flex-col w-full transition-colors duration-200">\n\t{@render children()}\n</div>');
  fs.writeFileSync('src/routes/+layout.svelte', layout);
}

console.log('Stripped local min-h-screen and updated layout');
