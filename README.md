# Cocoya Coffee House — website

A cinematic single-page website for **Cocoya Coffee House**, with a data-driven
digital menu, animated coffee-making storytelling, and a secure guest-feedback
system with a protected admin dashboard.

**Stack:** Next.js 16 (App Router, Cache Components) · React 19 · TypeScript ·
Tailwind CSS 4 · GSAP + ScrollTrigger · Motion · Lenis · Swiper · shadcn/ui (Radix) ·
Lucide · Zod · Supabase (PostgreSQL + Auth + Row Level Security)

---

## ⚠️ Read first: what is real and what is a placeholder

The Google Business link supplied for this project
(`https://share.google/ESln9wFmyM6qYDGw9`) could not be read automatically, and
no other public source for the café was found. **No business details were
invented or borrowed from other businesses.** Instead:

| Content | Status | Where to edit |
| --- | --- | --- |
| Address, phone, Instagram | **Real** — confirmed by the owner (4th Floor, 4/32, Pradhan Marg, Malviya Nagar, Jaipur 302017 · +91 77421 96527 · @cocoya_coffeehouse); map embed resolves to the Google listing | `src/content/site.ts` |
| Google rating | **Real** — 4.9 ★ from 149 reviews, as shown on Google's listing on 14 Nov 2026 (refresh occasionally) | `src/content/reviews.ts` |
| Prices | **Hidden by request** — no prices anywhere (`menuMeta.showPrices = false`) | `src/content/menu.ts` |
| Rest of the menu | **Sample** common coffee-house drinks (stock photos); a "Preview menu" notice is shown | `src/content/menu.ts` |
| Café photos (hero, story, gallery, specials, visit) | **Real** — Cocoya's own photos, enhanced | `photos/cocoya-originals`, `scripts/cocoya-photos.mjs`, `src/content/gallery.ts` |
| Opening hours | **Real** — every day 11:30 AM – 11:30 PM (live "Open now" badge) | `src/content/site.ts` |
| "Cocoya Specials" menu items | Real drinks/dishes from the café's photos; **names are descriptive** until the official menu names are confirmed; prices TBA | `src/content/menu.ts` |
| Google reviews / rating | **Empty** — never fabricated | `src/content/reviews.ts` |
| Brand story copy | Neutral brand voice — no founding year, origins or awards claimed | `src/content/copy.ts` |

As soon as you fill a field in, the site starts showing it automatically.

---

## Adding more of Cocoya's photos

The site already uses the café's own photos. To add or replace any:

1. Put the original in `photos/cocoya-originals/` (e.g. `24.jpg`).
2. Add a line for it in `scripts/cocoya-photos.mjs` (output path + optional `lift` for darker shots),
   then run `node scripts/cocoya-photos.mjs && npm run images:blur`.
3. Reference it from `src/content/gallery.ts` or `src/content/menu.ts`.

### Older workflow (stock-grade any photo)

1. Open Cocoya's **Google Business Profile** (business.google.com) → **Photos**,
   and download the owner photos you want (interior, drinks, food, team).
   Use photos the café owns — customer-uploaded photos belong to their authors.
2. Put them in a folder, e.g. `photos/` at the project root.
3. Process each one with the same colour grade as the rest of the site:

   ```bash
   npm run images:process -- photos/interior-1.jpg gallery/interior-1.jpg
   npm run images:process -- photos/iced-latte.jpg menu/iced-latte.jpg   # replaces the stock one
   ```

   Add `--no-grade` to keep original colours. This resizes, optimises and
   regenerates the blur placeholders.
4. Reference new files in `src/content/gallery.ts` / `src/content/menu.ts`, and set
   `galleryMeta.illustrative = false` when the gallery shows the real café.

---

## Getting started

Requires Node.js 20+.

```bash
npm install
cp .env.example .env.local   # fill in values (the site runs without them)
npm run dev                  # http://localhost:3000
```

Without Supabase variables the whole site works; feedback submissions are
validated and logged to the terminal (development only) instead of stored.

