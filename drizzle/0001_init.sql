-- ============================================================
-- COE Portal — initial schema
-- PostgreSQL 14+. Applied by `npm run db:migrate` (scripts/migrate.ts).
-- Status/role/category values are stored as TEXT with CHECK constraints
-- rather than PG enums so they can be extended without a type migration.
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id                  TEXT PRIMARY KEY,
  email               TEXT NOT NULL,
  email_normalized    TEXT NOT NULL,
  email_domain        TEXT NOT NULL,
  role                TEXT NOT NULL CHECK (role IN ('corporate', 'vendor', 'admin')),
  password_hash       TEXT NOT NULL,
  email_verified_at   TIMESTAMPTZ,
  approval_status     TEXT NOT NULL DEFAULT 'pending'
                        CHECK (approval_status IN ('pending', 'approved', 'rejected')),
  approved_at         TIMESTAMPTZ,
  approved_by         TEXT,
  rejection_reason    TEXT,
  is_suspended        BOOLEAN NOT NULL DEFAULT FALSE,
  failed_login_count  INTEGER NOT NULL DEFAULT 0,
  locked_until        TIMESTAMPTZ,
  password_changed_at TIMESTAMPTZ,
  deleted_at          TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Partial unique index: a soft-deleted account frees its address for re-use.
CREATE UNIQUE INDEX IF NOT EXISTS users_email_normalized_active_idx
  ON users (email_normalized) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS users_role_idx ON users (role);
CREATE INDEX IF NOT EXISTS users_approval_status_idx ON users (approval_status);

