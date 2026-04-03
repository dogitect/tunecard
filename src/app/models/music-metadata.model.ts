/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import { Platform } from '../constants/platform.constants';

/** Metadata extracted from a music streaming link. */
export interface MusicMetadata {
  platform: Platform;
  title: string;
  artist: string;
  coverUrl: string;
  originalUrl: string;
}
