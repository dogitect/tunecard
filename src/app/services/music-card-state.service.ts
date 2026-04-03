/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import { Injectable, signal } from '@angular/core';

import { MusicMetadata } from '../models/music-metadata.model';

/** Signal-based state holder for the current music card metadata. */
@Injectable({ providedIn: 'root' })
export class MusicCardStateService {
  /** The currently loaded metadata, or `null` if none is set. */
  readonly metadata = signal<MusicMetadata | null>(null);

  /** Stores metadata for the card to display. */
  setMetadata(data: MusicMetadata): void {
    this.metadata.set(data);
  }

  /** Clears the stored metadata. */
  clear(): void {
    this.metadata.set(null);
  }
}
