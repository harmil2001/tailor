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
| `features.whatsapp` | WhatsApp messages to customers (see below) |
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

## WhatsApp messages

When `features.whatsapp` is on, the app sends WhatsApp messages to customers through Meta's WhatsApp Business Cloud API:

| When | Template | PDF |
|---|---|---|
| A new order is created | `order_confirmation` | order slip attached |
| An order moves to Stitching, Ready, Delivered or Cancelled | `order_status_update` | no |
| The advance paid on an order goes up | `payment_receipt` | updated order slip attached |

Rules the code follows:
- **Opt-in:** a customer only gets messages if "Send WhatsApp updates" is ticked on their profile. Nothing is sent otherwise.
- **Orders never fail because of WhatsApp.** If sending fails the order is still saved and the screen shows why.
- **Test mode:** without `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` nothing is sent. Messages are logged to the database and the terminal instead.
- Each message attempt is stored in the `whatsapp_messages` table. Run `npm run db:migrate` on a shop's database before turning WhatsApp on.
- A confirmation for an order can only be sent once.

### Environment variables

| Name | Purpose |
|---|---|
| `WHATSAPP_ACCESS_TOKEN` | A permanent token from a Meta System User (not the 24-hour test token) |
| `WHATSAPP_PHONE_NUMBER_ID` | The sender's Phone Number ID, from the WhatsApp "API Setup" page in the Meta app |
| `APP_URL` | The tracking link in messages, for example `https://your-shop.vercel.app`. On Vercel it falls back to the production domain. It must not be localhost when sending for real |

### Try it with Meta's free test number

1. In the Meta developer app, add the WhatsApp product. On the API Setup page, copy the Phone Number ID and generate a temporary token, and add your own phone as a recipient.
2. Create the three templates in WhatsApp Manager (category **Utility**, language English) using the text in `src/lib/whatsapp/templates.ts`. The two with a PDF need a Document header, and Meta asks for a sample PDF (use one from an order's "Download PDF"). Names must match exactly.
3. In `.env.local` set `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID` and `APP_URL` (your live site address, not localhost), and set `features.whatsapp: true` in the shop's settings file.
4. Run `npm run dev`, add a customer with your own WhatsApp number and the box ticked, create an order, then change its status and add a payment.

### Go live for a shop

1. Create a Meta Business account and a WhatsApp Business account with rupee billing, and add a payment method.
2. Register the shop's own sender number (one that is not already on the regular WhatsApp app).
3. Create the three templates as above, create a System User, and generate a permanent token with `whatsapp_business_messaging` and `whatsapp_business_management`.
4. Set the environment variables on the host, set `features.whatsapp: true` in the shop's settings file, and redeploy.
5. Send yourself a test order first.

Costs: Meta charges per delivered message (about ₹0.12 to ₹0.15 for these templates at the time of writing; check Meta's rate card). Each shop pays Meta directly.

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
