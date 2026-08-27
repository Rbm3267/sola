import chroma from 'chroma-js';

// Handle CJS default import in Vite
const chromaFn = typeof chroma === 'function' ? chroma : (chroma as any).default;

export const themeState = $state({
    primary: '#10b981', // Default Cyber-Fitness Emerald
});

export function updateTheme(primaryHex: string) {
    themeState.primary = primaryHex;

    // 1. Calculate ideal background color based on primary
    const isLight = chromaFn(primaryHex).luminance() > 0.5;
    
    const bgHex = chromaFn(primaryHex).set('hsl.l', 0.05).set('hsl.s', 0.5).hex();
    
    // Create card background (slightly lighter than bg)
    const cardHex = chromaFn(bgHex).brighten(0.3).alpha(0.6).css(); // Semi-transparent for frosted glass
    
    // Border color
    const borderHex = chromaFn(primaryHex).alpha(0.2).css();
    
    // Ensure text contrasts with the background
    const bgLuminance = chromaFn(bgHex).luminance();
    const textHex = bgLuminance > 0.5 ? '#0f172a' : '#f8fafc';
    const mutedHex = bgLuminance > 0.5 ? '#64748b' : '#94a3b8';
    
    // Ensure primary accent contrasts with the background (WCAG AA check)
    let safeAccent = primaryHex;
    if (chromaFn.contrast(safeAccent, bgHex) < 4.5) {
        if (bgLuminance < 0.5) {
            while (chromaFn.contrast(safeAccent, bgHex) < 4.5 && chromaFn(safeAccent).luminance() < 1) {
                safeAccent = chromaFn(safeAccent).brighten(0.1).hex();
            }
        } else {
            while (chromaFn.contrast(safeAccent, bgHex) < 4.5 && chromaFn(safeAccent).luminance() > 0) {
                safeAccent = chromaFn(safeAccent).darken(0.1).hex();
            }
        }
    }
    
    // Ensure text inside primary accent buttons is readable
    const accentFgHex = chromaFn(safeAccent).luminance() > 0.5 ? '#022c22' : '#ffffff';

    // Inject CSS variables into the root
    if (typeof document !== 'undefined') {
        const root = document.documentElement;
        root.style.setProperty('--brand-bg', bgHex);
        root.style.setProperty('--brand-card', cardHex);
        root.style.setProperty('--brand-border', borderHex);
        root.style.setProperty('--brand-accent', safeAccent);
        root.style.setProperty('--brand-accent-fg', accentFgHex);
        root.style.setProperty('--brand-text', textHex);
        root.style.setProperty('--brand-muted', mutedHex);
    }
}
