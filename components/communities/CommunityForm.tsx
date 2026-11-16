'use client';
// components/communities/CommunityForm.tsx — one form for a listing, used
// by admins (/admin/communities) and by group leads (/communities/submit).
// Leads don't see status/featured; everything else is the same.
import { CATEGORY_META, PLATFORM_LABEL, type CommunityCategory } from '@/lib/communities';
import { CATEGORIES, CITIES, PLATFORMS, type CommunityInput } from '@/lib/communities/input';
import './community-form.css';

export const EMPTY_INPUT: CommunityInput = {
  name: '', tagline: '', description: '', category: 'social', tags: [], city: 'Gurgaon', area: '',
  meets: { cadence: 'weekly', summary: '' }, audience: { gender: 'all', ageNote: '', level: 'all' },
  pricing: { type: 'free', note: '' }, size: { bucket: 'unknown', note: '' }, hasEvents: true, mode: 'offline', ageBand: null,
  join: { url: '', platform: 'whatsapp', cta: 'Join WhatsApp group' }, links: {}, imageUrl: '', status: 'approved', featured: false,
};

const CTA: Partial<Record<string, string>> = { whatsapp: 'Join WhatsApp group', telegram: 'Join on Telegram', instagram: 'Follow on Instagram', meetup: 'RSVP on Meetup', discord: 'Join Discord', website: 'Visit website', reddit: 'Open subreddit', facebook: 'Open Facebook group', luma: 'RSVP on Luma' };

type Props = { value: CommunityInput; onChange: (v: CommunityInput) => void; mode: 'admin' | 'lead'; errors?: Record<string, string> };

