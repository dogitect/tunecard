/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  viewChild,
  ElementRef,
} from '@angular/core';
import { Router } from '@angular/router';

import { MusicCardComponent } from '../../components/music-card/music-card';
import { MusicCardStateService } from '../../services/music-card-state.service';
import { CardExportService } from '../../services/card-export.service';

/** Card page displaying the generated music card with download option. */
@Component({
  selector: 'app-card',
  imports: [MusicCardComponent],
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  private readonly router = inject(Router);
  private readonly cardState = inject(MusicCardStateService);
  private readonly cardExport = inject(CardExportService);

  /** The music metadata to render, sourced from shared state. */
  readonly metadata = this.cardState.metadata;

  /** Whether a PNG export is in progress. */
  readonly isExporting = signal(false);

  private readonly cardRef = viewChild<ElementRef<HTMLElement>>('cardRef');

  /** Exports the card as a PNG and triggers a browser download. */
  async download(): Promise<void> {
    const el = this.cardRef()?.nativeElement;
    if (!el || !this.metadata()) return;

    const meta = this.metadata()!;
    const sanitized = `${meta.artist}-${meta.title}`
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    const filename = `tunecard-${sanitized}.png`;

    this.isExporting.set(true);
    try {
      await this.cardExport.exportAsImage(el, filename);
    } finally {
      this.isExporting.set(false);
    }
  }

  /** Clears state and navigates back to the home page. */
  createAnother(): void {
    this.cardState.clear();
    this.router.navigate(['/']);
  }
}
