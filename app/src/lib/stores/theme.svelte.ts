export class ThemeState {
  isDark = $state(false);

  init() {
    if (typeof document !== 'undefined') {
      const saved = localStorage.getItem('sola_theme');
      if (saved) {
        this.isDark = saved === 'dark';
      } else {
        // Light mode default for Sola
        this.isDark = false; 
      }
      this.applyTheme();
    }
  }

  toggle() {
    this.isDark = !this.isDark;
    this.applyTheme();
    if (typeof document !== 'undefined') {
      localStorage.setItem('sola_theme', this.isDark ? 'dark' : 'light');
    }
  }

  applyTheme() {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      // Two markers, deliberately. `.dark` is what the utility classes key off.
      // `data-theme` is what the design tokens and compiled .sola components
      // key off, and it must be set for BOTH states: without an explicit
      // "light" the tokens fall back to `prefers-color-scheme`, so a visitor on
      // a dark OS viewing the site in light mode got light page chrome with
      // dark token values — white text on white cards.
      root.classList.toggle('dark', this.isDark);
      root.dataset.theme = this.isDark ? 'dark' : 'light';
    }
  }
}

export const theme = new ThemeState();
