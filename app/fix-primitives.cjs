const fs = require('fs');
let code = fs.readFileSync('src/lib/components/primitives/Button.svelte', 'utf8');

code = code.replace(/className = "",/, 'class: className = "",\n    type = "button",');
code = code.replace(/className\?: string;/, 'class?: string;\n    type?: "button" | "submit" | "reset";');
code = code.replace(/type="button"/, 'type={type}');

fs.writeFileSync('src/lib/components/primitives/Button.svelte', code);

// Same for Badge.svelte, in case it has className
if (fs.existsSync('src/lib/components/primitives/Badge.svelte')) {
    let badgeCode = fs.readFileSync('src/lib/components/primitives/Badge.svelte', 'utf8');
    badgeCode = badgeCode.replace(/className = "",/, 'class: className = "",');
    badgeCode = badgeCode.replace(/className\?: string;/, 'class?: string;');
    fs.writeFileSync('src/lib/components/primitives/Badge.svelte', badgeCode);
}
