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
      document.documentElement.classList.toggle('dark', this.isDark);
    }
  }
}

export const theme = new ThemeState();
