/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

/** Allowlisted CDN domains for image proxying. */
const ALLOWED_HOSTS = [
  'i.scdn.co',
  'mosaic.scdn.co',
  'image-cdn-ak.spotifycdn.com',
  'image-cdn-fa.spotifycdn.com',
  'is1-ssl.mzstatic.com',
  'is2-ssl.mzstatic.com',
  'is3-ssl.mzstatic.com',
  'is4-ssl.mzstatic.com',
  'is5-ssl.mzstatic.com',
  'img.youtube.com',
  'i.ytimg.com',
  'i1.sndcdn.com',
  'a1.sndcdn.com',
];

/** Proxies an image from an allowlisted CDN with CORS headers. */
export async function handleImageProxy(imageUrl: string): Promise<Response> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid image URL' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (parsedUrl.protocol !== 'https:' || !ALLOWED_HOSTS.includes(parsedUrl.hostname)) {
    return new Response(JSON.stringify({ error: 'Image host not allowed' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const response = await fetch(imageUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    },
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: 'Failed to fetch image' }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const headers = new Headers({
    'Content-Type': response.headers.get('Content-Type') ?? 'image/jpeg',
    'Cache-Control': 'public, max-age=86400',
    'Access-Control-Allow-Origin': '*',
  });

  return new Response(response.body, { headers });
}
