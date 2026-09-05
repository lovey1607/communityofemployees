// ============================================================
// lib/server/match.ts — how well a bid answers the requirement.
//
// The old score was one line: how close the price was to the stated budget.
// That made "match" a synonym for "cheapest", which the price column already
// tells you, and it quietly rewarded a vendor for guessing the budget rather
// than for being right for the job.
//
// This scores the things a buyer actually weighs before awarding, and — the
// part that matters — returns the reasons alongside the number. A score with
// no breakdown is a number someone has to trust; a score with a breakdown is
// one they can argue with, which is the point when real money follows it.
//
// Every factor degrades to neutral when the underlying data is missing. A
// vendor who hasn't filled in a capacity or a service area is not penalised
// as though they'd failed it — they simply don't earn that factor's bonus.
// ============================================================

export interface MatchFactor {
  key: 'price' | 'distance' | 'capacity' | 'requirements' | 'track-record';
  label: string;
  /** 0..1 within this factor. */
  score: number;
  /** Share of the final score this factor can move. */
  weight: number;
  /** One line the buyer can read. */
  detail: string;
}

export interface MatchResult {
  /** 0..100, rounded. */
  percentage: number;
  factors: MatchFactor[];
}

export interface MatchInput {
  budget: number;
  bidPrice: number;
  headcount: number;
  /** Free-form requirement selections from the RFP's category step. */
  requirements: Record<string, unknown>;
  distanceKm: number | null;
  vendor: {
    amenities: string[] | null;
    avgCostPerPerson: number | null;
    serviceAreas: string[] | null;
    locality: string | null;
    completedEvents: number;
    averageRating: number | null;
    ratingCount: number;
  };
  serviceArea: string | null;
}

/** Flattens the RFP's category answers into comparable lowercase tokens. */
function requirementTokens(requirements: Record<string, unknown>): string[] {
  const out: string[] = [];
  const walk = (value: unknown) => {
    if (typeof value === 'string') out.push(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(requirements);
  return out
    .flatMap((v) => v.toLowerCase().split(/[^a-z0-9]+/))
    .filter((w) => w.length > 3);
}

export function scoreBid(input: MatchInput): MatchResult {
  const factors: MatchFactor[] = [];

  // ── Price, 35% ────────────────────────────────────────────
  // Under budget is good but not linearly: a quote at half the stated budget
  // is usually a misunderstanding of the brief, not a bargain, so the curve
  // stops rewarding below ~70% and starts reading as an outlier.
  const ratio = input.budget > 0 ? input.bidPrice / input.budget : 1;
  let priceScore: number;
  let priceDetail: string;
  if (ratio <= 0.6) {
    priceScore = 0.55;
    priceDetail = `${Math.round((1 - ratio) * 100)}% under budget — worth checking the scope covers everything`;
  } else if (ratio <= 1) {
    priceScore = 1;
    priceDetail =
      ratio === 1 ? 'Exactly on budget' : `${Math.round((1 - ratio) * 100)}% under your budget`;
  } else if (ratio <= 1.25) {
    priceScore = 1 - (ratio - 1) / 0.25;
    priceDetail = `${Math.round((ratio - 1) * 100)}% over budget`;
  } else {
    priceScore = 0;
    priceDetail = `${Math.round((ratio - 1) * 100)}% over budget`;
  }
  factors.push({ key: 'price', label: 'Price against budget', score: priceScore, weight: 35, detail: priceDetail });

  // ── Distance / service area, 20% ──────────────────────────
  let distScore = 0.5;
  let distDetail = 'Distance unknown — neither side has set a location';
  if (input.distanceKm != null) {
    distScore = input.distanceKm <= 5 ? 1 : input.distanceKm <= 12 ? 0.8 : input.distanceKm <= 25 ? 0.55 : 0.25;
    distDetail = `${input.distanceKm.toFixed(1)} km from your office`;
  }
  if (input.serviceArea && input.vendor.serviceAreas?.length) {
    const covers = input.vendor.serviceAreas.some(
      (a) => a.toLowerCase().includes(input.serviceArea!.toLowerCase()) ||
        input.serviceArea!.toLowerCase().includes(a.toLowerCase())
    );
    if (covers) {
      distScore = Math.max(distScore, 0.9);
      distDetail += ` · covers ${input.serviceArea}`;
    }
  }
  factors.push({ key: 'distance', label: 'Location', score: distScore, weight: 20, detail: distDetail });

  // ── Capacity, 15% ─────────────────────────────────────────
  // Uses the vendor's own per-head figure as a sanity check on whether an
  // event this size is their usual shape of work.
  let capScore = 0.5;
  let capDetail = 'Vendor has not set a typical per-head spend';
  if (input.vendor.avgCostPerPerson && input.headcount > 0) {
    const perHead = input.bidPrice / input.headcount;
    const drift = Math.abs(perHead - input.vendor.avgCostPerPerson) / input.vendor.avgCostPerPerson;
    capScore = drift <= 0.25 ? 1 : drift <= 0.6 ? 0.7 : 0.4;
    capDetail = `₹${Math.round(perHead).toLocaleString('en-IN')}/head vs their usual ₹${input.vendor.avgCostPerPerson.toLocaleString('en-IN')}`;
  }
  factors.push({ key: 'capacity', label: 'Fit for this size', score: capScore, weight: 15, detail: capDetail });

  // ── Stated requirements, 20% ──────────────────────────────
  const tokens = requirementTokens(input.requirements);
  const amenities = (input.vendor.amenities ?? []).join(' ').toLowerCase();
  let reqScore = 0.5;
  let reqDetail = 'No specific requirements to match against';
  if (tokens.length > 0) {
    const unique = [...new Set(tokens)];
    const hit = unique.filter((t) => amenities.includes(t));
    reqScore = amenities ? Math.min(1, 0.4 + (hit.length / unique.length) * 1.2) : 0.4;
    reqDetail = amenities
      ? `Matches ${hit.length} of ${unique.length} things you asked for`
      : 'Vendor has not listed their facilities yet';
  }
  factors.push({ key: 'requirements', label: 'Your requirements', score: reqScore, weight: 20, detail: reqDetail });

  // ── Track record on COE, 10% ──────────────────────────────
  // Only counts work completed and rated *on the platform*. Nothing here is
  // imported or assumed, so a new vendor sits at neutral rather than being
  // marked down for having no history yet.
  let recScore = 0.5;
  let recDetail = 'No completed events on COE yet';
  if (input.vendor.completedEvents > 0) {
    const volume = Math.min(1, input.vendor.completedEvents / 5);
    const quality = input.vendor.averageRating != null ? (input.vendor.averageRating - 1) / 4 : 0.6;
    recScore = 0.5 + (volume * 0.25 + quality * 0.25);
    recDetail = `${input.vendor.completedEvents} completed on COE` +
      (input.vendor.ratingCount > 0 && input.vendor.averageRating != null
        ? ` · ${input.vendor.averageRating.toFixed(1)}★ from ${input.vendor.ratingCount}`
        : ' · not rated yet');
  }
  factors.push({ key: 'track-record', label: 'Track record here', score: recScore, weight: 10, detail: recDetail });

  const total = factors.reduce((sum, f) => sum + f.score * f.weight, 0);
  return { percentage: Math.round(Math.max(0, Math.min(100, total))), factors };
}
