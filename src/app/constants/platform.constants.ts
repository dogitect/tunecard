/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

/** Supported music streaming platforms. */
export enum Platform {
  Spotify = 'spotify',
  AppleMusic = 'appleMusic',
  YoutubeMusic = 'youtubeMusic',
  Soundcloud = 'soundcloud',
}

/** Human-readable display names for each platform. */
export const PLATFORM_DISPLAY_NAMES: Record<Platform, string> = {
  [Platform.Spotify]: 'Spotify',
  [Platform.AppleMusic]: 'Apple Music',
  [Platform.YoutubeMusic]: 'YouTube Music',
  [Platform.Soundcloud]: 'SoundCloud',
};

/** Display order for the home page scroller. */
export const PLATFORM_SCROLL_ORDER: Platform[] = [
  Platform.AppleMusic,
  Platform.Spotify,
  Platform.YoutubeMusic,
  Platform.Soundcloud,
];

/** URL patterns for detecting each platform from a shared link. */
export const PLATFORM_URL_PATTERNS: {
  platform: Platform;
  pattern: RegExp;
}[] = [
  {
    platform: Platform.Spotify,
    pattern: /^https?:\/\/(open\.)?spotify\.com\/(track|album|playlist|intl-[a-z]+\/)/i,
  },
  {
    platform: Platform.AppleMusic,
    pattern: /^https?:\/\/music\.apple\.com\//i,
  },
  {
    platform: Platform.YoutubeMusic,
    pattern: /^https?:\/\/music\.youtube\.com\//i,
  },
  {
    platform: Platform.Soundcloud,
    pattern: /^https?:\/\/(www\.|m\.)?soundcloud\.com\//i,
  },
];