-- ─── One-time tokens (email verification + password reset) ───
CREATE TABLE IF NOT EXISTS auth_tokens (
  id          TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash  TEXT NOT NULL UNIQUE,
  purpose     TEXT NOT NULL CHECK (purpose IN ('email_verify', 'password_reset')),
  expires_at  TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS auth_tokens_user_purpose_idx ON auth_tokens (user_id, purpose);

-- ─── Server-side sessions (opaque token, hashed at rest) ─────
CREATE TABLE IF NOT EXISTS sessions (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash   TEXT NOT NULL UNIQUE,
  expires_at   TIMESTAMPTZ NOT NULL,
  revoked_at   TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  user_agent   TEXT,
  ip           TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions (user_id);
CREATE INDEX IF NOT EXISTS sessions_expires_idx ON sessions (expires_at);

-- ─── Corporate (employee) profiles ───────────────────────────
CREATE TABLE IF NOT EXISTS corporate_profiles (
  id                        TEXT PRIMARY KEY,
  user_id                   TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name                      TEXT NOT NULL DEFAULT '',
  mobile                    TEXT NOT NULL DEFAULT '',
  email                     TEXT NOT NULL,
  office_company_name       TEXT NOT NULL DEFAULT '',
  office_address            TEXT NOT NULL DEFAULT '',
  city                      TEXT NOT NULL DEFAULT '',
  position                  TEXT NOT NULL DEFAULT '',
  department                TEXT NOT NULL DEFAULT '',
  cin_number                TEXT,
  team_size                 TEXT,
  annual_procurement_budget TEXT,
  is_completed              BOOLEAN NOT NULL DEFAULT FALSE,
  place_id                  TEXT,
  lat                       DOUBLE PRECISION,
  lng                       DOUBLE PRECISION,
  submitted_at              TIMESTAMPTZ,
  created_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Vendor profiles ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_profiles (
  id                    TEXT PRIMARY KEY,
  user_id               TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  category              TEXT NOT NULL CHECK (category IN ('sports','food','trips','gifts','dress')),
  extra_categories      JSONB NOT NULL DEFAULT '[]'::jsonb,
  service_areas         JSONB NOT NULL DEFAULT '[]'::jsonb,
  vendor_name           TEXT NOT NULL DEFAULT '',
  company_name          TEXT NOT NULL DEFAULT '',
  mobile                TEXT NOT NULL DEFAULT '',
  company_mobile        TEXT NOT NULL DEFAULT '',
  address               TEXT NOT NULL DEFAULT '',
  city                  TEXT NOT NULL DEFAULT '',
  locality              TEXT,
  distance_km           DOUBLE PRECISION NOT NULL DEFAULT 0,
  entity_type           TEXT,
  pan_number            TEXT,
  gst_number            TEXT NOT NULL DEFAULT '',
  gst_verified          BOOLEAN NOT NULL DEFAULT FALSE,
  gst_document_path     TEXT,
  portfolio_summary     TEXT,
  corporate_suitability TEXT,
  past_clients          JSONB NOT NULL DEFAULT '[]'::jsonb,
  amenities             JSONB NOT NULL DEFAULT '[]'::jsonb,
  photos                JSONB NOT NULL DEFAULT '[]'::jsonb,
  timings               TEXT,
  avg_cost_per_person   INTEGER,
  is_completed          BOOLEAN NOT NULL DEFAULT FALSE,
  place_id              TEXT,
  formatted_address     TEXT,
  place_name            TEXT,
  lat                   DOUBLE PRECISION,
  lng                   DOUBLE PRECISION,
  rating                DOUBLE PRECISION,
  user_ratings_total    INTEGER,
  submitted_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS vendor_profiles_category_idx ON vendor_profiles (category);
CREATE INDEX IF NOT EXISTS vendor_profiles_city_idx ON vendor_profiles (city);

-- ─── RFPs ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rfps (
  id               TEXT PRIMARY KEY,
  corporate_id     TEXT NOT NULL REFERENCES corporate_profiles(id) ON DELETE CASCADE,
  corporate_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name     TEXT NOT NULL,
  category         TEXT NOT NULL CHECK (category IN ('sports','food','trips','gifts','dress')),
  occasion         TEXT,
  category_details JSONB NOT NULL DEFAULT '{}'::jsonb,
  universal        JSONB NOT NULL DEFAULT '{}'::jsonb,
  service_area     TEXT,
  total_budget     INTEGER NOT NULL DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'open'
                     CHECK (status IN ('draft','open','bid-received','awarded','completed','cancelled','closed')),
  bid_visibility   TEXT NOT NULL DEFAULT 'masked'
                     CHECK (bid_visibility IN ('masked','open')),
  accepted_bid_id  TEXT,
  awarded_at       TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  submitted_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at       TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS rfps_status_idx ON rfps (status);
CREATE INDEX IF NOT EXISTS rfps_category_idx ON rfps (category);
CREATE INDEX IF NOT EXISTS rfps_corporate_user_idx ON rfps (corporate_user_id);

-- ─── Bids ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS bids (
  id             TEXT PRIMARY KEY,
  rfp_id         TEXT NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
  vendor_id      TEXT NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  vendor_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_price    INTEGER NOT NULL,
  line_items     JSONB NOT NULL DEFAULT '[]'::jsonb,
  proposal       TEXT NOT NULL DEFAULT '',
  valid_until    TIMESTAMPTZ,
  distance_km    DOUBLE PRECISION NOT NULL DEFAULT 0,
  match_percentage INTEGER NOT NULL DEFAULT 0,
  status         TEXT NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending','accepted','rejected','withdrawn')),
  submitted_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revised_at     TIMESTAMPTZ,
  deleted_at     TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- One live bid per vendor per RFP (revisions update the row in place).
CREATE UNIQUE INDEX IF NOT EXISTS bids_rfp_vendor_active_idx
  ON bids (rfp_id, vendor_user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS bids_rfp_idx ON bids (rfp_id);
CREATE INDEX IF NOT EXISTS bids_vendor_user_idx ON bids (vendor_user_id);

ALTER TABLE rfps DROP CONSTRAINT IF EXISTS rfps_accepted_bid_fk;
ALTER TABLE rfps ADD CONSTRAINT rfps_accepted_bid_fk
  FOREIGN KEY (accepted_bid_id) REFERENCES bids(id) ON DELETE SET NULL;

-- ─── Post-event vendor reviews ───────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id             TEXT PRIMARY KEY,
  rfp_id         TEXT NOT NULL REFERENCES rfps(id) ON DELETE CASCADE,
  bid_id         TEXT NOT NULL REFERENCES bids(id) ON DELETE CASCADE,
  vendor_id      TEXT NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
  author_user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating         INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment        TEXT NOT NULL DEFAULT '',
  is_hidden      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS vendor_reviews_rfp_author_idx ON vendor_reviews (rfp_id, author_user_id);
CREATE INDEX IF NOT EXISTS vendor_reviews_vendor_idx ON vendor_reviews (vendor_id);

-- ─── Admin-managed allow/deny list for signup email domains ──
CREATE TABLE IF NOT EXISTS email_domain_rules (
  domain     TEXT PRIMARY KEY,
  rule       TEXT NOT NULL CHECK (rule IN ('allow', 'block')),
  note       TEXT,
  created_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Audit log ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id           TEXT PRIMARY KEY,
  actor_id     TEXT REFERENCES users(id) ON DELETE SET NULL,
  actor_email  TEXT,
  actor_role   TEXT,
  action       TEXT NOT NULL,
  entity_type  TEXT NOT NULL,
  entity_id    TEXT,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip           TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS audit_logs_created_idx ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_entity_idx ON audit_logs (entity_type, entity_id);

-- ─── Rate limiting (fixed window counters, survives serverless) ──
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket       TEXT PRIMARY KEY,
  window_start TIMESTAMPTZ NOT NULL,
  count        INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON rate_limits (window_start);
