const fs = require('fs');

function fixComponentsPage() {
  const compPath = 'src/routes/components/+page.svelte';
  let comp = fs.readFileSync(compPath, 'utf8');
  
  // Fix selected sidebar item text
  comp = comp.replace(/text-amber-950/g, 'text-amber-950 dark:text-amber-400');
  comp = comp.replace(/text-amber-900/g, 'text-amber-900 dark:text-amber-300');
  comp = comp.replace(/text-emerald-800/g, 'text-emerald-800 dark:text-emerald-300');
  comp = comp.replace(/text-slate-800 dark:text-slate-200/g, 'text-slate-800 dark:text-slate-300'); // make sure normal is light enough
  
  // Fix the View Mode Switcher
  comp = comp.replace(/'bg-white text-slate-900 shadow-sm'/g, "'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'");
  comp = comp.replace(/bg-slate-100\/90/g, 'bg-slate-100/90 dark:bg-slate-800/90');
  
  fs.writeFileSync(compPath, comp);
}

function fixStudioPage() {
  const studioPath = 'src/routes/studio/+page.svelte';
  let studio = fs.readFileSync(studioPath, 'utf8');
  
  // The dark mode green background has been removed, but let's ensure text isn't black
  studio = studio.replace(/text-slate-900/g, 'text-slate-900 dark:text-slate-100');
  studio = studio.replace(/text-slate-800/g, 'text-slate-800 dark:text-slate-200');
  studio = studio.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-300');
  studio = studio.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-400');
  studio = studio.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-400');
  
  // Ensure the Studio layout sidebar isn't pure white in dark mode (if we missed it)
  studio = studio.replace(/bg-white rounded-3xl/g, 'bg-white dark:bg-[#0f172a] rounded-3xl');

  // Let's remove double dark tags that got created
  studio = studio.replace(/dark:text-slate-100 dark:text-slate-100/g, 'dark:text-slate-100');
  studio = studio.replace(/dark:text-slate-200 dark:text-slate-200/g, 'dark:text-slate-200');
  studio = studio.replace(/dark:text-slate-300 dark:text-slate-300/g, 'dark:text-slate-300');
  studio = studio.replace(/dark:text-slate-400 dark:text-slate-400/g, 'dark:text-slate-400');
  studio = studio.replace(/dark:bg-\[#090d19\] dark:bg-\[#090d19\]/g, 'dark:bg-[#090d19]');
  studio = studio.replace(/dark:bg-\[#0f172a\] dark:bg-\[#0f172a\]/g, 'dark:bg-[#0f172a]');

  fs.writeFileSync(studioPath, studio);
}

fixComponentsPage();
fixStudioPage();
console.log('Fixed Studio and Components legibility');
