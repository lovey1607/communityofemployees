// components/communities/Mark.tsx — generated visual identity for a
// listing. Deterministic from the slug; no organiser imagery is stored.
import { markFor, type Community } from '@/lib/communities';

export function Mark({ c, size = 48 }: { c: Pick<Community, 'slug' | 'name' | 'category'>; size?: number }) {
  const { hue, initials, shape } = markFor(c);
  const a = `hsl(${hue} 58% 42%)`, b = `hsl(${(hue + 28) % 360} 62% 30%)`, hi = `hsl(${hue} 70% 70%)`;
  const id = `g-${c.slug}`;
  return (
    <span className="cop-mark" style={{ width: size, height: size, fontSize: size * 0.36, background: a }} aria-hidden="true">
      <svg viewBox="0 0 48 48" preserveAspectRatio="none">
        <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={a} /><stop offset="1" stopColor={b} /></linearGradient></defs>
        <rect width="48" height="48" fill={`url(#${id})`} />
        {shape === 0 && <circle cx="38" cy="10" r="16" fill={hi} opacity=".35" />}
        {shape === 1 && <path d="M0 48 L48 0 L48 20 L20 48 Z" fill={hi} opacity=".3" />}
        {shape === 2 && <rect x="-10" y="30" width="70" height="12" transform="rotate(-20 24 36)" fill={hi} opacity=".3" />}
        {shape === 3 && <><circle cx="10" cy="40" r="5" fill={hi} opacity=".4" /><circle cx="40" cy="8" r="7" fill={hi} opacity=".35" /></>}
      </svg>
      {initials}
    </span>
  );
}
