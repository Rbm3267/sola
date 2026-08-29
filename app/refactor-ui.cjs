const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    replacements.forEach(([regex, replacer]) => {
        content = content.replace(regex, replacer);
    });
    fs.writeFileSync(filePath, content, 'utf8');
}

// 1. Primitive Replacements & Import Injections
const componentPaths = [
    'src/lib/components/Navbar.svelte',
    'src/routes/studio/+page.svelte',
    'src/routes/preview/+page.svelte'
];

componentPaths.forEach(p => {
    let content = fs.readFileSync(path.resolve(p), 'utf8');
    if (!content.includes('import Button from')) {
        content = content.replace(/<script lang="ts">/g, '<script lang="ts">\n  import Button from \'$lib/components/primitives/Button.svelte\';\n  import Badge from \'$lib/components/primitives/Badge.svelte\';');
        fs.writeFileSync(path.resolve(p), content, 'utf8');
    }

    replaceInFile(path.resolve(p), [
        [/<button\b/g, '<Button'],
        [/<\/button>/g, '</Button>'],
        [/<badge\b/gi, '<Badge'],
        [/<\/badge>/gi, '</Badge>']
    ]);
});

// 2. Studio Deep Clean: Frosted Glass & Legibility
replaceInFile(path.resolve('src/routes/studio/+page.svelte'), [
    // Replace harsh opaque backgrounds with frosted glass
    [/dark:bg-\[\#0f172a\]/g, 'dark:bg-white/5'],
    // Fix inspector text contrast
    [/text-amber-950/g, 'text-amber-950 dark:text-amber-400'],
    [/text-slate-500 dark:text-slate-400/g, 'text-slate-500 dark:text-slate-300'],
    [/text-slate-400(?! dark:)/g, 'text-slate-400 dark:text-slate-200']
]);

// 3. Community & Components: Zero Contrast Ratio Issues
const textPages = [
    'src/routes/community/+page.svelte',
    'src/routes/components/+page.svelte'
];
textPages.forEach(p => {
    replaceInFile(path.resolve(p), [
        // Fix dark text on dark backgrounds
        [/text-amber-950(?! dark:)/g, 'text-amber-950 dark:text-amber-400'],
        [/text-amber-900(?! dark:)/g, 'text-amber-900 dark:text-amber-300'],
        // Fix white text on amber button issue
        [/text-slate-950 dark:text-white/g, 'text-slate-950'] 
    ]);
});

console.log("Refactoring complete.");
