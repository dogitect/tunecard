# Copilot Instructions — TuneCard

## Build and Run

```bash
# Install dependencies (both root and worker)
bun install && cd worker && bun install

# Angular dev server (http://localhost:4200)
bun start

# Worker dev server (http://localhost:8787) — run in a separate terminal
cd worker && bun run dev

# Production build (Angular)
bun run build

# Full deploy (builds Angular, then deploys worker + assets to Cloudflare)
bun run deploy

# Lint (ESLint with Angular + TypeScript + Prettier rules)
bun run lint
```

There is no test suite configured. The Angular test builder exists in `angular.json` but has no specs.

## Architecture

This is a monorepo with two independently-typed codebases that deploy together as a single Cloudflare Worker:

- **Angular 21 SPA** (root) — the frontend at `src/`
- **Cloudflare Worker** (`worker/`) — the API at `worker/src/`, with its own `package.json` and `tsconfig.json`

The `wrangler.toml` at the repo root ties them together: the Worker serves both the API routes and the Angular static assets via the `[assets]` binding with SPA fallback.

### Request flow

```
Browser → Cloudflare Worker (worker/src/index.ts)
  ├─ /api/metadata?url=...   → platform fetcher → JSON response
  ├─ /api/image-proxy?url=... → allowlisted CDN proxy → image bytes
  └─ everything else          → env.ASSETS.fetch() → Angular SPA
```

### Frontend → Worker communication

The Angular app calls the worker through `MetadataService` using `HttpClient`. The base URL is configured per-environment:

- Development: `http://localhost:8787/api` (`src/app/environments/environment.ts`)
- Production: `/api` (`src/app/environments/environment.prod.ts`)

### State management

Component-local state uses Angular `signal()`. Cross-page state (the current music card) flows through `MusicCardStateService`, which holds a single `signal<MusicMetadata | null>`. The `/card` route is guarded by a `canActivate` check against this signal.

## Conventions

### Angular

- **Standalone components only** — no NgModules anywhere.
- **Zoneless change detection** — `provideZonelessChangeDetection()` in `app.config.ts`; no zone.js.
- **OnPush on every component** — `changeDetection: ChangeDetectionStrategy.OnPush` is required and enforced by ESLint.
- **File names use bare `.ts`**, not `.component.ts` — e.g., `music-card.ts`, `home.ts`.
- **Selector prefix is `app`** — e.g., `app-music-card`, `app-link-input`.
- **Modern control flow** — `@if`, `@for`, `@switch` blocks; no structural directives (`*ngIf`, `*ngFor`).
- **Signal APIs throughout** — `input()`, `input.required()`, `output()`, `signal()`, `computed()`, `viewChild()`.
- **RxJS is used for event streams** — `Subject` + `switchMap` + `takeUntilDestroyed()` for HTTP flows; avoid bare `.subscribe()` without cleanup.
- **Component styles** — external `.css` files referenced via `styleUrl` (singular), with Tailwind CSS 4 available globally and component-scoped CSS for layout.

### Worker

- **Manual routing** in the fetch handler (`worker/src/index.ts`) — match on `url.pathname` and `request.method`; no router library.
- **HTMLRewriter** for HTML parsing — not regex. Use `fetchOpenGraphTags()` from `worker/src/opengraph.ts` for OG tag extraction; only use `fetchPageHtml()` when you need the raw HTML string.
- **Image proxy allowlist** — `worker/src/image-proxy.ts` restricts proxying to known CDN hostnames over HTTPS only.
- **`Env` interface** in `worker/src/types.ts` — all Cloudflare bindings go here. Currently only `ASSETS: Fetcher`.

### Formatting

Prettier enforces: 100 char line width, single quotes, 2-space indentation. HTML files use the Angular parser. See `.prettierrc` and `.editorconfig`.

## Adding a New Music Platform

Both the worker and Angular frontend must be updated:

**Worker** (`worker/`):

1. Create `worker/src/platforms/<name>.ts` exporting `fetch<Name>Metadata(url: string): Promise<MusicMetadata>`.
2. Add the platform string to the `PlatformId` union type in `worker/src/types.ts`.
3. Register a regex + fetcher entry in the `PLATFORM_PATTERNS` array in `worker/src/metadata.ts`.

**Angular** (`src/`):

1. Add a value to the `Platform` enum in `src/app/constants/platform.constants.ts`.
2. Add a display name to `PLATFORM_DISPLAY_NAMES`.
3. Add a URL pattern to `PLATFORM_URL_PATTERNS`.
4. Optionally add to `PLATFORM_SCROLL_ORDER` if it should appear in the home page scroller.
5. If the platform's CDN serves cover art from a new domain, add it to `ALLOWED_HOSTS` in `worker/src/image-proxy.ts`.
