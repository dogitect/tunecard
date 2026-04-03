/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import { ChangeDetectionStrategy, Component } from '@angular/core';

import { PLATFORM_DISPLAY_NAMES, PLATFORM_SCROLL_ORDER } from '../../constants/platform.constants';

/**
 * Vertically scrolling list of platform names.
 * Shows 3 items at a time with the center item in focus and
 * adjacent items faded via a CSS gradient mask.
 *
 * Uses a pure CSS @keyframes animation for truly seamless infinite
 * looping. The list is rendered twice; when the animation completes
 * one full cycle through the first copy, CSS `animation-iteration-count:
 * infinite` restarts at the visually identical position in the
 * duplicate -- completely invisible to the user.
 */
@Component({
  selector: 'app-platform-scroller',
  templateUrl: './platform-scroller.html',
  styleUrl: './platform-scroller.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlatformScrollerComponent {
  /** Two copies: the animation scrolls through the first, then loops seamlessly. */
  readonly items: string[] = [...PLATFORM_SCROLL_ORDER, ...PLATFORM_SCROLL_ORDER].map(
    (p) => PLATFORM_DISPLAY_NAMES[p],
  );
}
