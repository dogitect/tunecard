/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import type { MusicMetadata } from '../types';
import { fetchOpenGraphTags } from '../opengraph';

/** Fetches metadata for a YouTube Music URL. */
export async function fetchYoutubeMusicMetadata(url: string): Promise<MusicMetadata> {
  // Try oEmbed first (YouTube Music uses the standard YouTube oEmbed).
  const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  try {
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = (await response.json()) as {
        title?: string;
        author_name?: string;
        thumbnail_url?: string;
      };

      // Extract video ID for high-res thumbnail.
      const videoId = extractVideoId(url);
      const coverUrl = videoId
        ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        : (data.thumbnail_url ?? '');

      return {
        platform: 'youtubeMusic',
        title: data.title ?? 'Unknown Title',
        artist: data.author_name ?? 'Unknown Artist',
        coverUrl,
        originalUrl: url,
      };
    }
  } catch {
    // Fall through to OG scraping.
  }

  // Fallback: OpenGraph scraping.
  const tags = await fetchOpenGraphTags(url);
  const videoId = extractVideoId(url);
  const coverUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    : (tags['og:image'] ?? '');

  return {
    platform: 'youtubeMusic',
    title: tags['og:title'] ?? 'Unknown Title',
    artist: tags['og:description']?.split(' \u00B7 ')?.[0] ?? 'Unknown Artist',
    coverUrl,
    originalUrl: url,
  };
}

/** Extracts the video ID from a YouTube Music URL. */
function extractVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}
