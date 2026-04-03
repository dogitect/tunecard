/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import type { MusicMetadata } from '../types';
import { fetchPageHtml } from '../opengraph';

/**
 * Fetches metadata for a Spotify track/album/playlist URL.
 *
 * Primary strategy: fetch the Spotify embed page and extract structured JSON
 * from the `__NEXT_DATA__` script tag, which contains the track entity with
 * title, artist, and cover art.
 *
 * Fallback: oEmbed API, which reliably provides title and cover art but not
 * a separate artist field.
 */
export async function fetchSpotifyMetadata(url: string): Promise<MusicMetadata> {
  // Try embed page first for full structured data (including artist).
  const embedResult = await fetchFromEmbed(url);
  if (embedResult) {
    return embedResult;
  }

  // Fallback: oEmbed (title only, artist may be absent).
  return fetchFromOembed(url);
}

/**
 * Fetches metadata from the Spotify embed page's `__NEXT_DATA__` JSON.
 *
 * The embed page at `open.spotify.com/embed/track/{id}` is server-rendered
 * and includes a `<script id="__NEXT_DATA__">` block with the full entity,
 * including `entity.name`, `entity.artists[].name`, and cover image URLs.
 */
async function fetchFromEmbed(url: string): Promise<MusicMetadata | null> {
  const embedUrl = url.replace('open.spotify.com/', 'open.spotify.com/embed/');
  try {
    const html = await fetchPageHtml(embedUrl);
    const match = html.match(/<script\s+id="__NEXT_DATA__"[^>]*>(.*?)<\/script>/);
    if (!match?.[1]) {
      return null;
    }

    const data = JSON.parse(match[1]) as {
      props?: {
        pageProps?: {
          state?: {
            data?: {
              entity?: {
                name?: string;
                artists?: Array<{ name?: string }>;
                visualIdentity?: {
                  image?: Array<{ url?: string; maxWidth?: number }>;
                };
              };
            };
          };
        };
      };
    };

    const entity = data.props?.pageProps?.state?.data?.entity;
    if (!entity?.name) {
      return null;
    }

    const artist = entity.artists?.map((a) => a.name).join(', ') || 'Unknown Artist';

    // Pick the largest available image.
    const images = entity.visualIdentity?.image ?? [];
    const largest = images.sort((a, b) => (b.maxWidth ?? 0) - (a.maxWidth ?? 0))[0];
    const coverUrl = largest?.url ?? '';

    return {
      platform: 'spotify',
      title: entity.name,
      artist,
      coverUrl,
      originalUrl: url,
    };
  } catch {
    return null;
  }
}

/** Fallback: fetches metadata from the Spotify oEmbed API. */
async function fetchFromOembed(url: string): Promise<MusicMetadata> {
  const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`;
  try {
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = (await response.json()) as {
        title?: string;
        thumbnail_url?: string;
      };
      return {
        platform: 'spotify',
        title: data.title ?? 'Unknown Title',
        artist: 'Unknown Artist',
        coverUrl: data.thumbnail_url ?? '',
        originalUrl: url,
      };
    }
  } catch {
    // Intentionally empty — fall through to default.
  }

  return {
    platform: 'spotify',
    title: 'Unknown Title',
    artist: 'Unknown Artist',
    coverUrl: '',
    originalUrl: url,
  };
}
