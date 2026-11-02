import type { IncomingMessage, ServerResponse } from 'node:http';

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Range, Content-Type, Authorization, X-Requested-With',
};

function rewriteM3u8(
  m3u8Text: string,
  manifestUrl: string,
  proxyOrigin: string,
  referer: string | null,
  ua: string | null,
): string {
  const baseDir = manifestUrl.split('?')[0].substring(0, manifestUrl.split('?')[0].lastIndexOf('/') + 1);
  const lines = m3u8Text.split('\n');
  const out: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      out.push(lines[i]);
      continue;
    }

    if (line.startsWith('#EXT-X-KEY')) {
      const replaced = line.replace(/URI="([^"]+)"/, (_, uri) => {
        const absolute = uri.startsWith('http') ? uri : `${baseDir}${uri}`;
        return `URI="${proxyOrigin}/api/proxy?url=${encodeURIComponent(absolute)}${referer ? `&referer=${encodeURIComponent(referer)}` : ''}"`;
      });
      out.push(replaced);
      continue;
    }

    if (line.startsWith('#')) {
      out.push(line);
      continue;
    }

    const absolute = line.startsWith('http') ? line : `${baseDir}${line}`;
    out.push(
      `${proxyOrigin}/api/proxy?url=${encodeURIComponent(absolute)}${referer ? `&referer=${encodeURIComponent(referer)}` : ''}${ua ? `&ua=${encodeURIComponent(ua)}` : ''}`
    );
  }

  return out.join('\n');
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const host = req.headers.host ?? 'localhost';
  const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https';
  const currentUrl = new URL(req.url ?? '/', `${proto}://${host}`);
  const targetUrl = currentUrl.searchParams.get('url');

  if (!targetUrl) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...CORS_HEADERS });
    res.end(JSON.stringify({ error: 'Parâmetro url é obrigatório' }));
    return;
  }

  const referer = currentUrl.searchParams.get('referer');
  const ua = currentUrl.searchParams.get('ua') || DEFAULT_UA;

  try {
    const headers: Record<string, string> = {
      'User-Agent': ua,
    };
    if (referer) headers['Referer'] = referer;
    if (req.headers.range) headers['Range'] = String(req.headers.range);

    const upstreamResponse = await fetch(targetUrl, {
      method: req.method ?? 'GET',
      headers,
    });

    const isM3u =
      targetUrl.includes('.m3u8') ||
      targetUrl.toLowerCase().split('?')[0].endsWith('.txt') ||
      (upstreamResponse.headers.get('content-type') || '').includes('mpegurl');

    if (isM3u) {
      const text = await upstreamResponse.text();
      const rewritten = rewriteM3u8(
        text,
        targetUrl,
        `${proto}://${host}`,
        referer || `${new URL(targetUrl).origin}/`,
        ua
      );
      res.writeHead(upstreamResponse.status, {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Cache-Control': 'no-store',
        ...CORS_HEADERS,
      });
      res.end(rewritten);
      return;
    }

    // Proxy media segments
    const outHeaders: Record<string, string> = {
      ...CORS_HEADERS,
      'Cache-Control': 'public, max-age=3600',
    };
    const cType = upstreamResponse.headers.get('content-type');
    const cLen = upstreamResponse.headers.get('content-length');
    const cRange = upstreamResponse.headers.get('content-range');

    if (cType) outHeaders['Content-Type'] = cType;
    if (cLen) outHeaders['Content-Length'] = cLen;
    if (cRange) outHeaders['Content-Range'] = cRange;

    res.writeHead(upstreamResponse.status, outHeaders);

    if (upstreamResponse.body) {
      const reader = upstreamResponse.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }
    res.end();
  } catch (err: any) {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'application/json', ...CORS_HEADERS });
    }
    res.end(JSON.stringify({ error: 'Erro no proxy de vídeo', details: err?.message || String(err) }));
  }
}