| Script | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm run images:process -- <in> <out>` | Grade + optimise a new photo |
| `npm run images:blur` | Regenerate blur placeholders after changing images |
| `node scripts/marble.mjs` | Regenerate the milk-marbling textures |

---

## Updating content

- **Business details** — `src/content/site.ts`. Fill `contact.phone`,
  `location.*` (add `geo` for an exact map pin), `hours`, `social.instagram`.
  The map embed, call/Instagram buttons, opening hours and LocalBusiness
  structured data appear automatically once set.
- **Menu** — `src/content/menu.ts`. Edit names, descriptions, `price` (number in
  ₹), `diet` (`"veg" | "non-veg" | "egg"`), `bestseller` (only when true),
  `signature` (signature carousel) and `coldFeature` (cold-coffee chapter).
  Empty categories hide themselves. When the menu is the real one, set
  `menuMeta.status = "verified"` — this removes the preview notice and publishes
  the menu as schema.org structured data.
- **Google reviews** — `src/content/reviews.ts`. Paste reviews word-for-word with
  the reviewer's display name, rating and date.
- **Copy** — `src/content/copy.ts`.

---

## Supabase setup (feedback storage + admin)

1. Create a project at [supabase.com](https://supabase.com) (choose the Mumbai
   region for Indian guests).
2. **Run the migration**: Dashboard → SQL Editor → paste
   `supabase/migrations/20261114000000_customer_reviews.sql` → Run
   (or `supabase db push` with the Supabase CLI).
3. **Keys**: Project Settings → API Keys → copy the project URL, the publishable
   key and the secret key into `.env.local` / your host
   (`SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`).
4. **Create an administrator**: Authentication → Users → *Add user* (email +
   password, tick "auto confirm"). Copy the user's UUID, then in the SQL Editor:

   ```sql
   insert into public.admin_users (user_id) values ('<the-user-uuid>');
   ```

5. **Lock down sign-ups**: Authentication → Sign In / Providers → turn off
   "Allow new users to sign up" (admins are added manually).
6. Visit `/admin/reviews` and sign in.

### Security model

- Guests never talk to the database. `POST /api/feedback` validates everything
  server-side (Zod), then inserts with the server-only secret key.
- Row Level Security is on. The anonymous role has **no** access to feedback.
  Only users in `admin_users` can read rows (including phone numbers), and they
  can update only `review_status` and `is_featured` (column-level grants).
- Spam protection: same-origin check, body-size limit, honeypot field, minimum
  fill time, in-memory burst limit, plus database-backed limits per hashed IP
  (6/hour) and per mobile number (3/day). Raw IPs are never stored.
- Double submissions are impossible: each form attempt carries a UUID with a
  unique constraint.
- Feedback is **never auto-published**. It can appear on the website only if the
  guest ticked "you may feature my comments" **and** an admin switches it on in the
  dashboard (first name + last initial only, never the number).
- The admin area is `noindex`, excluded from `robots.txt`, refreshed by the proxy
  and re-checked server-side on every page, action and export.

### Admin dashboard (`/admin/reviews`)

Totals, average rating, five-star count, awaiting-review count and
recommendation rate; search by name; filter by rating and status; change status
(New → Reviewed → Resolved); feature consented comments on the website; CSV
export of the current filter (UTF-8, Excel-safe, formula-injection safe).

### Optional owner alerts

Set `RESEND_API_KEY`, `FEEDBACK_NOTIFY_EMAIL` and `FEEDBACK_FROM_EMAIL` to email
the owner a summary of each new submission (phone masked), and/or
`FEEDBACK_WEBHOOK_URL` to post JSON to Slack/Zapier/Make/n8n. Alerts are sent after
the guest's response, so they never slow the form down. No marketing messages
are ever sent to guests.

---

## Deployment (Vercel recommended)

1. Push the project to GitHub and import it in Vercel.
2. Add the environment variables from `.env.example` (Production + Preview).
   Set `NEXT_PUBLIC_SITE_URL` to the final domain.
3. Deploy. `sitemap.xml`, `robots.txt`, the web manifest, icons and Open Graph
   images are generated automatically.

Any Node.js host works too: `npm run build && npm start`.

---

## Experience & performance notes

- **Hero:** an illustrated iced latte: ice drops in, milk pours and marbles
  through the espresso, condensation forms; floating beans react to the mouse.
- **From Bean to Cup:** a pinned, scroll-scrubbed story (select → roast → grind →
  extract → pour → serve). **Ratio Lab:** interactive espresso/milk ratios.
- Desktop extras (fine pointers only): intro curtain, custom cursor, magnetic
  buttons, 3D tilt cards, continuous glass swirl.
- Mobile is deliberately lighter: no intro curtain, no continuous filter
  animation, the pour starts once the browser is idle, heavy code (carousel,
  form, dialog) loads on demand, and off-screen sections skip rendering
  (`content-visibility`). Milk marbling is pre-rendered (`scripts/marble.mjs`)
  instead of computed live.
- `prefers-reduced-motion` is fully respected (static final states, no smooth
  scroll, no pinning).
- Last local Lighthouse run (production build): desktop Performance 81 ·
  Accessibility 93 (since improved) · Best Practices 100 · SEO 100 · CLS 0.
  Mobile lab score is lower (simulated 4× CPU slowdown on the animation engine)
  but the observed LCP is ≈1.4 s with zero layout shift.

## Project structure

```
src/
  app/                 page, layout, SEO files, API routes, /admin
  components/
    sections/          hero, story, journey, ratio-lab, signature, cold-coffee, …
    art/               illustrated glass + beans (pure SVG)
    menu/              digital menu, cards, product dialog
    feedback/          form, star rating
    magic/             cursor, magnetic, tilt, intro curtain
    motion/            reveal + parallax helpers
  content/             ← all editable business content lives here
  lib/                 validation, Supabase clients, auth, rate limiting, alerts
supabase/migrations/   database schema + RLS
scripts/               image grading/blur, marble textures
```
