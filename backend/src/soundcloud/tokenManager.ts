import { db } from '../db/index';
import { soundcloudTokens } from '../db/schema';
import { eq } from 'drizzle-orm';

const SC_TOKEN_URL = 'https://secure.soundcloud.com/oauth/token';
const REFRESH_BUFFER_MS = 5 * 60 * 1000; // refresh 5 minutes before expiry

function getCredentials() {
  const clientId = process.env.SOUNDCLOUD_CLIENT_ID;
  const clientSecret = process.env.SOUNDCLOUD_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error('SOUNDCLOUD_CLIENT_ID and SOUNDCLOUD_CLIENT_SECRET must be set');
  }
  return { clientId, clientSecret };
}

async function fetchWithRetry(url: string, init: RequestInit, maxRetries = 3): Promise<Response> {
  let delay = 1000;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, init);
    if (res.status === 429 && attempt < maxRetries) {
      await new Promise((r) => setTimeout(r, delay));
      delay *= 2;
      continue;
    }
    return res;
  }
  throw new Error('SoundCloud token request failed after max retries');
}

async function fetchClientCredentials(): Promise<{ accessToken: string; refreshToken: string | null; expiresAt: string }> {
  const { clientId, clientSecret } = getCredentials();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetchWithRetry(SC_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json; charset=utf-8',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`SoundCloud token error ${res.status}: ${text}`);
  }
  const data = await res.json() as { access_token: string; refresh_token?: string; expires_in: number };
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
  return { accessToken: data.access_token, refreshToken: data.refresh_token ?? null, expiresAt };
}

async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string | null; expiresAt: string }> {
  const { clientId, clientSecret } = getCredentials();
  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const res = await fetchWithRetry(SC_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${basic}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json; charset=utf-8',
    },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }).toString(),
  });
  if (!res.ok) {
    // Refresh token expired or invalid — fall back to client credentials
    return fetchClientCredentials();
  }
  const data = await res.json() as { access_token: string; refresh_token?: string; expires_in: number };
  const expiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString();
  return { accessToken: data.access_token, refreshToken: data.refresh_token ?? null, expiresAt };
}

/**
 * Returns a valid SoundCloud OAuth access token.
 * Caches in the soundcloud_tokens table; refreshes proactively before expiry.
 */
export async function getSCToken(): Promise<string> {
  const [cached] = await db.select().from(soundcloudTokens).where(eq(soundcloudTokens.id, 'singleton'));

  if (cached) {
    const expiresAt = new Date(cached.expiresAt).getTime();
    const needsRefresh = Date.now() >= expiresAt - REFRESH_BUFFER_MS;
    if (!needsRefresh) return cached.accessToken;

    // Refresh using the stored refresh token if available
    const tokens = cached.refreshToken
      ? await refreshAccessToken(cached.refreshToken)
      : await fetchClientCredentials();

    await db
      .update(soundcloudTokens)
      .set({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, expiresAt: tokens.expiresAt })
      .where(eq(soundcloudTokens.id, 'singleton'));
    return tokens.accessToken;
  }

  // No cached token — fetch fresh
  const tokens = await fetchClientCredentials();
  await db.insert(soundcloudTokens).values({
    id: 'singleton',
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    expiresAt: tokens.expiresAt,
  });
  return tokens.accessToken;
}

/**
 * Make an authenticated GET request to the SoundCloud API.
 * Retries once on 401 (token may have just expired).
 */
export async function scGet(url: string): Promise<Response> {
  const token = await getSCToken();
  const res = await fetchWithRetry(url, {
    headers: { 'Authorization': `OAuth ${token}`, 'Accept': 'application/json; charset=utf-8' },
  });

  if (res.status === 401) {
    // Force refresh and retry once
    await db.delete(soundcloudTokens).where(eq(soundcloudTokens.id, 'singleton'));
    const freshToken = await getSCToken();
    return fetch(url, {
      headers: { 'Authorization': `OAuth ${freshToken}`, 'Accept': 'application/json; charset=utf-8' },
    });
  }
  return res;
}
