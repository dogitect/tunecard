/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import { ChangeDetectionStrategy, Component, output } from '@angular/core';

/** Borderless text input for pasting music streaming links. */
@Component({
  selector: 'app-link-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="input-wrapper">
      <input
        type="text"
        class="link-input"
        placeholder="Paste a music link"
        (paste)="onPaste($event)"
        (keydown.enter)="onEnter($event)"
      />
      <div class="underline"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }

    .input-wrapper {
      position: relative;
    }

    .link-input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      font-size: 0.9375rem;
      font-weight: 400;
      color: #1d1d1f;
      padding: 0.5rem 0;
      font-family: inherit;
      letter-spacing: -0.01em;
    }

    .link-input::placeholder {
      color: #86868b;
      font-weight: 400;
    }

    .underline {
      height: 1px;
      background: #d2d2d7;
      transition: background 300ms cubic-bezier(0.25, 0.1, 0.25, 1);
    }

    .input-wrapper:focus-within .underline {
      background: #1d1d1f;
    }
  `,
})
export class LinkInputComponent {
  /** Emits the URL string when the user submits a link. */
  readonly linkSubmitted = output<string>();

  /** Handles paste events by extracting text and emitting it. */
  onPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData('text')?.trim();
    if (text) {
      setTimeout(() => this.linkSubmitted.emit(text), 0);
    }
  }

  /** Handles Enter key by submitting the current input value. */
  onEnter(event: Event): void {
    const input = event.target as HTMLInputElement;
    const text = input.value.trim();
    if (text) {
      this.linkSubmitted.emit(text);
    }
  }
}
