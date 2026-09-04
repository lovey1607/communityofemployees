# COE Portal — Community of Employees

A marketplace where the person who got handed "organise the team offsite" posts what they
need once, and approved vendors around Gurgaon bid for it.

Next.js 16 (App Router) · React 19 · TypeScript · PostgreSQL + Drizzle · Tailwind 4

---

## Running it locally

You need **PostgreSQL 14 or newer** and Node 20+.

```bash
npm install
cp .env.example .env.local          # then fill in DATABASE_URL and AUTH_SECRET
npm run db:migrate                  # create the schema
npm run db:seed                     # optional: local accounts + the Gurgaon venue directory
npm run dev
```

`AUTH_SECRET` must be at least 32 characters:

```bash
openssl rand -hex 32
```

Without SMTP configured, verification and password-reset **links are printed to the server
console** instead of being emailed. That is fine locally; set SMTP before going live.

### Seed accounts

`npm run db:seed` reads `seed/fixtures.json` if it exists — that file is **gitignored**, so
put your own local passwords in it (copy `seed/fixtures.example.json`). If it does not exist,
accounts are created with strong random passwords that are printed **once** to the terminal
and stored nowhere else.

There is deliberately no shared default password and no seeded admin login in committed code.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` / `npm run start` | Production build / serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | Apply `drizzle/*.sql` once each, in a transaction |
| `npm run db:seed` | Local development data |
| `npm run db:reset` | Drop all app tables (refuses with `NODE_ENV=production`) |
| `npm run test:api` | End-to-end API tests against a running server |

Running the tests:

```bash
npm run build && npm run start          # terminal 1
BASE_URL=http://127.0.0.1:3000 \
TEST_ADMIN_EMAIL=... TEST_ADMIN_PASSWORD=... \
  npm run test:api                      # terminal 2
```

The suite clears the `rate_limits` table between phases, so point it at a **development**
database only.

---

## How the backend is put together

```
drizzle/0001_init.sql      schema (source of truth for DDL)
lib/db/schema.ts           the same tables, typed for Drizzle queries
lib/server/                server-only: crypto, sessions, guards, rate limits, email, audit
lib/validation.ts          zod schemas — work-email policy, GSTIN checksum, all request bodies
app/api/                   route handlers
store/useStore.ts          client cache in front of the API (holds no credentials)
proxy.ts                   security headers + cosmetic redirects (NOT access control)
```

### Authentication

- Passwords: **bcrypt**, cost 12 by default (`BCRYPT_ROUNDS`).
- Sessions: an opaque random token in an **HttpOnly, SameSite=Lax** cookie; the database
  stores only its HMAC. Every request looks the session up, so logout, suspension, password
  change and expiry all take effect *immediately and server-side*. A stateless JWT could not
  do that.
- Signup → email verification → **admin approval**. Nothing works until all three are done.
- Login is rate limited per IP *and* per account, with a 15-minute lockout after 5 failures.
  Responses do not reveal whether an address is registered.
- Password reset links last 1 hour and are single-use; using one signs out every session.

### Authorization

`lib/server/guards.ts` is the access control. Every protected route calls one of
`requireUser` / `requireActiveUser` / `requireRole` / `requireAdmin`, and every query is
scoped by the session user's id — never by an id taken from the request. `proxy.ts` only
knows whether a cookie is *present*, so it is a signpost, not a lock.

### Bid visibility

While a requirement is open, a vendor's own bid is the only bid their browser ever receives —
rival prices and identities are not sent and then hidden, they are never serialized. The
poster sees every bid with identities masked (`Vendor A1B2`) until they award; awarding
reveals them to both sides. A poster can opt into open bidding per requirement
(`bidVisibility: 'open'`).

**The trade-off, since the brief asked:** masked is the default. Open bidding produces
sharper undercutting and looks livelier, but it also lets a vendor recognise and price
against a specific rival, and it leaks who is quoting what to a competitor — which is exactly
the thing a vendor is trusting the platform not to do. Masked keeps the price competition and
drops the gamesmanship. It is a per-RFP setting, so this is reversible if the pilot says
otherwise.

### RFP lifecycle

```
draft → open → bid-received → awarded → completed
                    ↘ cancelled
```

`bid-received` is a convenience state (open, with at least one live bid). Rating a vendor
requires `completed`, which only the poster can set, and only after an award.

### Notifications

Email today: verification, password reset, approval/rejection, award (both sides), and a
new-requirement digest to matching vendors. **WhatsApp is the obvious second channel** given
the tooling elsewhere in the business — every send goes through `sendMail` in
`lib/server/email.ts`, so adding a WhatsApp transport there covers all of them at once.

### Maintenance

`POST /api/maintenance` deletes expired sessions, consumed tokens, stale rate-limit counters
and audit rows older than 24 months. Authenticate as an admin, or set `CRON_SECRET` and send
it as `x-cron-secret` from a scheduled job.

---

## Configuration

Everything lives in the environment; nothing is committed. See `.env.example`.

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL. TLS is required unless the host is localhost. |
| `AUTH_SECRET` | yes | 32+ chars. Rotating it invalidates all sessions and pending email links. |
| `APP_URL` | yes in prod | Used to build links in emails. |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` / `SMTP_FROM` | prod | Without these, email is logged to the console. |
| `GOOGLE_MAPS_API_KEY` | optional | **Server-side** key for `/api/places/*`. Never sent to the browser. |
| `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` | optional | Browser key for rendering the map. Restrict it by HTTP referrer. Without it the directory still works as a distance-sorted list. |
| `CRON_SECRET` | optional | Lets a scheduled job call `/api/maintenance`. |
| `BCRYPT_ROUNDS` | optional | Default 12. |

### GSTIN verification

Signup validates the 15-character GSTIN format **and its mod-36 checksum**, so typos are
caught without a network call. It does not confirm the number belongs to that business — an
admin does that at approval time, which is when `gstVerified` is set. Live verification via a
compliance API (ClearTax, Masters India, or the GST portal directly) is the upgrade; it would
slot into `app/api/auth/signup/route.ts` and the admin approval route.

---

## Notes for whoever picks this up next

- **`AGENTS.md` is genuine.** It is emitted by the installed `next` package — verified against
  `node_modules/next/dist/server/lib/generate-agent-files.js`, which produces that block
  byte-for-byte, and documented at `node_modules/next/dist/docs/01-app/02-guides/ai-agents.md`.
  `next dev` re-creates it if deleted. Leave it.
- `data/venues.ts` is a **directory**, not an account store. It holds no credentials. Its
  GSTINs and contact numbers are placeholders.
- The reverse-bidding animation on the homepage is a **worked example with sample data** and
  is labelled as such. Please keep it that way — invented "live activity" is the fastest way
  to lose a pilot customer's trust.
