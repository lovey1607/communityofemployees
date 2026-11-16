-- ════════════════════════════════════════════════════════════
-- 0003 — Community of People: listings that admins can manage, and
-- submissions from group leads (new listing / update / removal).
--
-- The 400+ researched listings still live in data/*.ts. A row here
-- OVERRIDES the static listing with the same slug (edit), adds a new
-- one (slug not in the static set), or hides it (status = 'hidden').
-- So the table starts empty and nothing on the public site changes
-- until an admin acts. No seed is needed in production.
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS communities (
  id             TEXT PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL,
  city           TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved','unverified','hidden')),
  pricing_type   TEXT NOT NULL DEFAULT 'unknown',
  join_platform  TEXT NOT NULL DEFAULT 'other',
  data           JSONB NOT NULL,
  origin         TEXT NOT NULL DEFAULT 'admin' CHECK (origin IN ('admin','lead')),
  updated_by     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS communities_city_idx ON communities (city);
CREATE INDEX IF NOT EXISTS communities_category_idx ON communities (category);
CREATE INDEX IF NOT EXISTS communities_status_idx ON communities (status);

CREATE TABLE IF NOT EXISTS community_submissions (
  id               TEXT PRIMARY KEY,
  kind             TEXT NOT NULL CHECK (kind IN ('new','update','remove')),
  target_slug      TEXT,
  payload          JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitter_name   TEXT NOT NULL,
  submitter_email  TEXT NOT NULL,
  submitter_role   TEXT NOT NULL DEFAULT 'organiser' CHECK (submitter_role IN ('organiser','co-organiser','member','other')),
  message          TEXT,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  review_note      TEXT,
  reviewed_by      TEXT,
  reviewed_at      TIMESTAMPTZ,
  ip               TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS community_submissions_status_idx ON community_submissions (status, created_at);
