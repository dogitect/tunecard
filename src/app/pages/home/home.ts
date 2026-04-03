/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, switchMap, catchError, EMPTY, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PlatformScrollerComponent } from '../../components/platform-scroller/platform-scroller';
import { LinkInputComponent } from '../../components/link-input/link-input';
import { PlatformDetectorService } from '../../services/platform-detector.service';
import { MetadataService } from '../../services/metadata.service';
import { MusicCardStateService } from '../../services/music-card-state.service';

/** Home page with link input and platform scroller. */
@Component({
  selector: 'app-home',
  imports: [PlatformScrollerComponent, LinkInputComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly router = inject(Router);
  private readonly platformDetector = inject(PlatformDetectorService);
  private readonly metadataService = inject(MetadataService);
  private readonly cardState = inject(MusicCardStateService);

  /** User-facing error message, or `null` when there is no error. */
  readonly errorMessage = signal<string | null>(null);

  /** Whether a metadata fetch is in flight. */
  readonly isLoading = signal(false);

  private readonly linkSubmit$ = new Subject<string>();

  constructor() {
    this.linkSubmit$
      .pipe(
        tap(() => {
          this.errorMessage.set(null);
          this.isLoading.set(true);
        }),
        switchMap((url) =>
          this.metadataService.fetchMetadata(url).pipe(
            catchError(() => {
              this.errorMessage.set('Failed to fetch music details. Please try again.');
              this.isLoading.set(false);
              return EMPTY;
            }),
          ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((metadata) => {
        this.isLoading.set(false);
        this.cardState.setMetadata(metadata);
        this.router.navigate(['/card']);
      });
  }

  /** Validates the pasted URL and triggers a metadata fetch. */
  onLinkSubmitted(url: string): void {
    const platform = this.platformDetector.detect(url);
    if (!platform) {
      this.errorMessage.set(
        'Unsupported link. Please paste a Spotify, Apple Music, YouTube Music, or SoundCloud link.',
      );
      return;
    }

    this.linkSubmit$.next(url);
  }
}
