import type { IncomingMessage, ServerResponse } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

export const config = {
  runtime: 'nodejs',
};

export default function handler(
  req: IncomingMessage,
  res: ServerResponse,
): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }

  try {
    const filePath = path.join(process.cwd(), 'public', 'data', 'catalogo.json');
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      res.statusCode = 200;
      res.end(data);
    } else {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: 'Catálogo não encontrado' }));
    }
  } catch (err: any) {
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Erro ao carregar catálogo', details: err?.message }));
  }
}
