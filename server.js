import express from 'express';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function createServer() {
  const app = express();

  // Crea el servidor Vite en modo middleware
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  // Usa el middleware de Vite
  app.use(vite.middlewares);

  // Para todas las demás rutas, sirve el archivo index.html
  app.get('*', (req, res) => {
    res.sendFile(resolve(__dirname, 'index.html'));
  });

  // Inicia el servidor
  app.listen(3000, () => {
    console.log('Servidor ejecutándose en http://localhost:3000');
  });
}

createServer().catch((err) => {
  console.error(err);
  process.exit(1);
});
