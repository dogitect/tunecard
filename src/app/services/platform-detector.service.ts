/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core';

import { Platform, PLATFORM_URL_PATTERNS } from '../constants/platform.constants';

/** Detects the music platform from a given URL. */
@Injectable({ providedIn: 'root' })
export class PlatformDetectorService {
  /** Returns the detected platform, or `null` if the URL is not recognized. */
  detect(url: string): Platform | null {
    const trimmed = url.trim();
    for (const { platform, pattern } of PLATFORM_URL_PATTERNS) {
      if (pattern.test(trimmed)) {
        return platform;
      }
    }
    return null;
  }
}
