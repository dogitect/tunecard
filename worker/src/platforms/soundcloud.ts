/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import type { MusicMetadata } from '../types';
import { fetchOpenGraphTags } from '../opengraph';

/** Fetches metadata for a SoundCloud URL. */
export async function fetchSoundcloudMetadata(url: string): Promise<MusicMetadata> {
  // Try oEmbed first.
  const oembedUrl = `https://soundcloud.com/oembed?url=${encodeURIComponent(url)}&format=json`;
  try {
    const response = await fetch(oembedUrl);
    if (response.ok) {
      const data = (await response.json()) as {
        title?: string;
        author_name?: string;
        thumbnail_url?: string;
      };

      const { title, artist } = parseSoundcloudTitle(data.title ?? '', data.author_name);

      return {
        platform: 'soundcloud',
        title,
        artist,
        coverUrl: data.thumbnail_url ?? '',
        originalUrl: url,
      };
    }
  } catch {
    // Fall through to OG scraping.
  }

  // Fallback: OpenGraph scraping.
  const tags = await fetchOpenGraphTags(url);
  return {
    platform: 'soundcloud',
    title: tags['og:title'] ?? 'Unknown Title',
    artist: tags['og:description']?.split(' \u00B7 ')?.[0] ?? 'Unknown Artist',
    coverUrl: tags['og:image'] ?? '',
    originalUrl: url,
  };
}

/**
 * Parses SoundCloud oEmbed title into song title and artist.
 * oEmbed title may be "Song Title by Artist" or just the song title.
 */
function parseSoundcloudTitle(raw: string, authorName?: string): { title: string; artist: string } {
  if (authorName) {
    // If the title ends with " by AuthorName", strip it.
    const suffix = ` by ${authorName}`;
    if (raw.toLowerCase().endsWith(suffix.toLowerCase())) {
      return {
        title: raw.substring(0, raw.length - suffix.length).trim(),
        artist: authorName,
      };
    }
    return { title: raw, artist: authorName };
  }

  const byIdx = raw.lastIndexOf(' by ');
  if (byIdx !== -1) {
    return {
      title: raw.substring(0, byIdx).trim(),
      artist: raw.substring(byIdx + 4).trim(),
    };
  }

  return { title: raw, artist: 'Unknown Artist' };
}
