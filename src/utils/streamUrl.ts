/**
 * Sirius TV - Stream URL Resolver & Proxy Handler
 * 
 * Manages playback URLs with automatic CORS bypass, proxy fallbacks,
 * and intelligent multi-server recovery.
 */

// Production and development proxy endpoints
const LOCAL_PROXY = '/api/proxy';
const BACKUP_PROXY = 'https://saimo-tv.pages.dev/api/proxy';

/**
 * Checks if URL requires proxy due to mixed content (HTTP on HTTPS)
 * or known CORS restrictive domains.
 */
export function requiresProxy(url: string): boolean {
  if (!url) return false;
  if (typeof window !== 'undefined' && window.location.protocol === 'https:' && url.startsWith('http://')) {
    return true; // Mixed content block prevention
  }
  // Hostnames that restrict direct browser requests without CORS
  const noCorsHosts = [
    'aws.s13-s1001604.lat',
    's13-s1001604.lat',
    'jmp2.uk',
    'dadinhodetapioca.fun',
    'cdn13embed.xyz',
    'faz-o-eli.online',
    'multtv.tv.br'
  ];
  return noCorsHosts.some((host) => url.includes(host));
}

/**
 * Returns proxy URL for a target stream.
 * Prefers local `/api/proxy` on Vercel, falls back to backup proxy in dev/standalone mode.
 */
export function getProxyUrl(targetUrl: string): string {
  const encoded = encodeURIComponent(targetUrl);
  // If running in development (localhost), use backup proxy directly to avoid dev server 404
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return `${BACKUP_PROXY}?url=${encoded}`;
  }
  return `${LOCAL_PROXY}?url=${encoded}`;
}

/**
 * Resolves the best playable stream URL for the current environment.
 */
export function resolvePlayableUrl(rawUrl: string, forceProxy = false): string {
  if (!rawUrl) return '';
  if (forceProxy || requiresProxy(rawUrl)) {
    return getProxyUrl(rawUrl);
  }
  return rawUrl;
}
