/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import type { MusicMetadata } from './types';
import { fetchSpotifyMetadata } from './platforms/spotify';
import { fetchAppleMusicMetadata } from './platforms/apple-music';
import { fetchYoutubeMusicMetadata } from './platforms/youtube-music';
import { fetchSoundcloudMetadata } from './platforms/soundcloud';

/** URL patterns for detecting the music platform. */
const PLATFORM_PATTERNS: Array<{
  pattern: RegExp;
  fetcher: (url: string) => Promise<MusicMetadata>;
}> = [
  {
    pattern: /^https?:\/\/(open\.)?spotify\.com\/(track|album|playlist|intl-[a-z]+\/)/i,
    fetcher: fetchSpotifyMetadata,
  },
  {
    pattern: /^https?:\/\/music\.apple\.com\//i,
    fetcher: fetchAppleMusicMetadata,
  },
  {
    pattern: /^https?:\/\/music\.youtube\.com\//i,
    fetcher: fetchYoutubeMusicMetadata,
  },
  {
    pattern: /^https?:\/\/(www\.|m\.)?soundcloud\.com\//i,
    fetcher: fetchSoundcloudMetadata,
  },
];

/** Detects the platform and fetches metadata for the given URL. */
export async function fetchMetadata(url: string): Promise<MusicMetadata> {
  for (const { pattern, fetcher } of PLATFORM_PATTERNS) {
    if (pattern.test(url)) {
      return fetcher(url);
    }
  }
  throw new Error(`Unsupported platform for URL: ${url}`);
}
