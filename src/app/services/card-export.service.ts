/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import { Injectable } from '@angular/core';
import html2canvas from 'html2canvas-pro';

/** Exports a DOM element as a downloadable PNG image. */
@Injectable({ providedIn: 'root' })
export class CardExportService {
  /** Renders the element at 3x resolution and triggers a PNG download. */
  async exportAsImage(element: HTMLElement, filename: string): Promise<void> {
    const canvas = await html2canvas(element, {
      scale: 3,
      useCORS: true,
      backgroundColor: null,
      logging: false,
    });

    const blob = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas to Blob conversion failed'))),
        'image/png',
      ),
    );

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
