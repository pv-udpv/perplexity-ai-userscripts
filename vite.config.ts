import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'scripts/github-auto-approve/index.ts',
      userscript: {
        namespace: 'https://github.com/pv-udpv/perplexity-ai-userscripts',
        match: ['https://www.perplexity.ai/*'],
        grant: ['GM_setValue', 'GM_getValue'],
      },
    }),
  ],
  build: {
    target: 'ES2020',
    minify: false,
    sourcemap: true,
  },
});
