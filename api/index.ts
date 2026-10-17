/**
 * LEX FLOW — Vercel Serverless Function Entry Point
 * Permite que a API seja implantada no projeto backend da Vercel (lex-flow / lex-flow-steel.vercel.app)
 */

import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from '../server/routes.js';

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Configuração de CORS para permitir requisições de lex-flow-dashboard.vercel.app
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-tenant-id');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Monta rotas da API
app.use('/api', apiRouter);

// Rota raiz e status
app.get('/', (_req, res) => {
  res.json({
    name: 'Lex Flow API Serverless',
    status: 'online',
    version: '2.8.0',
    docs: 'https://lex-flow-dashboard.vercel.app'
  });
});

export default app;
