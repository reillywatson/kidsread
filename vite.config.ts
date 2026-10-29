import { defineConfig, type Plugin } from 'vite';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

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

export default defineConfig({ plugins: [soundPicks()] });
