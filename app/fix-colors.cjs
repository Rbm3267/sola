const fs = require('fs');

const navbarPath = 'src/lib/components/Navbar.svelte';
let code = fs.readFileSync(navbarPath, 'utf8');

// Fix desktop links
code = code.replace(/text-amber-950/g, 'text-amber-950 dark:text-amber-400');
code = code.replace(/text-emerald-950/g, 'text-emerald-950 dark:text-emerald-400');
code = code.replace(/text-violet-950/g, 'text-violet-950 dark:text-violet-400');
code = code.replace(/text-slate-600  hover:text-slate-900/g, 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200');

// Fix mobile drawer background
code = code.replace(/text-slate-700  hover:bg-slate-50/g, 'text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-white/5');

// Fix some duplicated dark classes
code = code.replace(/dark:text-white dark:text-white/g, 'dark:text-white');
code = code.replace(/dark:bg-white\/\[0\.04\] dark:bg-white\/\[0\.04\]/g, 'dark:bg-white/[0.04]');
code = code.replace(/dark:bg-white\/\[0\.02\] dark:bg-white\/\[0\.02\]/g, 'dark:bg-white/[0.02]');
code = code.replace(/dark:border-white\/\[0\.04\] dark:border-white\/\[0\.04\]/g, 'dark:border-white/[0.04]');

fs.writeFileSync(navbarPath, code);

// Now for Studio
const studioPath = 'src/routes/studio/+page.svelte';
let studio = fs.readFileSync(studioPath, 'utf8');
studio = studio.replace(/bg-\[#11312c\]/g, 'bg-[#090d19]'); // If it has that green
// Fix white cards in Studio
studio = studio.replace(/bg-white rounded-3xl/g, 'bg-white dark:bg-[#0f172a] rounded-3xl');
// The drag/drop cards
studio = studio.replace(/bg-white/g, 'bg-white dark:bg-[#0f172a]');
// Just to be safe, clean up duplicated
studio = studio.replace(/dark:bg-\[#0f172a\] dark:bg-\[#0f172a\]/g, 'dark:bg-[#0f172a]');

fs.writeFileSync(studioPath, studio);

// Also components page
const compPath = 'src/routes/components/+page.svelte';
let comp = fs.readFileSync(compPath, 'utf8');
comp = comp.replace(/text-rose-700/g, 'text-rose-700 dark:text-rose-400');
comp = comp.replace(/text-emerald-700/g, 'text-emerald-700 dark:text-emerald-400');
comp = comp.replace(/text-sky-700/g, 'text-sky-700 dark:text-sky-400');
comp = comp.replace(/text-amber-700/g, 'text-amber-700 dark:text-amber-400');
comp = comp.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-400');
comp = comp.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-300');
comp = comp.replace(/text-slate-800/g, 'text-slate-800 dark:text-slate-200');
comp = comp.replace(/bg-slate-900/g, 'bg-slate-900 dark:bg-[#090d19]');
fs.writeFileSync(compPath, comp);

// Preview page text
const prevPath = 'src/routes/preview/+page.svelte';
let prev = fs.readFileSync(prevPath, 'utf8');
prev = prev.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-400');
prev = prev.replace(/text-[#475569]/g, 'text-[#475569] dark:text-slate-400');
fs.writeFileSync(prevPath, prev);

console.log('Fixed specific colors');
