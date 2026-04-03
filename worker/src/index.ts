/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import type { Env } from './types';
import { fetchMetadata } from './metadata';
import { handleImageProxy } from './image-proxy';

/** Standard CORS headers for all API responses. */
const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** Security headers applied to HTML responses. */
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'Content-Security-Policy':
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: blob:; " +
    "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com; " +
    "frame-ancestors 'none'",
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};

/** Creates a JSON response with CORS headers. */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

/** Cloudflare Worker entry point handling metadata and image proxy routes. */
export default {
  /** Routes incoming requests to the metadata or image proxy handler. */
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight.
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    // Route: GET /api/metadata?url=<encoded_url>
    if (path === '/api/metadata' && request.method === 'GET') {
      const targetUrl = url.searchParams.get('url');
      if (!targetUrl) {
        return jsonResponse({ error: 'Missing "url" query parameter' }, 400);
      }

      try {
        const metadata = await fetchMetadata(targetUrl);
        return jsonResponse(metadata);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch metadata';
        return jsonResponse({ error: message }, 500);
      }
    }

    // Route: GET /api/image-proxy?url=<encoded_image_url>
    if (path === '/api/image-proxy' && request.method === 'GET') {
      const imageUrl = url.searchParams.get('url');
      if (!imageUrl) {
        return jsonResponse({ error: 'Missing "url" query parameter' }, 400);
      }

      const response = await handleImageProxy(imageUrl);
      // Add CORS headers to image proxy responses.
      const headers = new Headers(response.headers);
      for (const [key, value] of Object.entries(CORS_HEADERS)) {
        headers.set(key, value);
      }
      return new Response(response.body, {
        status: response.status,
        headers,
      });
    }

    // Fall through to static assets (Angular SPA with SPA-mode fallback).
    const assetResponse = await env.ASSETS.fetch(request);

    // Apply security headers to HTML responses.
    const contentType = assetResponse.headers.get('Content-Type') ?? '';
    if (contentType.includes('text/html')) {
      const headers = new Headers(assetResponse.headers);
      for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
        headers.set(key, value);
      }
      return new Response(assetResponse.body, {
        status: assetResponse.status,
        statusText: assetResponse.statusText,
        headers,
      });
    }

    return assetResponse;
  },
} satisfies ExportedHandler<Env>;
