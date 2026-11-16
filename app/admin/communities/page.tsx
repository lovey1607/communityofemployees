'use client';
// ============================================================
// app/admin/communities/page.tsx — manage Community of People listings.
//   Listings: filter (category, free/paid, platform, city, status, source),
//             add, edit, hide/unhide, revert to researched version, delete.
//   Requests: group leads' new / update / remove requests → approve/reject.
// All writes go through /api/admin/communities* (admin-only, audited).
// ============================================================
import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api, ApiError, describeApiError } from '@/lib/apiClient';
import { CATEGORY_META, PLATFORM_LABEL, METRO_CITIES } from '@/lib/communities';
import { CATEGORIES, PLATFORMS, type CommunityInput } from '@/lib/communities/input';
import { CommunityForm, EMPTY_INPUT, fieldErrors } from '@/components/communities/CommunityForm';
import './admin-communities.css';

type Item = { slug: string; name: string; category: string; city: string; area: string | null; status: string; hidden: boolean; source: 'static' | 'edited' | 'added'; pricing: string; platform: string; joinUrl: string; updatedAt: string | null; verifiedOn: string };
type ListRes = { total: number; totals: { all: number; hidden: number; edited: number; added: number }; page: number; per: number; items: Item[] };
type Sub = { id: string; kind: 'new' | 'update' | 'remove'; status: string; targetSlug: string | null; targetName: string | null; current: Record<string, unknown> | null; payload: Record<string, unknown>; submitterName: string; submitterEmail: string; submitterRole: string; message: string | null; reviewNote: string | null; createdAt: string };

const F0 = { q: '', category: 'all', pricing: 'any', platform: 'any', city: 'all', status: 'all', source: 'all' };

