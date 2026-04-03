/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import { ChangeDetectionStrategy, Component, input, computed, inject } from '@angular/core';

import { MusicMetadata } from '../../models/music-metadata.model';
import { MetadataService } from '../../services/metadata.service';
import { QrCodeComponent } from '../qr-code/qr-code';

/** Vertical music card displaying cover art, title, artist, and QR code. */
@Component({
  selector: 'app-music-card',
  imports: [QrCodeComponent],
  templateUrl: './music-card.html',
  styleUrl: './music-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MusicCardComponent {
  private readonly metadataService = inject(MetadataService);

  /** The music metadata to display on the card. */
  readonly metadata = input.required<MusicMetadata>();

  /** Proxied cover image URL for CORS-safe rendering. */
  readonly imageUrl = computed(() =>
    this.metadataService.getImageProxyUrl(this.metadata().coverUrl),
  );
}
