import { defineConfig } from 'vite';
import solaPlugin from 'vite-plugin-sola';

export default defineConfig({
  plugins: [solaPlugin.default ? solaPlugin.default() : solaPlugin()]
});

