// components/communities/DetailView.tsx — a listing's page. Server component;
// the only interactivity is plain links. Honest about what we know and when
// we last checked.
import Link from 'next/link';
import { ExternalLink, Clock, Users, IndianRupee, MapPin, CalendarCheck } from 'lucide-react';
import { CATEGORY_META, PLATFORM_LABEL, similarTo, slugForCity, type Community, whereLabel } from '@/lib/communities';
import { Mark } from './Mark';
import { CardPhoto } from './CardPhoto';
import { SimilarGrid } from './SimilarGrid';

function fmtDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function DetailView({ c, all }: { c: Community; all?: Community[] }) {
  const meta = CATEGORY_META[c.category];
  const price = c.pricing.type === 'free' ? 'Free' : c.pricing.type === 'unknown' ? 'Ask organiser' : c.pricing.type === 'membership' ? 'Membership' : c.pricing.type === 'pay-per-event' ? 'Pay per event' : 'Paid';
  const who = c.audience.gender === 'women' ? 'Women only' : c.audience.gender === 'men' ? 'Men only' : 'Open to all';
  const level = c.audience.level === 'beginner' || c.tags.includes('beginner-friendly') ? ' · beginner-friendly' : c.audience.level === 'advanced' ? ' · experienced' : '';
  const loc = c.location;
  const pad = loc?.precision === 'city' ? 0.12 : 0.025;
  const mapSrc = loc ? `https://www.openstreetmap.org/export/embed.html?bbox=${(loc.lng - pad * 1.4).toFixed(4)}%2C${(loc.lat - pad).toFixed(4)}%2C${(loc.lng + pad * 1.4).toFixed(4)}%2C${(loc.lat + pad).toFixed(4)}&layer=mapnik&marker=${loc.lat.toFixed(5)}%2C${loc.lng.toFixed(5)}` : null;
  const similar = similarTo(c, 4, all);
  const online = c.city === 'Online';
  const cityHref = online ? '/communities' : `/communities/${slugForCity(c.city === 'Navi Mumbai' || c.city === 'Thane' ? 'Mumbai' : ['Faridabad', 'Ghaziabad'].includes(c.city) ? 'Delhi' : c.city)}`;
  const links = Object.entries(c.links).filter(([, v]) => !!v) as [string, string][];
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Organization', name: c.name, description: c.tagline, url: c.join.url,
    ...(c.city === 'Online' ? {} : { address: { '@type': 'PostalAddress', addressLocality: c.area ?? c.city, addressRegion: c.city, addressCountry: 'IN' } }),
    sameAs: links.map(([, v]) => v),
  };

  return (
    <article className="cop-detail">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="wrap">
        <nav className="cop-crumbs" aria-label="Breadcrumb">
          <Link href="/communities">Communities</Link><span>/</span>
          <Link href={cityHref}>{online ? 'Online · pan-India' : c.city}</Link><span>/</span>
          {!online && <><Link href={`${cityHref}/${c.category}`}>{meta.label}</Link><span>/</span></>}
          <span aria-current="page">{c.name}</span>
        </nav>
        <CardPhoto c={c} w={1400} h={460} className="cop-detail-cover" />
        <div className="cop-detail-grid">
          <div>
            <div className="head">
              <Mark c={c} size={72} />
              <div>
                <h1>{c.name}</h1>
                <p className="lead">{c.tagline}</p>
              </div>
            </div>
            {c.status === 'unverified' && (
              <p className="cop-note" style={{ marginTop: '1rem', padding: '.7rem .9rem', background: 'var(--sun-soft)', borderRadius: 12, border: '1px dashed #E3B93B', color: '#6B4B00' }}>
                <b>Unverified:</b> we found this community but couldn’t confirm activity in the last ~90 days. Check their page before you travel.
              </p>
            )}
            <p className="desc">{c.description}</p>
            <dl className="meta">
              <div><dt><Clock size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> When</dt><dd>{c.meets.summary ?? ({ weekly: 'Weekly', fortnightly: 'Fortnightly', monthly: 'Monthly', irregular: 'Pop-up — see their page', unknown: 'See their page' }[c.meets.cadence])}</dd></div>
              <div><dt><MapPin size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Where</dt><dd>{c.city === 'Online' ? whereLabel(c) : <>{c.area ?? c.city}{c.area ? `, ${c.city}` : ''}</>}</dd></div>
              <div><dt><Users size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Who</dt><dd>{who}{level}{c.audience.ageNote ? ` · ${c.audience.ageNote}` : ''}</dd></div>
              <div><dt><IndianRupee size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Cost</dt><dd>{price}{c.pricing.note ? <span style={{ display: 'block', fontWeight: 400, fontSize: '.8rem', color: 'var(--muted)' }}>{c.pricing.note}</span> : null}</dd></div>
              <div><dt>Size</dt><dd>{c.size.bucket === 'unknown' ? 'Not published' : `${c.size.bucket} people`}{c.size.note ? <span style={{ display: 'block', fontWeight: 400, fontSize: '.8rem', color: 'var(--muted)' }}>{c.size.note}</span> : null}</dd></div>
              <div><dt><CalendarCheck size={12} style={{ display: 'inline', verticalAlign: '-1px' }} /> Last checked</dt><dd>{fmtDate(c.source.verifiedOn)}<span style={{ display: 'block', fontWeight: 400, fontSize: '.8rem', color: 'var(--muted)' }}>{c.source.activitySignal}</span></dd></div>
            </dl>
            {c.tags.length > 0 && <div className="tags">{c.tags.map((t) => <span key={t}>{t}</span>)}</div>}
          </div>

          <aside className="cop-side">
            <div className="cop-joinbox">
              <div className="k">How to join</div>
              <h2>{c.join.cta}</h2>
              <a className="cop-btn" href={c.join.url} target="_blank" rel="noopener noreferrer">
                {c.join.cta} <ExternalLink size={15} />
              </a>
              {links.length > 0 && (
                <div className="links">
                  {links.map(([k, v]) => <a key={k} href={v} target="_blank" rel="noopener noreferrer">{k === 'website' ? 'Website' : k.charAt(0).toUpperCase() + k.slice(1)} ↗</a>)}
                </div>
              )}
              <p className="fine">Opens the organiser’s own {PLATFORM_LABEL[c.join.platform]}. Community of People doesn’t run this group and doesn’t take a fee.</p>
            </div>
            <div className="cop-leadbox">
              <b>Run this group?</b>
              <span>Fix the details or take it down — free.</span>
              <div><Link href={`/communities/submit?edit=${c.slug}`}>Update listing</Link><Link href={`/communities/submit?remove=${c.slug}`}>Remove</Link></div>
            </div>
            {mapSrc && (
              <div className="cop-mapcard">
                <iframe title={`Map: ${loc!.label}`} src={mapSrc} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                <div className="cap">📍 {loc!.label}{loc!.precision === 'city' ? ' (approximate — venue varies)' : ''} · OpenStreetMap</div>
              </div>
            )}
            <div className="cop-src">
              Source: <a href={c.source.url} target="_blank" rel="noopener noreferrer">{new URL(c.source.url).hostname.replace('www.', '')}</a> · checked {fmtDate(c.source.verifiedOn)}.
              Run this community? <a href={`mailto:contact@communityofemployees.com?subject=${encodeURIComponent(`Claim listing: ${c.name}`)}`}>Claim or correct this listing</a>.
            </div>
          </aside>
        </div>

        {similar.length > 0 && (
          <section className="cop-similar">
            <h2>Similar communities nearby</h2>
            <SimilarGrid items={similar} />
          </section>
        )}
      </div>
      <div className="cop-sticky-join">
        <a className="cop-btn cop-btn-accent" href={c.join.url} target="_blank" rel="noopener noreferrer">{c.join.cta} <ExternalLink size={14} /></a>
      </div>
    </article>
  );
}
