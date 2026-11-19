# Shop management app

A mobile-first order and customer manager for a tailoring shop. Next.js 16, React 19, Tailwind v4, Neon Postgres, Auth.js.
The default shop is **Dhaaga**. Other shops can run the same code with their own settings file.

## Run it locally

```bash
npm install
npm run dev
```

Create `.env.local` with:

```env
DATABASE_URL=       # Neon Postgres connection string
AUTH_SECRET=        # generate with: openssl rand -base64 32
AUTH_URL=http://localhost:3000
```

First time on a new database:

```bash
npm run db:migrate
npm run db:set-login      # create the admin login (asks in the terminal)
```

## Shop settings

Everything that differs between shops lives in one file per shop: `src/config/shops/<shop-id>.ts`.

| Setting | What it controls |
|---|---|
| `name`, `tagline` | Top bar, login, public order page, PDF invoice, browser tab |
| `logo` | `needle` (Dhaaga mark), `monogram` (a letter) or `image` (a file in `/public`) |
| `favicon` | Optional browser-tab icon in `/public` |
| `features.dealers` | Dealer accounts and ledger |
| `features.stock` | Fabric stock, low-stock alerts, fabric picking on orders. Needs `clothChoice` |
| `features.clothChoice` | The Customer / Tailor cloth choice on each order item |
| `theme` | Optional colour overrides. Leave out to keep the default palette |

Which file is used is picked by the `SHOP_ID` environment variable. If it is not set, **`dhaaga`** is used.
Settings are fixed when the app is built, so changing them (or `SHOP_ID`) needs a redeploy.
Only the chosen shop's file is bundled into the app.

### Add a shop

1. Copy `src/config/shops/dhaaga.ts` to `src/config/shops/<shop-id>.ts` and edit it. The `id` must match the file name.
2. Put any logo files in `public/shops/<shop-id>/`.
3. Check it: `npm run shop:check -- <shop-id>` (use `-- --all` to check every shop).
4. Create a new Neon database for the shop and run `npm run db:migrate` and `npm run db:set-login` against it.
5. Create a new Vercel project from this repo with these environment variables: `SHOP_ID`, `DATABASE_URL`, `AUTH_SECRET`.
6. Run locally as that shop: `SHOP_ID=<shop-id> npm run dev`.

Each shop needs its own database and its own `AUTH_SECRET`, so one shop's customers never appear in another shop's app.

### Colours

The default palette is defined twice because Tailwind needs it in CSS and the PDF needs literal values in code:
`src/app/globals.css` (the `@theme static` block) and `src/config/theme.ts`. `npm run shop:check` fails if they differ.
A shop's `theme` overrides are applied on top as CSS variables, and the PDF invoice uses the same colours.

## Commands

```bash
npm run dev          # dev server
npm run build        # production build
npm run lint         # ESLint (not run by build)
npm run db:migrate   # apply database migrations
npm run db:set-login # create or change an admin login
npm run shop:check   # validate shop settings and colour tokens
```

See `architecture.md` and `styles.md` for more detail.
