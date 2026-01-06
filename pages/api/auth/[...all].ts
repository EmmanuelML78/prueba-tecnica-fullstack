import type { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@/lib/auth';

// Disallow body parsing, Better Auth handles it
export const config = { api: { bodyParser: false } };

/**
 * Read raw body from request stream
 */
async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

/**
 * Better Auth catch-all handler
 * Converts Next.js request to Web Request for Better Auth
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Build the full URL
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const url = `${protocol}://${host}${req.url}`;

  // Get raw body for non-GET requests
  let body: Buffer | undefined;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await getRawBody(req);
  }

  // Convert headers to Headers object
  const headers = new Headers();
  Object.entries(req.headers).forEach(([key, value]) => {
    if (value) {
      headers.set(key, Array.isArray(value) ? value.join(', ') : value);
    }
  });

  // Convert to Web Request
  const webRequest = new Request(url, {
    method: req.method,
    headers,
    body: body?.length ? body : undefined,
  });

  // Call Better Auth handler
  const response = await auth.handler(webRequest);

  // Set response headers
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  // Set status and send body
  res.status(response.status);
  const responseBody = await response.text();
  res.send(responseBody);
}
