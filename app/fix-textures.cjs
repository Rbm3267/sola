const fs = require('fs');

function fixGradients(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');

  code = code.replace(
    /bg-\[radial-gradient\(#[a-f0-9]{6}_1px,transparent_1px\)\]/g,
    'bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)]'
  );
  code = code.replace(
    /opacity-60 pointer-events-none/g,
    'opacity-30 dark:opacity-20 pointer-events-none'
  );
  code = code.replace(
    /opacity-40 pointer-events-none/g,
    'opacity-30 dark:opacity-20 pointer-events-none'
  );
  code = code.replace(
    /opacity-35 pointer-events-none/g,
    'opacity-30 dark:opacity-20 pointer-events-none'
  );

  fs.writeFileSync(filePath, code);
}

fixGradients('src/lib/components/DesignEngineStudio.svelte');
fixGradients('src/routes/components/+page.svelte');
fixGradients('src/routes/demo/+page.svelte');

console.log('Fixed all remaining radial gradient textures.');
