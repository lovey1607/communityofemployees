'use client';
// The group-lead form. Three jobs: add a new listing, update one, remove one.
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, ApiError, describeApiError } from '@/lib/apiClient';
import type { CommunityInput } from '@/lib/communities/input';
import { CommunityForm, EMPTY_INPUT, fieldErrors } from '@/components/communities/CommunityForm';

type Opt = { slug: string; name: string; city: string };
type Kind = 'new' | 'update' | 'remove';

export function SubmitClient({ options }: { options: Opt[] }) {
  const sp = useSearchParams();
  const preset = sp.get('edit') ?? sp.get('remove');
  const [kind, setKind] = useState<Kind>(sp.get('remove') ? 'remove' : sp.get('edit') ? 'update' : 'new');
  const [target, setTarget] = useState<string>(preset ?? '');
  const [q, setQ] = useState('');
  const [form, setForm] = useState<CommunityInput>(structuredClone(EMPTY_INPUT));
  const [original, setOriginal] = useState<CommunityInput | null>(null);
  const [me, setMe] = useState({ submitterName: '', submitterEmail: '', submitterRole: 'organiser', message: '', website: '' });
  const [errs, setErrs] = useState<Record<string, string>>({});
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<Kind | null>(null);

  const matches = useMemo(() => {
    const n = q.trim().toLowerCase();
    return (n ? options.filter((o) => `${o.name} ${o.city}`.toLowerCase().includes(n)) : options).slice(0, 8);
  }, [q, options]);
  const targetOpt = options.find((o) => o.slug === target);

  useEffect(() => {
    if (kind !== 'update' || !target) { setOriginal(null); return; }
    api.get<{ input: CommunityInput }>(`/api/communities/lookup?slug=${encodeURIComponent(target)}`)
      .then((r) => { setForm(r.input); setOriginal(r.input); })
      .catch((e) => setErr(describeApiError(e)));
  }, [kind, target]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setErrs({});
    if (kind !== 'new' && !target) { setErr('Pick your listing first.'); return; }
    let payload: Record<string, unknown> | undefined;
    if (kind === 'new') payload = form as Record<string, unknown>;
    if (kind === 'update' && original) {
      payload = Object.fromEntries(Object.entries(form).filter(([k, v]) => JSON.stringify(v) !== JSON.stringify((original as Record<string, unknown>)[k])));
      if (!Object.keys(payload).length && !me.message.trim()) { setErr('Nothing has changed yet — edit a field or tell us what to change.'); return; }
    }
    setBusy(true);
    try {
      await api.post('/api/communities/submissions', { kind, targetSlug: kind === 'new' ? undefined : target, payload, ...me, message: me.message || undefined, website: me.website || undefined });
      setDone(kind);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e2) {
      if (e2 instanceof ApiError) setErrs(fieldErrors(e2.details));
      setErr(describeApiError(e2));
    } finally { setBusy(false); }
  };

  if (done) {
    return (
      <section className="cop-submit"><div className="wrap">
        <div className="panel sb-done">
          <span className="big">🎉</span>
          <h1>{done === 'new' ? 'Thanks — your community is in the queue.' : done === 'update' ? 'Thanks — we’ve got your changes.' : 'Got it — we’ll review the removal.'}</h1>
          <p className="cop-note">We review every request by hand, usually within a couple of days, and email {me.submitterEmail} if we have questions. Nothing changes on the site until we approve it.</p>
          <div className="row"><Link href="/communities" className="cop-btn cop-btn-primary">Back to communities</Link><button className="cop-btn" onClick={() => { setDone(null); setForm(structuredClone(EMPTY_INPUT)); setTarget(''); }}>Send another</button></div>
        </div>
      </div></section>
    );
  }

  return (
    <section className="cop-submit">
      <div className="wrap">
        <p className="cop-crumbs"><Link href="/communities">Communities</Link><span>/</span><span>For group leads</span></p>
        <h1 className="sb-h1">Run a group? <em>Keep it listed right.</em></h1>
        <p className="cop-note sb-lead">Free, always. Add your community, fix its details, or ask us to take it down. We check every request by hand before anything changes.</p>

        <div className="sb-tabs" role="tablist">
          {([['new', '➕ List a new community'], ['update', '✏️ Update my listing'], ['remove', '🗑️ Remove a listing']] as [Kind, string][]).map(([k, l]) => (
            <button key={k} type="button" role="tab" aria-selected={kind === k} className={kind === k ? 'on' : ''} onClick={() => { setKind(k); setErr(null); setErrs({}); if (k === 'new') { setForm(structuredClone(EMPTY_INPUT)); } }}>{l}</button>
          ))}
        </div>

        <form className="panel sb-panel" onSubmit={submit} noValidate>
          {kind !== 'new' && (
            <div className="sb-pick">
              <label>Which listing?
                {targetOpt ? (
                  <span className="chosen"><b>{targetOpt.name}</b> · {targetOpt.city} <button type="button" onClick={() => { setTarget(''); setOriginal(null); }}>change</button></span>
                ) : (
                  <>
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Start typing the group’s name…" autoFocus />
                    <ul>{matches.map((o) => <li key={o.slug}><button type="button" onClick={() => { setTarget(o.slug); setQ(''); }}>{o.name} <small>{o.city}</small></button></li>)}</ul>
                  </>
                )}
              </label>
            </div>
          )}

          {kind === 'new' && <CommunityForm value={form} onChange={setForm} mode="lead" errors={errs} />}
          {kind === 'update' && target && (original ? <><p className="cop-note">Edit anything that’s out of date — we’ll only look at what you change.</p><CommunityForm value={form} onChange={setForm} mode="lead" errors={errs} /></> : <p className="cop-note">Loading the current details…</p>)}

          <fieldset className="sb-me">
            <legend>About you</legend>
            <label>Your name *<input value={me.submitterName} onChange={(e) => setMe({ ...me, submitterName: e.target.value })} autoComplete="name" />{errs.submitterName && <span className="cf-err">{errs.submitterName}</span>}</label>
            <label>Email *<input type="email" value={me.submitterEmail} onChange={(e) => setMe({ ...me, submitterEmail: e.target.value })} autoComplete="email" />{errs.submitterEmail && <span className="cf-err">{errs.submitterEmail}</span>}</label>
            <label>You are the…
              <select value={me.submitterRole} onChange={(e) => setMe({ ...me, submitterRole: e.target.value })}>
                <option value="organiser">Organiser / founder</option><option value="co-organiser">Co-organiser / admin</option><option value="member">Member</option><option value="other">Other</option>
              </select>
            </label>
            <label className="w3">{kind === 'remove' ? 'Why should it come down?' : 'Anything else we should know?'}<textarea rows={3} value={me.message} onChange={(e) => setMe({ ...me, message: e.target.value })} placeholder={kind === 'remove' ? 'e.g. the group has shut down / we’d rather not be listed' : 'Optional'} /></label>
            <label className="hp" aria-hidden="true">Leave empty<input tabIndex={-1} autoComplete="off" value={me.website} onChange={(e) => setMe({ ...me, website: e.target.value })} /></label>
          </fieldset>

          {err && <p className="sb-err" role="alert">{err}</p>}
          <div className="row">
            <button type="submit" className="cop-btn cop-btn-primary" disabled={busy}>{busy ? 'Sending…' : kind === 'new' ? 'Submit for review' : kind === 'update' ? 'Send my changes' : 'Request removal'}</button>
            <span className="cop-note">We only use your email to reply about this request.</span>
          </div>
        </form>
      </div>
    </section>
  );
}
