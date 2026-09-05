#!/usr/bin/env bash
# ============================================================
# scripts/local-setup.sh — get the portal running on this machine.
#
#   ./scripts/local-setup.sh      then:  npm run dev
#
# Finds a Postgres you already have (or starts one), writes .env.local,
# installs, migrates and seeds. Safe to re-run: it never overwrites an
# existing .env.local or an existing database.
# ============================================================
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

bold() { printf "\033[1m%s\033[0m\n" "$1"; }
ok()   { printf "  \033[32m✓\033[0m %s\n" "$1"; }
die()  { printf "\n  \033[31m✗ %s\033[0m\n\n" "$1"; exit 1; }

bold "COE portal — local setup"
echo

# ── 1. Node ─────────────────────────────────────────────────
command -v node >/dev/null 2>&1 || die "Node.js is not installed. Get the LTS build from https://nodejs.org, then re-run this."
NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
[ "$NODE_MAJOR" -ge 20 ] || die "Node $(node -v) is too old — this needs Node 20 or newer. https://nodejs.org"
ok "Node $(node -v)"

# ── 2. Database ─────────────────────────────────────────────
DB_URL=""
if [ -f .env.local ] && grep -q '^DATABASE_URL=.\+' .env.local; then
  DB_URL="$(grep '^DATABASE_URL=' .env.local | head -1 | cut -d= -f2-)"
  ok "Using the DATABASE_URL already in .env.local"
elif [ -n "${DATABASE_URL:-}" ]; then
  DB_URL="$DATABASE_URL"
  ok "Using DATABASE_URL from your environment"
elif command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  if [ -z "$(docker ps -q -f name=^coe-postgres$)" ]; then
    if [ -n "$(docker ps -aq -f name=^coe-postgres$)" ]; then
      docker start coe-postgres >/dev/null
      ok "Restarted the coe-postgres container"
    else
      docker run -d --name coe-postgres -e POSTGRES_PASSWORD=coelocal \
        -e POSTGRES_DB=coe -p 5433:5432 postgres:16 >/dev/null
      ok "Started a Postgres 16 container (coe-postgres) on port 5433"
      printf "    waiting for it to accept connections"
      for _ in $(seq 1 40); do
        docker exec coe-postgres pg_isready -q >/dev/null 2>&1 && break
        printf "."; sleep 1
      done
      echo
    fi
  else
    ok "The coe-postgres container is already running"
  fi
  DB_URL="postgresql://postgres:coelocal@127.0.0.1:5433/coe"
elif command -v initdb >/dev/null 2>&1 && command -v pg_ctl >/dev/null 2>&1; then
  PGDATA="$ROOT/.localdb"
  if [ ! -d "$PGDATA" ]; then
    initdb -D "$PGDATA" -U postgres --auth=trust >/dev/null
    ok "Created a Postgres cluster in .localdb"
  fi
  # Keep the unix socket inside the project. The system default
  # (/var/run/postgresql) is not writable for a normal user on some setups,
  # and this keeps the whole cluster self-contained and easy to throw away.
  PGOPTS="-p 5433 -k $PGDATA"
  pg_ctl -D "$PGDATA" -o "$PGOPTS" -l "$PGDATA/server.log" status >/dev/null 2>&1 \
    || pg_ctl -D "$PGDATA" -o "$PGOPTS" -l "$PGDATA/server.log" start >/dev/null \
    || { echo; sed -n '$p' "$PGDATA/server.log" 2>/dev/null; die "Postgres would not start — see $PGDATA/server.log"; }
  sleep 2
  createdb -h 127.0.0.1 -p 5433 -U postgres coe 2>/dev/null || true
  ok "Local Postgres running on port 5433"
  DB_URL="postgresql://postgres@127.0.0.1:5433/coe"
else
  cat <<'NODB'

  No PostgreSQL found. Pick whichever is least hassle:

    A. Postgres.app   — download from https://postgresapp.com, open it,
                        click Initialize, then re-run this script.

    B. Docker Desktop — https://docker.com/products/docker-desktop
                        start it, then re-run this script.

    C. A free cloud database — sign up at https://neon.tech, copy the
       connection string, and re-run with it:

         DATABASE_URL='postgresql://...' ./scripts/local-setup.sh

NODB
  die "Need a database before we can go further."
fi

# ── 3. .env.local ───────────────────────────────────────────
if [ ! -f .env.local ]; then
  SECRET="$(node -e 'console.log(require("crypto").randomBytes(32).toString("hex"))')"
  cat > .env.local <<ENVEOF
DATABASE_URL=$DB_URL
AUTH_SECRET=$SECRET
APP_URL=http://localhost:3000
BCRYPT_ROUNDS=10
ENVEOF
  ok "Wrote .env.local (AUTH_SECRET generated — the file is gitignored)"
else
  ok ".env.local already exists, leaving it alone"
fi

# ── 4. Seed credentials you can actually read later ─────────
mkdir -p seed
if [ ! -f seed/fixtures.json ]; then
  node -e '
    const { randomBytes } = require("crypto");
    const pw = () => randomBytes(9).toString("base64url") + "!7";
    const fixtures = {
      seedVenueVendors: true,
      venueEmailDomain: "coe-dev.local",
      accounts: [
        { email: "admin@coe-dev.local", password: pw(), role: "admin" },
        { email: "priya@nexus-dev.local", password: pw(), role: "corporate",
          companyName: "Nexus Technologies", city: "Gurugram" },
        { email: "ops@royalfeast-dev.local", password: pw(), role: "vendor",
          companyName: "Royal Feast Caterers", category: "food",
          city: "Gurugram", gstNumber: "06AAACD1234A1ZL" },
      ],
    };
    require("fs").writeFileSync("seed/fixtures.json", JSON.stringify(fixtures, null, 2) + "\n");
  '
  ok "Generated seed/fixtures.json with local passwords (gitignored)"
else
  ok "seed/fixtures.json already exists, keeping your passwords"
fi

# ── 5. Install, migrate, seed ───────────────────────────────
echo
bold "Installing dependencies (this one takes a minute)"
npm install --no-audit --no-fund
echo
bold "Setting up the database"
npm run db:migrate
npm run db:seed >/dev/null

# ── 6. Done ─────────────────────────────────────────────────
echo
bold "Ready. Start it with:"
echo
echo "    npm run dev          → http://localhost:3000"
echo
bold "Your local logins"
node -e '
  const f = require("./seed/fixtures.json");
  const pad = (s, n) => String(s).padEnd(n);
  for (const a of f.accounts) {
    console.log("    " + pad(a.role, 11) + pad(a.email, 30) + a.password);
  }
  console.log("\n    (also in seed/fixtures.json — gitignored, never committed)");
'
cat <<'TIP'

  Two things that would otherwise confuse you:

  · A brand-new signup needs an email confirmation, and there is no SMTP
    configured locally — so the link is PRINTED IN THE TERMINAL running
    `npm run dev`. Copy the /verify-email?token=... line into your browser.
    Or just use the seeded logins above; they are already approved.

  · The admin side is at http://localhost:3000/admin/login — deliberately
    not linked from anywhere public.

TIP
