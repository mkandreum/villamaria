// BCV (Banco Central de Venezuela) USD exchange rate fetcher.
// Parses the official exchange table published daily at bcv.org.ve.

import http from 'node:http';
import https from 'node:https';

const BCV_URL = process.env.BCV_RATE_URL || 'https://www.bcv.org.ve/';
const TIMEOUT_MS = 20000;
const MAX_REDIRECTS = 4;

/** Converts a Spanish-formatted number ("64,95", "1.234,56") to a float. */
export function parseEsNumber(raw: string): number | null {
  let s = String(raw || '').trim().replace(/\s/g, '');
  if (!s) return null;
  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  }
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

/** Extracts the US dollar rate from the BCV homepage HTML. */
export function extractDollarRate(html: string): number | null {
  const marker = 'id="dolar"';
  const idx = html.indexOf(marker);
  const source = idx >= 0 ? html.slice(idx, idx + 12000) : html;

  const match =
    source.match(/<td[^>]*>\s*<strong[^>]*>\s*([\d.,]+)\s*<\/strong>/i) ||
    source.match(/<strong[^>]*>\s*([\d.,]+)\s*<\/strong>/i);

  return match ? parseEsNumber(match[1]) : null;
}

/**
 * Fetches the current BCV USD rate, returning null on failure.
 * BCV's TLS chain is sometimes unreliable for non-browser clients, so we
 * disable certificate verification for this single public endpoint and
 * follow redirects manually (max MAX_REDIRECTS).
 */
export function fetchBcvRate(url: string = BCV_URL, redirects = 0): Promise<number | null> {
  return new Promise((resolve) => {
    let target: URL;
    try {
      target = new URL(url);
    } catch {
      return resolve(null);
    }

    const protocol = target.protocol === 'http:' ? http : https;

    const req = protocol.get(
      {
        hostname: target.hostname,
        port: target.port || undefined,
        path: target.pathname + target.search,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'es-VE,es-ES,es;q=0.9',
        },
        ...(protocol === https
          ? { agent: new https.Agent({ rejectUnauthorized: false }) }
          : {}),
      },
      (res) => {
        if (
          res.statusCode &&
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          res.resume();
          if (redirects >= MAX_REDIRECTS) return resolve(null);
          const nextUrl = new URL(res.headers.location, target).toString();
          return resolve(fetchBcvRate(nextUrl, redirects + 1));
        }

        if (!res.statusCode || res.statusCode >= 400) {
          res.resume();
          return resolve(null);
        }

        const chunks: Buffer[] = [];
        res.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
        res.on('end', () => {
          const html = Buffer.concat(chunks).toString('utf8');
          resolve(extractDollarRate(html));
        });
        res.on('error', () => resolve(null));
      }
    );

    req.setTimeout(TIMEOUT_MS, () => req.destroy(new Error('timeout')));
    req.on('error', () => resolve(null));
  });
}

/** Today's date as YYYY-MM-DD in the Venezuela (America/Caracas) timezone. */
export function venezuelaDateNow(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Caracas',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  } catch {
    return new Date().toISOString().slice(0, 10);
  }
}