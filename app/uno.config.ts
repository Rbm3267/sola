import { defineConfig, presetUno, presetIcons } from 'unocss'
import extractorSvelte from '@unocss/extractor-svelte'

export default defineConfig({
  extractors: [
    extractorSvelte()
  ],
  presets: [
    presetUno(),
    presetIcons()
  ],
  theme: {
    colors: {
      brand: {
        bg: 'var(--brand-bg, #090d19)',
        card: 'var(--brand-card, rgba(255, 255, 255, 0.05))',
        border: 'var(--brand-border, rgba(255, 255, 255, 0.1))',
        accent: 'var(--brand-accent, #10b981)',
        'accent-fg': 'var(--brand-accent-fg, #022c22)',
        text: 'var(--brand-text, #f8fafc)',
        muted: 'var(--brand-muted, #94a3b8)'
      }
    }
  }
})
