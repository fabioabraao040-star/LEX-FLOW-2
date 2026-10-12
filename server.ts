/**
 * LEX FLOW — Full-Stack Server Entry Point
 * Executa o backend Express com as rotas /api/* e monta o middleware do Vite
 */

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { apiRouter } from './server/routes';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Rotas da API RESTful do SaaS
  app.use('/api', apiRouter);

  // Status de saúde
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'lex-flow-backend', timestamp: new Date().toISOString() });
  });

  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Modo de Desenvolvimento com Vite SPA middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Modo de Produção
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Lex Flow] Servidor SaaS operacional na porta ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Lex Flow] Erro fatal ao iniciar o servidor:', err);
  process.exit(1);
});