export default function AdminCommunitiesPage() {
  const [tab, setTab] = useState<'listings' | 'requests'>('listings');
  const [f, setF] = useState(F0);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<ListRes | null>(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ slug: string | null; input: CommunityInput; source?: string; approveId?: string } | null>(null);
  const [formErr, setFormErr] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [subs, setSubs] = useState<{ pending: number; items: Sub[] } | null>(null);
  const [subFilter, setSubFilter] = useState('pending');

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(null), 3500); };

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams({ ...f, page: String(page), per: '50' });
    try { setData(await api.get<ListRes>(`/api/admin/communities?${qs}`)); } catch (e) { flash(describeApiError(e)); } finally { setLoading(false); }
  }, [f, page]);
  const loadSubs = useCallback(async () => {
    try { setSubs(await api.get(`/api/admin/community-submissions?status=${subFilter}`)); } catch (e) { flash(describeApiError(e)); }
  }, [subFilter]);
  useEffect(() => { const t = setTimeout(load, 200); return () => clearTimeout(t); }, [load]);
  useEffect(() => { loadSubs(); }, [loadSubs]);
  useEffect(() => { setPage(1); }, [f]);

  const openNew = () => { setFormErr({}); setEditing({ slug: null, input: structuredClone(EMPTY_INPUT) }); };
  const openEdit = async (slug: string) => {
    setFormErr({});
    try { const r = await api.get<{ input: CommunityInput; source: string }>(`/api/admin/communities/${slug}`); setEditing({ slug, input: r.input, source: r.source }); }
    catch (e) { flash(describeApiError(e)); }
  };
  const save = async () => {
    if (!editing) return;
    setSaving(true); setFormErr({});
    try {
      if (editing.approveId) {
        await api.post(`/api/admin/community-submissions/${editing.approveId}`, { action: 'approve', payload: editing.input });
        flash('Request approved and published');
        loadSubs();
      } else if (editing.slug) { await api.put(`/api/admin/communities/${editing.slug}`, editing.input); flash('Saved — live on the site'); }
      else { const r = await api.post<{ slug: string }>('/api/admin/communities', editing.input); flash(`Added /communities/${r.slug}`); }
      setEditing(null); load();
    } catch (e) {
      if (e instanceof ApiError) setFormErr(fieldErrors(e.details));
      flash(describeApiError(e));
    } finally { setSaving(false); }
  };
  const act = async (slug: string, action: 'hide' | 'unhide' | 'revert' | 'delete') => {
    if (action === 'delete' && !confirm('Delete this listing permanently? This cannot be undone.')) return;
    if (action === 'revert' && !confirm('Throw away your edits and go back to the researched version?')) return;
    try {
      if (action === 'delete') await api.del(`/api/admin/communities/${slug}`);
      else await api.patch(`/api/admin/communities/${slug}`, { action });
      flash({ hide: 'Hidden from the site', unhide: 'Back on the site', revert: 'Reverted to the researched version', delete: 'Deleted' }[action]);
      load();
    } catch (e) { flash(describeApiError(e)); }
  };
  const review = async (s: Sub, action: 'approve' | 'reject') => {
    const note = action === 'reject' ? prompt('Reason (optional, for your records):') ?? undefined : undefined;
    try { await api.post(`/api/admin/community-submissions/${s.id}`, { action, note }); flash(action === 'approve' ? 'Approved and applied' : 'Rejected'); loadSubs(); load(); }
    catch (e) { flash(describeApiError(e)); }
  };
  const editThenApprove = (s: Sub) => {
    setFormErr({});
    const base = s.kind === 'new' ? { ...EMPTY_INPUT, ...(s.payload as CommunityInput) } : null;
    if (base) setEditing({ slug: null, input: base, approveId: s.id });
  };

  const pages = data ? Math.max(1, Math.ceil(data.total / data.per)) : 1;
  const cities = useMemo(() => METRO_CITIES, []);

  return (
    <div className="adc">
      <header className="adc-head">
        <div>
          <h1>Community of People</h1>
          <p>Add, edit, hide or remove listings. Requests from group leads land in <b>Requests</b> — nothing they send goes live until you approve it.</p>
        </div>
        <div className="adc-stats">
          <span><b>{data?.totals.all ?? '—'}</b> listings</span>
          <span><b>{data?.totals.added ?? 0}</b> added here</span>
          <span><b>{data?.totals.edited ?? 0}</b> edited</span>
          <span><b>{data?.totals.hidden ?? 0}</b> hidden</span>
        </div>
      </header>

      <div className="adc-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'listings'} className={tab === 'listings' ? 'on' : ''} onClick={() => setTab('listings')}>Listings</button>
        <button role="tab" aria-selected={tab === 'requests'} className={tab === 'requests' ? 'on' : ''} onClick={() => setTab('requests')}>Requests {subs?.pending ? <i>{subs.pending}</i> : null}</button>
        <span className="sp" />
        <button className="cop-btn cop-btn-primary" onClick={openNew}>+ Add community</button>
      </div>

      {tab === 'listings' && (
        <>
          <div className="adc-filters">
            <input className="q" value={f.q} onChange={(e) => setF({ ...f, q: e.target.value })} placeholder="Search name, slug, area, tag…" />
            <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}><option value="all">All categories</option>{CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_META[c].label}</option>)}</select>
            <select value={f.pricing} onChange={(e) => setF({ ...f, pricing: e.target.value })}><option value="any">Free + paid</option><option value="free">Free</option><option value="paid">Paid (any)</option><option value="pay-per-event">Pay per event</option><option value="membership">Membership / premium</option><option value="unknown">Price unknown</option></select>
            <select value={f.platform} onChange={(e) => setF({ ...f, platform: e.target.value })}><option value="any">All platforms</option>{PLATFORMS.map((p) => <option key={p} value={p}>{PLATFORM_LABEL[p]}</option>)}</select>
            <select value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })}><option value="all">All cities</option>{cities.map((c) => <option key={c}>{c}</option>)}<option value="Online">Online</option></select>
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}><option value="all">Any status</option><option value="approved">Verified</option><option value="unverified">Unverified</option><option value="hidden">Hidden</option></select>
            <select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })}><option value="all">Any source</option><option value="static">Researched</option><option value="edited">Edited here</option><option value="added">Added here</option></select>
            {JSON.stringify(f) !== JSON.stringify(F0) && <button className="clear" onClick={() => setF(F0)}>Clear</button>}
          </div>

          <p className="adc-count">{loading ? 'Loading…' : `${data?.total ?? 0} match`}</p>
          <div className="adc-table" role="table">
            <div className="tr th" role="row"><span>Community</span><span>City</span><span>Category</span><span>Price</span><span>Join via</span><span>Status</span><span /></div>
            {data?.items.map((c) => (
              <div key={c.slug} className={`tr${c.hidden ? ' is-hidden' : ''}`} role="row">
                <span className="nm"><Link href={`/communities/${c.slug}`} target="_blank">{c.name}</Link><small>{c.slug}{c.area ? ` · ${c.area}` : ''}</small></span>
                <span>{c.city}</span>
                <span>{CATEGORY_META[c.category as keyof typeof CATEGORY_META]?.label ?? c.category}</span>
                <span className={`pr ${c.pricing}`}>{c.pricing === 'free' ? 'Free' : c.pricing === 'unknown' ? '—' : c.pricing === 'membership' ? 'Membership' : c.pricing === 'pay-per-event' ? 'Per event' : 'Paid'}</span>
                <span><a href={c.joinUrl} target="_blank" rel="noopener noreferrer">{PLATFORM_LABEL[c.platform as keyof typeof PLATFORM_LABEL] ?? c.platform}</a></span>
                <span className="badges">
                  {c.hidden ? <em className="b hid">Hidden</em> : <em className={`b ${c.status}`}>{c.status === 'approved' ? 'Verified' : 'Unverified'}</em>}
                  {c.source !== 'static' && <em className={`b src-${c.source}`}>{c.source === 'added' ? 'Added' : 'Edited'}</em>}
                </span>
                <span className="acts">
                  <button onClick={() => openEdit(c.slug)}>Edit</button>
                  {c.hidden ? <button onClick={() => act(c.slug, 'unhide')}>Unhide</button> : <button onClick={() => act(c.slug, 'hide')}>Hide</button>}
                  {c.source === 'edited' && <button onClick={() => act(c.slug, 'revert')}>Revert</button>}
                  {c.source === 'added' && <button className="danger" onClick={() => act(c.slug, 'delete')}>Delete</button>}
                </span>
              </div>
            ))}
            {data && !data.items.length && <p className="adc-empty">Nothing matches these filters.</p>}
          </div>
          {pages > 1 && (
            <div className="adc-pager">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page >= pages} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}

      {tab === 'requests' && (
        <>
          <div className="adc-filters">
            {['pending', 'approved', 'rejected', 'all'].map((s) => <button key={s} className={`seg${subFilter === s ? ' on' : ''}`} onClick={() => setSubFilter(s)}>{s[0].toUpperCase() + s.slice(1)}</button>)}
          </div>
          <div className="adc-subs">
            {subs?.items.map((s) => (
              <article key={s.id} className={`sub k-${s.kind}`}>
                <header>
                  <em className={`kind ${s.kind}`}>{s.kind === 'new' ? 'New listing' : s.kind === 'update' ? 'Update' : 'Remove'}</em>
                  <h3>{s.kind === 'new' ? String(s.payload.name ?? 'Untitled') : s.targetName ?? s.targetSlug}</h3>
                  {s.targetSlug && <Link href={`/communities/${s.targetSlug}`} target="_blank">view listing ↗</Link>}
                  <span className="when">{new Date(s.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                </header>
                <p className="who">From <b>{s.submitterName}</b> ({s.submitterRole}) · <a href={`mailto:${s.submitterEmail}`}>{s.submitterEmail}</a></p>
                {s.message && <blockquote>{s.message}</blockquote>}
                {s.kind !== 'remove' && Object.keys(s.payload).length > 0 && (
                  <dl className="diff">
                    {Object.entries(s.payload).filter(([, v]) => v !== '' && v != null && !(Array.isArray(v) && !v.length)).map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        {s.current && k in s.current && <dd className="old">{fmt(s.current[k])}</dd>}
                        <dd className="new">{fmt(v)}</dd>
                      </div>
                    ))}
                  </dl>
                )}
                {s.status === 'pending' ? (
                  <footer>
                    <button className="cop-btn cop-btn-primary" onClick={() => review(s, 'approve')}>{s.kind === 'remove' ? 'Approve — hide listing' : 'Approve & publish'}</button>
                    {s.kind === 'new' && <button className="cop-btn" onClick={() => editThenApprove(s)}>Edit, then approve</button>}
                    <button className="cop-btn danger" onClick={() => review(s, 'reject')}>Reject</button>
                  </footer>
                ) : <footer><em className={`b ${s.status}`}>{s.status}</em>{s.reviewNote && <span className="note">“{s.reviewNote}”</span>}</footer>}
              </article>
            ))}
            {subs && !subs.items.length && <p className="adc-empty">No {subFilter === 'all' ? '' : subFilter} requests.</p>}
          </div>
        </>
      )}

      {editing && (
        <div className="adc-drawer" role="dialog" aria-modal="true" aria-label="Edit community">
          <div className="scrim" onClick={() => setEditing(null)} />
          <div className="panel">
            <header>
              <h2>{editing.approveId ? 'Review & approve' : editing.slug ? 'Edit listing' : 'Add a community'}</h2>
              {editing.source === 'static' && <p className="hint">This is a researched listing. Saving creates your own version; you can revert any time.</p>}
              <button className="x" onClick={() => setEditing(null)} aria-label="Close">×</button>
            </header>
            <CommunityForm value={editing.input} onChange={(input) => setEditing({ ...editing, input })} mode="admin" errors={formErr} />
            <footer>
              <button className="cop-btn" onClick={() => setEditing(null)}>Cancel</button>
              <button className="cop-btn cop-btn-primary" disabled={saving} onClick={save}>{saving ? 'Saving…' : editing.approveId ? 'Approve & publish' : 'Save & publish'}</button>
            </footer>
          </div>
        </div>
      )}
      {msg && <div className="adc-toast" role="status">{msg}</div>}
    </div>
  );
}

function fmt(v: unknown): string {
  if (v == null) return '—';
  if (typeof v === 'string') return v;
  if (Array.isArray(v)) return v.join(', ');
  if (typeof v === 'object') return Object.entries(v as Record<string, unknown>).filter(([, x]) => x !== '' && x != null).map(([k, x]) => `${k}: ${typeof x === 'object' ? JSON.stringify(x) : x}`).join(' · ');
  return String(v);
}
