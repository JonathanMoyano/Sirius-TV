import type { IncomingMessage, ServerResponse } from 'node:http';

export const config = {
  runtime: 'nodejs',
  maxDuration: 60,
};

const FENIX_BASE = 'https://fenixflix.fenixhub.online';
const MAGNET_BASE = 'https://magnetflix.flixbr.online';
const HOLLY_BASE = 'https://embedplayer2.xyz';
const REDEFLIX_BASE = 'https://redeflixapi.bar';
const AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function checkUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': AGENT },
      signal: AbortSignal.timeout(3000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.writeHead(204, CORS_HEADERS);
    res.end();
    return;
  }

  const host = req.headers.host ?? 'localhost';
  const proto = (req.headers['x-forwarded-proto'] as string | undefined) ?? 'https';
  const currentUrl = new URL(req.url ?? '/', `${proto}://${host}`);

  const tipo = currentUrl.searchParams.get('tipo') ?? 'movie';
  const id = currentUrl.searchParams.get('id') ?? '';
  const season = currentUrl.searchParams.get('s') ?? '1';
  const episode = currentUrl.searchParams.get('e') ?? '1';
  const versao = currentUrl.searchParams.get('versao') ?? 'dub';
  const isJson = currentUrl.searchParams.get('json') === '1';

  if (!id) {
    res.writeHead(400, { 'Content-Type': 'application/json', ...CORS_HEADERS });
    res.end(JSON.stringify({ error: 'Parâmetro id é obrigatório (TMDB ID)' }));
    return;
  }

  // URLs to query from public Stremio addons & providers
  const isSeries = tipo === 'series' || tipo === 'tv' || tipo === 'dorama';
  const fenixEndpoint = isSeries
    ? `${FENIX_BASE}/stream/series/${id}:${season}:${episode}.json`
    : `${FENIX_BASE}/stream/movie/${id}.json`;

  const magnetEndpoint = isSeries
    ? `${MAGNET_BASE}/stream/series/${id}:${season}:${episode}.json`
    : `${MAGNET_BASE}/stream/movie/${id}.json`;

  let streamUrl: string | null = null;
  const candidates: string[] = [];

  // Try FenixFlix & MagnetFlix
  try {
    const [fenixResp, magnetResp] = await Promise.allSettled([
      fetch(fenixEndpoint, { headers: { 'User-Agent': AGENT }, signal: AbortSignal.timeout(4000) }),
      fetch(magnetEndpoint, { headers: { 'User-Agent': AGENT }, signal: AbortSignal.timeout(4000) }),
    ]);

    if (fenixResp.status === 'fulfilled' && fenixResp.value.ok) {
      const data: any = await fenixResp.value.json();
      if (Array.isArray(data?.streams)) {
        for (const st of data.streams) {
          if (st.url) candidates.push(st.url);
        }
      }
    }

    if (magnetResp.status === 'fulfilled' && magnetResp.value.ok) {
      const data: any = await magnetResp.value.json();
      if (Array.isArray(data?.streams)) {
        for (const st of data.streams) {
          if (st.url && !candidates.includes(st.url)) candidates.push(st.url);
        }
      }
    }
  } catch {
    // Continue with fallbacks
  }

  // Filter candidates by version preference (dublado vs legendado)
  if (candidates.length > 0) {
    streamUrl = candidates[0];
  }

  // Fallback to Embeds if no direct stream is returned
  if (!streamUrl) {
    if (isSeries) {
      streamUrl = `https://vidsrc.to/embed/tv/${id}/${season}/${episode}`;
    } else {
      streamUrl = `https://vidsrc.to/embed/movie/${id}`;
    }
  }

  if (isJson) {
    res.writeHead(200, { 'Content-Type': 'application/json', ...CORS_HEADERS });
    res.end(
      JSON.stringify({
        url: streamUrl,
        tipo,
        id,
        season: isSeries ? season : undefined,
        episode: isSeries ? episode : undefined,
        candidatesCount: candidates.length,
      })
    );
    return;
  }

  // 302 Redirect to the resolved stream
  res.writeHead(302, {
    Location: streamUrl,
    'Cache-Control': 'public, max-age=600',
    ...CORS_HEADERS,
  });
  res.end();
}