export function CommunityForm({ value: v, onChange, mode, errors = {} }: Props) {
  const set = <K extends keyof CommunityInput>(k: K, val: CommunityInput[K]) => onChange({ ...v, [k]: val });
  const sub = <K extends 'meets' | 'audience' | 'pricing' | 'size' | 'join' | 'links'>(k: K, patch: Partial<NonNullable<CommunityInput[K]>>) =>
    onChange({ ...v, [k]: { ...(v[k] as object), ...patch } });
  const err = (k: string) => errors[k] ? <span className="cf-err">{errors[k]}</span> : null;
  const meets = v.meets ?? { cadence: 'unknown' as const, summary: '' };
  const aud = v.audience ?? { gender: 'all' as const, ageNote: '', level: 'all' as const };
  const pr = v.pricing ?? { type: 'unknown' as const, note: '' };
  const size = v.size ?? { bucket: 'unknown' as const, note: '' };
  const links = v.links ?? {};

  return (
    <div className="cf">
      <fieldset>
        <legend>Basics</legend>
        <label className="w2">Community name *<input value={v.name} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Gurgaon Sunday Runners" />{err('name')}</label>
        <label className="w2">One-line description *<input value={v.tagline} onChange={(e) => set('tagline', e.target.value)} placeholder="Sunday 6am 5K at Leisure Valley. Beginners welcome." maxLength={160} />{err('tagline')}</label>
        <label>Category *
          <select value={v.category} onChange={(e) => set('category', e.target.value as CommunityCategory)}>
            {CATEGORIES.map((k) => <option key={k} value={k}>{CATEGORY_META[k].label}</option>)}
          </select>
        </label>
        <label>City *
          <select value={v.city} onChange={(e) => set('city', e.target.value)}>
            {CITIES.map((c) => <option key={c} value={c}>{c === 'Online' ? 'Online / pan-India' : c}</option>)}
          </select>{err('city')}
        </label>
        <label>Area / venue<input value={v.area ?? ''} onChange={(e) => set('area', e.target.value)} placeholder="Leisure Valley Park, Sector 29" /></label>
        <label>Tags <small>(comma separated)</small><input value={(v.tags ?? []).join(', ')} onChange={(e) => set('tags', e.target.value.split(',').map((t) => t.trim()).filter(Boolean))} placeholder="5k, beginner-friendly, sunday" /></label>
        <label className="w2">More about it<textarea rows={3} value={v.description ?? ''} onChange={(e) => set('description', e.target.value)} placeholder="What happens at a meetup, who it suits, anything people should know." /></label>
      </fieldset>

      <fieldset>
        <legend>How people join</legend>
        <label>Platform *
          <select value={v.join.platform} onChange={(e) => sub('join', { platform: e.target.value as typeof PLATFORMS[number], cta: CTA[e.target.value] ?? v.join.cta })}>
            {PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABEL[p]}</option>)}
          </select>
        </label>
        <label className="w2">Join link *<input value={v.join.url} onChange={(e) => sub('join', { url: e.target.value })} placeholder="https://chat.whatsapp.com/… or https://instagram.com/…" inputMode="url" />{err('join.url')}</label>
        <label>Button text<input value={v.join.cta ?? ''} onChange={(e) => sub('join', { cta: e.target.value })} /></label>
        <label>Format
          <select value={v.mode} onChange={(e) => set('mode', e.target.value as 'offline' | 'online' | 'hybrid')}>
            <option value="offline">In person</option><option value="hybrid">In person + online</option><option value="online">Online only</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>When & how much</legend>
        <label>How often
          <select value={meets.cadence} onChange={(e) => sub('meets', { cadence: e.target.value as typeof meets.cadence })}>
            <option value="weekly">Weekly</option><option value="fortnightly">Fortnightly</option><option value="monthly">Monthly</option><option value="irregular">Pop-up / irregular</option><option value="unknown">Not sure</option>
          </select>
        </label>
        <label className="w2">Schedule<input value={meets.summary ?? ''} onChange={(e) => sub('meets', { summary: e.target.value })} placeholder="Sundays 6am, Leisure Valley gate 2" /></label>
        <label>Price
          <select value={pr.type} onChange={(e) => sub('pricing', { type: e.target.value as typeof pr.type })}>
            <option value="free">Free</option><option value="pay-per-event">Pay per event</option><option value="membership">Membership / premium</option><option value="paid">Paid</option><option value="unknown">Ask organiser</option>
          </select>
        </label>
        <label className="w2">Price note<input value={pr.note ?? ''} onChange={(e) => sub('pricing', { note: e.target.value })} placeholder="₹300 per session · first one free" /></label>
        <label>Group size
          <select value={size.bucket} onChange={(e) => sub('size', { bucket: e.target.value as typeof size.bucket })}>
            <option value="unknown">Not sure</option><option value="<50">Under 50</option><option value="50–200">50–200</option><option value="200–1000">200–1,000</option><option value="1000+">1,000+</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Who it’s for</legend>
        <label>Open to
          <select value={aud.gender} onChange={(e) => sub('audience', { gender: e.target.value as typeof aud.gender })}>
            <option value="all">Everyone</option><option value="women">Women only</option><option value="men">Men only</option>
          </select>
        </label>
        <label>Level
          <select value={aud.level} onChange={(e) => sub('audience', { level: e.target.value as typeof aud.level })}>
            <option value="all">All levels</option><option value="beginner">Beginner-friendly</option><option value="advanced">Experienced</option>
          </select>
        </label>
        <label>Age focus <small>(only if you state one)</small>
          <select value={v.ageBand ?? ''} onChange={(e) => set('ageBand', (e.target.value || null) as CommunityInput['ageBand'])}>
            <option value="">None</option><option value="genz">Gen Z</option><option value="millennial">Millennials</option><option value="50plus">50+</option>
          </select>
        </label>
      </fieldset>

      <fieldset>
        <legend>Other links & photo <small>(optional)</small></legend>
        {(['instagram', 'website', 'whatsapp', 'meetup', 'facebook'] as const).map((k) => (
          <label key={k}>{PLATFORM_LABEL[k]}<input value={(links as Record<string, string | undefined>)[k] ?? ''} onChange={(e) => sub('links', { [k]: e.target.value })} placeholder="https://…" inputMode="url" /></label>
        ))}
        <label className="w2">Group photo / logo link<input value={v.imageUrl ?? ''} onChange={(e) => set('imageUrl', e.target.value)} placeholder="https://… (an image you own or have permission to use)" inputMode="url" /></label>
      </fieldset>

      {mode === 'admin' && (
        <fieldset>
          <legend>Publishing</legend>
          <label>Status
            <select value={v.status ?? 'approved'} onChange={(e) => set('status', e.target.value as CommunityInput['status'])}>
              <option value="approved">Verified (active)</option><option value="unverified">Unverified</option><option value="hidden">Hidden</option>
            </select>
          </label>
          <label className="chk"><input type="checkbox" checked={!!v.featured} onChange={(e) => set('featured', e.target.checked)} /> Featured</label>
        </fieldset>
      )}
    </div>
  );
}

/** Map API validation errors ("join.url: …") to field keys. */
export function fieldErrors(details: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (Array.isArray(details)) for (const d of details as { path?: string; message?: string }[]) if (d.path) out[d.path] = d.message ?? 'Check this';
  return out;
}
