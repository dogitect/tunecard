/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import type { MusicMetadata } from '../types';
import { fetchOpenGraphTags } from '../opengraph';

/**
 * Fetches metadata for an Apple Music URL.
 *
 * Primary strategy: extract the track/album ID from the URL and call the
 * iTunes Lookup API, which returns structured JSON. This is locale-independent
 * and avoids the localized OG title parsing problem entirely.
 *
 * Fallback: OpenGraph scraping with multi-locale title parsing.
 */
export async function fetchAppleMusicMetadata(url: string): Promise<MusicMetadata> {
  const { trackId, albumId, country } = parseAppleMusicUrl(url);

  // Try iTunes Lookup API first (track ID is preferred over album ID).
  const lookupId = trackId ?? albumId;
  if (lookupId) {
    const result = await fetchFromItunesLookup(lookupId, country);
    if (result) {
      return { ...result, originalUrl: url };
    }
  }

  // Fallback: OpenGraph scraping.
  return fetchFromOpenGraph(url);
}

/** Extracts track ID, album ID, and country code from an Apple Music URL. */
function parseAppleMusicUrl(url: string): {
  trackId: string | null;
  albumId: string | null;
  country: string;
} {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return { trackId: null, albumId: null, country: 'us' };
  }

  const segments = parsed.pathname.split('/').filter(Boolean);
  const country = segments[0] ?? 'us';
  const trackId = parsed.searchParams.get('i');
  const lastSegment = segments[segments.length - 1];
  const albumId = lastSegment && /^\d+$/.test(lastSegment) ? lastSegment : null;

  return { trackId, albumId, country };
}

/**
 * Fetches metadata from the iTunes Lookup API (no auth required).
 * Returns null only if the API returns zero results.
 */
async function fetchFromItunesLookup(
  id: string,
  country: string,
): Promise<Omit<MusicMetadata, 'originalUrl'> | null> {
  const lookupUrl = `https://itunes.apple.com/lookup?id=${encodeURIComponent(id)}&country=${encodeURIComponent(country)}&entity=song`;

  const response = await fetch(lookupUrl, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    return null;
  }

  const text = await response.text();
  let data: {
    resultCount: number;
    results: Array<{
      trackName?: string;
      collectionName?: string;
      artistName?: string;
      artworkUrl100?: string;
    }>;
  };

  try {
    data = JSON.parse(text);
  } catch {
    return null;
  }

  const result = data.results?.[0];
  if (!result) {
    return null;
  }

  // Upscale artwork from 100x100 to 600x600 for card display.
  const coverUrl = (result.artworkUrl100 ?? '').replace('100x100bb', '600x600bb');

  return {
    platform: 'appleMusic',
    title: result.trackName ?? result.collectionName ?? 'Unknown Title',
    artist: result.artistName ?? 'Unknown Artist',
    coverUrl,
  };
}

/** Fallback: extract metadata from OpenGraph tags. */
async function fetchFromOpenGraph(url: string): Promise<MusicMetadata> {
  const tags = await fetchOpenGraphTags(url);

  const rawTitle = tags['og:title'] ?? '';
  const description = tags['og:description'] ?? '';
  const parsed = parseAppleMusicOgTitle(rawTitle, description);

  return {
    platform: 'appleMusic',
    title: parsed.title || 'Unknown Title',
    artist: parsed.artist || 'Unknown Artist',
    coverUrl: tags['og:image'] ?? '',
    originalUrl: url,
  };
}

/**
 * Parses Apple Music OG title and description into clean title and artist.
 *
 * Apple Music localizes OG titles by region. Known formats:
 * - Chinese: "Apple Music 上Artist的《Song Title》"
 * - English: "Song Title - Apple Music"
 * - Japanese: "Artist「Song Title」- Apple Music"
 */
function parseAppleMusicOgTitle(
  rawTitle: string,
  description: string,
): { title: string; artist: string } {
  // Chinese format: everything between 上 and 的《 is the artist,
  // everything between《and》is the title.
  const chineseMatch = rawTitle.match(/\u4E0A(.+)\u7684\u300A(.+)\u300B/);
  if (chineseMatch?.[1] && chineseMatch[2]) {
    return { title: chineseMatch[2].trim(), artist: chineseMatch[1].trim() };
  }

  // Japanese format: Artist「Title」
  const japaneseMatch = rawTitle.match(/(.+?)\u300C(.+?)\u300D/);
  if (japaneseMatch?.[1] && japaneseMatch[2]) {
    return {
      title: japaneseMatch[2],
      artist: japaneseMatch[1].replace(/\s*[-\u2013\u2014]\s*$/, '').trim(),
    };
  }

  // English/generic: strip " - Apple Music" suffix.
  let cleaned = rawTitle
    .replace(/\s*[-\u2013\u2014]\s*Apple Music.*$/i, '')
    .replace(/\s+on\s+Apple Music.*$/i, '')
    .trim();
  cleaned = cleaned.replace(/^Apple Music\s*\S*\s*/i, '').trim();

  const artist = extractArtistFromDescription(description);
  return { title: cleaned || rawTitle, artist: artist ?? '' };
}

/** Extracts artist name from Apple Music OG description. */
function extractArtistFromDescription(description: string): string | undefined {
  const byMatch = description.match(/\bby\s+(.+?)(?:\s+on\s+Apple Music|\.\s|$)/i);
  if (byMatch?.[1]) return byMatch[1].trim();

  const dashParts = description.split(/\s+[\u2014\u2013-]\s+/);
  if (dashParts.length >= 2) return dashParts[0]?.trim();

  return undefined;
}
