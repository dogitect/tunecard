/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { MusicMetadata } from '../models/music-metadata.model';
import { environment } from '../environments/environment';

/** Fetches music metadata from the Cloudflare Worker backend. */
@Injectable({ providedIn: 'root' })
export class MetadataService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.workerBaseUrl;

  /** Fetches metadata for the given music streaming URL. */
  fetchMetadata(url: string): Observable<MusicMetadata> {
    return this.http.get<MusicMetadata>(`${this.baseUrl}/metadata`, {
      params: { url },
    });
  }

  /** Returns a CORS-safe proxied image URL for card export. */
  getImageProxyUrl(originalImageUrl: string): string {
    return `${this.baseUrl}/image-proxy?url=${encodeURIComponent(originalImageUrl)}`;
  }
}
