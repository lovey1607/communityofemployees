-- ════════════════════════════════════════════════════════════
-- 0002 — store the reasoning behind a bid's match score.
--
-- match_percentage on its own is a number the buyer has to take on faith.
-- Keeping the per-factor breakdown alongside it means the comparison screen
-- can show WHY one bid scores higher than another, and means a score stays
-- explainable later, when the weights have since changed.
-- ════════════════════════════════════════════════════════════

ALTER TABLE bids ADD COLUMN IF NOT EXISTS match_factors JSONB NOT NULL DEFAULT '[]'::jsonb;
