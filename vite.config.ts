import { defineConfig, type Plugin } from 'vite';
import { readFileSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { createHash } from 'node:crypto';

const PICKS = 'scripts/sound-picks.json';

/**
 * Dev-only endpoint behind /voices.html: GET /__sound-picks returns the chosen letter-sound
 * options, POST {id, n} saves one. `npm run voice` builds the letter sounds from these picks.
 */
function soundPicks(): Plugin {
  const read = () => (existsSync(PICKS) ? JSON.parse(readFileSync(PICKS, 'utf8')) : {});
  return {
    name: 'sound-picks',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__sound-picks', (req, res) => {
        if (req.method !== 'POST') {
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(read()));
          return;
        }
        let body = '';
        req.on('data', chunk => { body += chunk; });
        req.on('end', () => {
          try {
            const { id, n } = JSON.parse(body);
            if (!/^[a-z_]{1,4}$/.test(id) || !Number.isInteger(n) || n < 0 || n > 9) throw new Error('bad pick');
            const picks = read();
            picks[id] = n;
            writeFileSync(PICKS, JSON.stringify(picks, Object.keys(picks).sort(), 2) + '\n');
            res.end('ok');
          } catch {
            res.statusCode = 400;
            res.end('bad request');
          }
        });
      });
    },
  };
}

/**
 * Build-only: writes sw.js (from src/sw/sw.js) with this build's files to keep offline: the page,
 * the script and styles, the Latin fonts, the icon and the web manifest.
 */
function serviceWorker(): Plugin {
  return {
    name: 'service-worker',
    apply: 'build',
    generateBundle(_, bundle) {
      const files = Object.keys(bundle).filter(f => /\.(js|css)$/.test(f) || /andika-latin-(400|700)-normal-.*\.woff2$/.test(f));
      const shell = ['/', '/manifest.webmanifest', '/icon.svg', ...files.map(f => '/' + f)];
      const version = createHash('sha1').update(Object.keys(bundle).sort().join()).digest('hex').slice(0, 10);
      const source = readFileSync('src/sw/sw.js', 'utf8').replace('__VERSION__', version).replace('__SHELL__', JSON.stringify(shell));
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

/**
 * Build-only: leaves out the other edition's recordings (see src/edition.ts), both the files copied
 * from public/voice and their entries in the voice manifest the game is built with. Its art and
 * lines are left out by the bundler, since __FAMILY__ is a constant.
 */
function edition(family: boolean): Plugin {
  let drop = new Set<string>();
  let outDir = 'dist';
  const manifest = resolve('src/voice/manifest.json');
  return {
    name: 'edition',
    apply: 'build',
    enforce: 'pre',
    configResolved(config) { outDir = resolve(config.root, config.build.outDir); },
    async buildStart() {
      const { otherEditionClips } = await import('./scripts/voice-plan.mjs');
      drop = new Set(otherEditionClips(family));
    },
    load(id) {
      if (id !== manifest) return null;
      const m = JSON.parse(readFileSync(id, 'utf8'));
      for (const k of drop) delete m.clips[k];
      return JSON.stringify(m);
    },
    closeBundle() {
      for (const k of drop) rmSync(join(outDir, 'voice', k + '.m4a'), { force: true });
    },
  };
}

// Its own port, so it never ends up sharing 5173 with another project's dev server (one on IPv4,
// one on IPv6, each answering "localhost" depending on the browser). strictPort fails loudly instead.
// Which edition to build (see src/edition.ts): EDITION=family for the one played at home.
const FAMILY = process.env.EDITION === 'family';

export default defineConfig({
  define: { __FAMILY__: JSON.stringify(FAMILY) },
  plugins: [soundPicks(), serviceWorker(), edition(FAMILY)],
  server: { port: 5317, strictPort: true },
  preview: { port: 5318, strictPort: true },
});
