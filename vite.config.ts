import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

function persistentDbPlugin(): Plugin {
  const dataDir = path.resolve(import.meta.dirname, '.db');
  const dbFilePath = path.resolve(dataDir, 'db_backup.json');

  return {
    name: 'persistent-db-plugin',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/db-save' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => { body += chunk.toString(); });
          req.on('end', () => {
            try {
              if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
              }
              const parsed = JSON.parse(body);
              fs.writeFileSync(dbFilePath, JSON.stringify(parsed, null, 2), 'utf-8');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ success: true, message: 'Database saved to disk!' }));
            } catch (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Failed to write DB file' }));
            }
          });
          return;
        }

        if (req.url === '/api/db-load' && req.method === 'GET') {
          if (fs.existsSync(dbFilePath)) {
            try {
              const content = fs.readFileSync(dbFilePath, 'utf-8');
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(content);
              return;
            } catch {
              // fallback
            }
          }
          res.statusCode = 404;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'File not found' }));
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    persistentDbPlugin()
  ],
  server: {
    watch: {
      ignored: ['**/.db/**', '**/db_backup.json', '**/src/data/**']
    }
  }
});
