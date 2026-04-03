/**
 * @license
 * Copyright 2026 Leon Xia. All rights reserved.
 * SPDX-License-Identifier: MIT
 */

import { inject } from '@angular/core';
import { type CanActivateFn, Router, Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home';
import { MusicCardStateService } from './services/music-card-state.service';

/** Prevents navigation to /card when no metadata is loaded. */
const cardGuard: CanActivateFn = () => {
  const cardState = inject(MusicCardStateService);
  const router = inject(Router);
  return cardState.metadata() !== null || router.createUrlTree(['/']);
};

/** Top-level route definitions. */
export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'card',
    loadComponent: () => import('./pages/card/card').then((m) => m.CardComponent),
    canActivate: [cardGuard],
  },
  { path: '**', redirectTo: '' },
];
