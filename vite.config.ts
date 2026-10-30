import { defineConfig, type Plugin } from 'vite';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
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

// Its own port, so it never ends up sharing 5173 with another project's dev server (one on IPv4,
// one on IPv6, each answering "localhost" depending on the browser). strictPort fails loudly instead.
export default defineConfig({
  plugins: [soundPicks(), serviceWorker()],
  server: { port: 5317, strictPort: true },
  preview: { port: 5318, strictPort: true },
});
