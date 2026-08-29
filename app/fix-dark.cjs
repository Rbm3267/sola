const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.svelte')) {
      let code = fs.readFileSync(fullPath, 'utf-8');
      
      const regexWhite = /class=[\"']([^\"']*?\bbg-white\b[^\"']*?)[\"']/g;
      code = code.replace(regexWhite, (match, p1) => {
        if (!p1.includes('dark:bg-')) {
          return 'class=\"' + p1 + ' dark:bg-[#0f172a]\"';
        }
        return match;
      });

      const regexSlate900 = /class=[\"']([^\"']*?\btext-slate-900\b[^\"']*?)[\"']/g;
      code = code.replace(regexSlate900, (match, p1) => {
        if (!p1.includes('dark:text-')) {
          return 'class=\"' + p1 + ' dark:text-slate-100\"';
        }
        return match;
      });

      const regexSlate50 = /class=[\"']([^\"']*?\bbg-slate-50\b[^\"']*?)[\"']/g;
      code = code.replace(regexSlate50, (match, p1) => {
        if (!p1.includes('dark:bg-')) {
          return 'class=\"' + p1 + ' dark:bg-[#090d19]\"';
        }
        return match;
      });

      const regexSlate800 = /class=[\"']([^\"']*?\btext-slate-800\b[^\"']*?)[\"']/g;
      code = code.replace(regexSlate800, (match, p1) => {
        if (!p1.includes('dark:text-')) {
          return 'class=\"' + p1 + ' dark:text-slate-200\"';
        }
        return match;
      });

      const regexBorder200 = /class=[\"']([^\"']*?\bborder-slate-200\b[^\"']*?)[\"']/g;
      code = code.replace(regexBorder200, (match, p1) => {
        if (!p1.includes('dark:border-')) {
          return 'class=\"' + p1 + ' dark:border-white/5\"';
        }
        return match;
      });

      fs.writeFileSync(fullPath, code);
    }
  }
}

processDir('src/lib/components');
processDir('src/routes');
console.log('Fixed ALL naked light-mode classes');
