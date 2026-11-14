'use client';
// app/communities/submit/page.tsx — "List a community". UI only for now:
// no backend. Submissions open a prefilled email so nothing is lost while
// the review queue is built. TODO(backend): POST to /api/communities/submit
// and store as status: 'pending' for admin review.
import { useState } from 'react';
import Link from 'next/link';
import { CATEGORY_META, CATEGORY_ORDER, CITY_CENTRES } from '@/lib/communities';

export default function SubmitPage() {
  const [done, setDone] = useState(false);
  const [v, setV] = useState({ name: '', category: 'running', city: 'Gurgaon', area: '', link: '', schedule: '', price: 'free', gender: 'all', contact: '', notes: '' });
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setV({ ...v, [k]: e.target.value });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = Object.entries(v).map(([k, val]) => `${k}: ${val}`).join('\n');
    try { localStorage.setItem('cop:draft-submission', JSON.stringify({ ...v, at: new Date().toISOString() })); } catch { /* ignore */ }
    window.location.href = `mailto:contact@communityofemployees.com?subject=${encodeURIComponent(`New community listing: ${v.name}`)}&body=${encodeURIComponent(body)}`;
    setDone(true);
  };

  return (
    <section className="cop-submit">
      <div className="wrap">
        <p className="cop-crumbs"><Link href="/communities">Communities</Link><span>/</span><span>List a community</span></p>
        <h1 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 800, letterSpacing: '-.02em', marginBottom: '.5rem' }}>List a community.</h1>
        <p className="cop-note" style={{ maxWidth: '56ch', marginBottom: '1.4rem', fontSize: '.95rem' }}>
          Free, always. We review every listing by hand and only publish groups that are real and active. Give us the organiser’s own link — WhatsApp, Instagram, Meetup, website — and people go straight there.
        </p>
        {done ? (
          <div className="panel">
            <h2 style={{ fontSize: '1.3rem' }}>Thanks — we review every listing by hand.</h2>
            <p className="cop-note" style={{ fontSize: '.92rem' }}>Your email app should have opened with the details filled in. If it didn’t, email <a href="mailto:contact@communityofemployees.com" style={{ textDecoration: 'underline' }}>contact@communityofemployees.com</a>. We usually reply within a few days.</p>
            <Link href="/communities" className="cop-btn cop-btn-primary" style={{ justifySelf: 'start' }}>Back to communities</Link>
          </div>
        ) : (
          <form className="panel" onSubmit={submit}>
            <label>Community name<input className="input-base" required value={v.name} onChange={set('name')} placeholder="e.g. Sector 56 Sunday Football" /></label>
            <div className="row2">
              <label>Category
                <select className="input-base" value={v.category} onChange={set('category')}>
                  {CATEGORY_ORDER.filter((k) => k !== 'all').map((k) => <option key={k} value={k}>{CATEGORY_META[k as keyof typeof CATEGORY_META].label}</option>)}
                </select>
              </label>
              <label>City
                <select className="input-base" value={v.city} onChange={set('city')}>{Object.keys(CITY_CENTRES).map((c) => <option key={c}>{c}</option>)}</select>
              </label>
            </div>
            <label>Area / usual meeting point<input className="input-base" value={v.area} onChange={set('area')} placeholder="e.g. Leisure Valley Park, Sector 29" /></label>
            <label>Join link (organiser’s own)<input className="input-base" type="url" required value={v.link} onChange={set('link')} placeholder="https://chat.whatsapp.com/… or instagram.com/…" /></label>
            <label>When do you meet?<input className="input-base" value={v.schedule} onChange={set('schedule')} placeholder="e.g. Sundays 6:30am" /></label>
            <div className="row2">
              <label>Cost
                <select className="input-base" value={v.price} onChange={set('price')}><option value="free">Free</option><option value="pay-per-event">Pay per event</option><option value="membership">Membership</option><option value="paid">Paid</option></select>
              </label>
              <label>Who is it for?
                <select className="input-base" value={v.gender} onChange={set('gender')}><option value="all">Everyone</option><option value="women">Women only</option><option value="men">Men only</option></select>
              </label>
            </div>
            <label>Your contact (so we can verify — never published)<input className="input-base" required value={v.contact} onChange={set('contact')} placeholder="email or WhatsApp number" /></label>
            <label>Anything else<textarea className="input-base" rows={3} value={v.notes} onChange={set('notes')} placeholder="Beginner-friendly? Typical turnout? Anything we should know." /></label>
            <button type="submit" className="cop-btn cop-btn-accent" style={{ justifySelf: 'start' }}>Send for review</button>
            <p className="cop-note">By submitting you confirm you’re the organiser or have their okay. We don’t list private groups without consent.</p>
          </form>
        )}
      </div>
    </section>
  );
}
