# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (Turbopack, default)
npm run build    # production build
npm run start    # start production server
npm run lint     # run ESLint (not run automatically by build)
```

To use Webpack instead of Turbopack: `next dev --webpack` / `next build --webpack`.

## Architecture

Next.js 16 · React 19 · Tailwind CSS v4 · TypeScript strict mode.

**App Router** under `src/app/`. The `@/*` alias maps to `./src/*`.

- `src/app/layout.tsx` — root layout; loads Geist Sans and Geist Mono as CSS variables (`--font-geist-sans`, `--font-geist-mono`), sets `<html>` and `<body>`.
- `src/app/page.tsx` — home route (`/`).
- `src/app/globals.css` — global styles; Tailwind v4 is configured here via PostCSS, not a `tailwind.config.*` file.

**Server vs. Client Components**: all layouts and pages are Server Components by default. Add `'use client'` only when you need state, event handlers, lifecycle hooks, or browser APIs. Keep `'use client'` boundaries as deep as possible to minimize JS bundle size.

**Breaking changes vs. prior Next.js versions** (see `node_modules/next/dist/docs/` for details):
- `params` and `searchParams` in pages/layouts are now `Promise<...>` — always `await` them.
- `next build` no longer lints automatically; run `npm run lint` separately.
- Turbopack is the default bundler in dev and build.
- Only env vars prefixed `NEXT_PUBLIC_` are exposed to the client bundle.

**Route conventions**: a folder only becomes a public route when it contains a `page.tsx` or `route.ts`. Use `(group)` folders to organize routes without affecting URLs; use `_folder` prefix for non-routable colocated files.

API endpoints live in `src/app/…/route.ts` files. For server-only utilities, import `'server-only'` to get a build-time error if accidentally used in a Client Component.
