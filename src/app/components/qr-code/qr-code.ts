/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import {
  ChangeDetectionStrategy,
  Component,
  input,
  effect,
  viewChild,
  ElementRef,
} from '@angular/core';
import QRCode from 'qrcode';

/**
 * Internal render scale factor.
 *
 * The canvas is drawn at this multiple of the display size so that the QR code
 * stays crisp when html2canvas captures at 3x and on high-DPI screens.
 */
const RENDER_SCALE = 3;

/** Renders a high-resolution QR code scaled down to the requested display size. */
@Component({
  selector: 'app-qr-code',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas></canvas>`,
  styles: `
    :host {
      display: block;
      line-height: 0;
    }

    canvas {
      display: block;
    }
  `,
})
export class QrCodeComponent {
  /** The URL to encode as a QR code. */
  readonly url = input.required<string>();

  /** Display width and height in CSS pixels. */
  readonly size = input<number>(64);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  constructor() {
    effect(() => {
      const url = this.url();
      const size = this.size();
      const canvasEl = this.canvas()?.nativeElement;
      if (canvasEl && url) {
        // Render at RENDER_SCALE× resolution, then CSS-shrink to display size.
        QRCode.toCanvas(canvasEl, url, {
          width: size * RENDER_SCALE,
          margin: 1,
          color: { dark: '#000000', light: '#ffffff' },
        });
        canvasEl.style.width = `${size}px`;
        canvasEl.style.height = `${size}px`;
      }
    });
  }
}
