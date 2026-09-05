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

# ── 2. Dependencies ─────────────────────────────────────────
# Before the database, so that a later prune cannot remove anything we set up.
if [ ! -d node_modules ]; then
  bold "Installing dependencies (this one takes a minute)"
  npm install --no-audit --no-fund
  echo
else
  ok "Dependencies already installed"
fi

# ── 3. Database ─────────────────────────────────────────────
# Order of preference: something you already have, then Docker, then a
# PostgreSQL installed on this machine, and finally a private copy of
# PostgreSQL fetched through npm — so this works with nothing but Node.
DB_URL=""
PGPORT=5433

start_cluster() {           # $1 = directory holding initdb/pg_ctl
  local BIN="$1"
  local PGDATA="$ROOT/.localdb"
  # PG_VERSION is what initdb writes last; an empty or half-made directory
  # is not a cluster, and initdb refuses to run into one either way.
  if [ ! -f "$PGDATA/PG_VERSION" ]; then
    mkdir -p "$PGDATA"
    "$BIN/initdb" -D "$PGDATA" -U postgres --auth=trust >/dev/null
    ok "Created a PostgreSQL cluster in .localdb"
  fi
  # Keep the socket inside the project: the system socket directory is not
  # writable for a normal user on some machines, and this keeps the whole
  # cluster self-contained and disposable.
  local PGOPTS="-p $PGPORT -k $PGDATA"
  if ! "$BIN/pg_ctl" -D "$PGDATA" -o "$PGOPTS" -l "$PGDATA/server.log" status >/dev/null 2>&1; then
    "$BIN/pg_ctl" -D "$PGDATA" -o "$PGOPTS" -l "$PGDATA/server.log" -w start >/dev/null 2>&1 \
      || { echo; tail -3 "$PGDATA/server.log" 2>/dev/null; die "PostgreSQL would not start — see .localdb/server.log"; }
  fi
  ok "PostgreSQL running on port $PGPORT (stop it with: npm run db:stop)"
  # initdb always creates a database called postgres; using it avoids needing
  # createdb, which the npm-fetched build does not ship.
  DB_URL="postgresql://postgres@127.0.0.1:$PGPORT/postgres"
}

# Where a system PostgreSQL might be hiding on macOS.
find_system_pg() {
  local d
  for d in "$(dirname "$(command -v pg_ctl 2>/dev/null || echo /nonexistent/x)")" \
           /Applications/Postgres.app/Contents/Versions/latest/bin \
           /opt/homebrew/bin /usr/local/bin /opt/homebrew/opt/postgresql@16/bin; do
    if [ -x "$d/pg_ctl" ] && [ -x "$d/initdb" ]; then echo "$d"; return 0; fi
  done
  return 1
}

# Where the npm-fetched build lands. It is deliberately installed OUTSIDE the
# project's node_modules — a later `npm install` prunes anything not listed in
# package.json, which would throw the database binaries away.
PG_HOME="$ROOT/.pgsql"
find_bundled_pg() {
  local d
  for d in "$PG_HOME"/node_modules/@embedded-postgres/*/native/bin; do
    if [ -x "$d/pg_ctl" ] && [ -x "$d/initdb" ]; then echo "$d"; return 0; fi
  done
  return 1
}

if [ -f .env.local ] && grep -q '^DATABASE_URL=.\+' .env.local; then
  DB_URL="$(grep '^DATABASE_URL=' .env.local | head -1 | cut -d= -f2-)"
  ok "Using the DATABASE_URL already in .env.local"
  # A cluster we made earlier needs starting again after a reboot.
  if printf '%s' "$DB_URL" | grep -q "127.0.0.1:$PGPORT" && [ -d "$ROOT/.localdb" ]; then
    if BIN="$(find_bundled_pg || find_system_pg)"; then
      "$BIN/pg_ctl" -D "$ROOT/.localdb" -o "-p $PGPORT -k $ROOT/.localdb" \
        -l "$ROOT/.localdb/server.log" -w start >/dev/null 2>&1 && ok "Restarted your local PostgreSQL" || true
    fi
  fi

elif [ -n "${DATABASE_URL:-}" ]; then
  DB_URL="$DATABASE_URL"
  ok "Using DATABASE_URL from your environment"

elif command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  if [ -n "$(docker ps -q -f name=^coe-postgres$)" ]; then
    ok "The coe-postgres container is already running"
  elif [ -n "$(docker ps -aq -f name=^coe-postgres$)" ]; then
    docker start coe-postgres >/dev/null
    ok "Restarted the coe-postgres container"
  else
    docker run -d --name coe-postgres -e POSTGRES_PASSWORD=coelocal \
      -e POSTGRES_DB=coe -p $PGPORT:5432 postgres:16 >/dev/null
    ok "Started a PostgreSQL 16 container (coe-postgres) on port $PGPORT"
    printf "    waiting for it to accept connections"
    for _ in $(seq 1 40); do
      docker exec coe-postgres pg_isready -q >/dev/null 2>&1 && break
      printf "."; sleep 1
    done
    echo
  fi
  DB_URL="postgresql://postgres:coelocal@127.0.0.1:$PGPORT/coe"

elif BIN="$(find_system_pg)"; then
  ok "Found PostgreSQL at $BIN"
  start_cluster "$BIN"

else
  if ! BIN="$(find_bundled_pg)"; then
    bold "No PostgreSQL on this machine — fetching a private copy"
    echo "  (about 100 MB, used only by this project, removed with node_modules)"
    echo
    mkdir -p "$PG_HOME"
    npm install --prefix "$PG_HOME" --no-audit --no-fund embedded-postgres >/dev/null 2>&1 \
      || die "Could not fetch PostgreSQL. Check your internet connection, or install Postgres.app from https://postgresapp.com and re-run."
    BIN="$(find_bundled_pg)" || die "The PostgreSQL download did not include binaries for this platform. Install Postgres.app from https://postgresapp.com and re-run."
    ok "Fetched PostgreSQL"
  fi
  start_cluster "$BIN"
fi

# ── 4. .env.local ───────────────────────────────────────────
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

# ── 5. Seed credentials you can actually read later ─────────
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

# ── 6. Migrate and seed ─────────────────────────────────────
echo
bold "Setting up the database"
npm run db:migrate
npm run db:seed >/dev/null

# ── 7. Done ─────────────────────────────────────────────────
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
