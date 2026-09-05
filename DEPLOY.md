# Deploying COE

From a merged `main` to a working public site. Roughly an hour, most of it
waiting for DNS.

The order below is deliberate: **email last is a mistake.** Without it nobody
can complete a signup, so a site deployed without SMTP looks finished and
serves nobody.

---

## 1. Database

Neon or Supabase — either free tier is enough to start. Create a project in a
region close to India (Neon: `ap-southeast-1`; Supabase: Mumbai or Singapore).

Copy the **pooled** connection string. It looks like:

```
postgresql://user:password@host/dbname?sslmode=require
```

Use the pooled one, not the direct one. Serverless functions open and close
connections constantly, and the direct endpoint runs out of them.

## 2. Secrets

```bash
openssl rand -hex 32     # AUTH_SECRET
openssl rand -hex 32     # CRON_SECRET
openssl rand -base64 18  # your admin password
```

Keep these somewhere safe. `AUTH_SECRET` signs every session — changing it
later logs everybody out.

## 3. Vercel

1. vercel.com → **Add New → Project** → import `lovey1607/communityofemployees`
2. Framework preset: **Next.js** (detected automatically)
3. Before the first deploy, add the environment variables below
4. Deploy

`vercel.json` pins the region to **`bom1`** (Mumbai) so requests don't cross an
ocean, sets the security headers, and schedules the retention job.

### Environment variables

| Variable | Value | Notes |
|---|---|---|
| `DATABASE_URL` | from step 1 | pooled connection string |
| `AUTH_SECRET` | from step 2 | 32+ chars, changing it logs everyone out |
| `APP_URL` | `https://communityofemployees.com` | no trailing slash — verification links are built from this |
| `CRON_SECRET` | from step 2 | authenticates the nightly retention job |
| `SMTP_HOST` | `smtp.resend.com` | |
| `SMTP_PORT` | `465` | |
| `SMTP_USER` | `resend` | literally the word `resend` |
| `SMTP_PASSWORD` | your `re_...` key | |
| `SMTP_FROM` | `COE <noreply@communityofemployees.com>` | must be a **verified** Resend domain |
| `BCRYPT_ROUNDS` | `12` | |
| `GOOGLE_MAPS_API_KEY` | optional | without it, venues read "not rated yet" |
| `NEXT_PUBLIC_GOOGLE_MAPS_BROWSER_KEY` | optional | browser-side, restrict it by referrer |

`APP_URL` is the one people get wrong. Every verification and reset link is
built from it, so a stale value sends users to a dead address and signup
appears broken with nothing in the logs.

## 4. Migrate

Once, from your machine, against the hosted database:

```bash
DATABASE_URL='<the production URL>' npm run db:migrate
```

## 5. Create the first admin

```bash
DATABASE_URL='<the production URL>' \
ADMIN_EMAIL='you@communityofemployees.com' \
ADMIN_PASSWORD='<from step 2>' \
  npm run db:seed:production
```

### Do not run `npm run db:seed` against production

The development seed creates 241 accounts and all of them are wrong here: 116
pilot corporate placeholders, 124 venue accounts for real Gurgaon businesses
that never signed up, and 4 `.local` dev logins.

The public directory only lists **approved** vendors, so putting the venue list
in front of buyers means marking those accounts approved — an account nobody
owns, holding a password in a local file, able to submit a binding quote as
"The Irish House". A marketplace showing 124 vendors who cannot answer a bid is
worse than one showing five who can: the first buyer to award finds out the
supply was decoration.

Production starts empty and fills as real venues register and you approve them.
`data/venues.ts` is your outreach list, not your inventory.

## 6. Domain

Vercel → **Settings → Domains** → add `communityofemployees.com`.

It gives you either an A record or a nameserver change. In Hostinger's DNS,
add what it asks for.

**Leave your MX and TXT records alone.** Those carry email. Changing
nameservers moves *all* DNS, so if you go that route you must re-create the
Resend and Zoho records at the new provider first — otherwise email stops.

## 7. Email — the actual blocker

Signup sends a verification link. With no working SMTP that link only reaches
the server log, so **nobody outside can create an account**. The site will look
completely finished and be unusable.

1. Resend → **Domains** → add `communityofemployees.com`
2. Add the records it shows to Hostinger DNS
3. Wait for green, then set `SMTP_FROM` to `noreply@communityofemployees.com`

Until the domain verifies, Resend only delivers to your own account address —
which the work-email rule rejects at signup. So domain verification is not
optional even for testing.

---

## Verifying a deploy

1. Open the site — the landing page loads
2. `/vendors` — the directory responds (empty at first; that is correct)
3. Sign up with a **work-domain** address you can read — Gmail is rejected by
   design
4. The verification email arrives; the link signs you in
5. `/admin/login` with the account from step 5 — approve yourself
6. Post a requirement, and check the audit log recorded it

If step 4 fails, it is almost always `APP_URL` or an unverified Resend domain.

## After it is live

- **Rotate `AUTH_SECRET`** if it was ever pasted into a chat, screenshot or
  ticket. Everyone gets logged out; nothing else breaks.
- **Watch the first real signup end to end.** The gap between "the tests pass"
  and "a stranger got in" is where this kind of app fails.
- **Back up the database.** Neon and Supabase both do this; know your window.
- **CI runs on every PR** (`.github/workflows/ci.yml`): typecheck, build,
  migrations, 66 API checks and 33 browser checks against a real Postgres.
  Merging on a red tick is how the modal bug shipped the first time.

## Still not built

- **SMTP is configuration, not code** — nothing to write, only to set.
- **GSTIN document upload**: the column exists, the endpoint does not. Needs
  object storage; its own PR.
- **WhatsApp beyond the post-award link**: one transport in
  `lib/server/email.ts` covers every send if you add one.
- **Sports venues number 23, not 100.** Expanding that needs a real source
  list or a Places key — not invented names.
