/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

/** Valid platform identifiers matching the Angular client's Platform enum. */
export type PlatformId = 'spotify' | 'appleMusic' | 'youtubeMusic' | 'soundcloud';

/** Metadata returned by the worker API. */
export interface MusicMetadata {
  platform: PlatformId;
  title: string;
  artist: string;
  coverUrl: string;
  originalUrl: string;
}

/** Cloudflare Worker environment bindings. */
export interface Env {
  ASSETS: Fetcher;
}
