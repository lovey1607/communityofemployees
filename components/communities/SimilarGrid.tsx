'use client';
// components/communities/SimilarGrid.tsx — card grid for the detail page.
import { useState } from 'react';
import { CommunityCard } from './CommunityCard';
import type { Community } from '@/lib/communities';

export function SimilarGrid({ items }: { items: Community[] }) {
  const [saved, setSaved] = useState<Set<string>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem('cop:saved') || '[]')); } catch { return new Set(); }
  });
  const toggle = (slug: string) => setSaved((p) => { const n = new Set(p); n.has(slug) ? n.delete(slug) : n.add(slug); try { localStorage.setItem('cop:saved', JSON.stringify([...n])); } catch { /* ignore */ } return n; });
  return (
    <div className="cop-grid">
      {items.map((c, i) => <CommunityCard key={c.slug} c={{ ...c, km: null }} index={i} saved={saved.has(c.slug)} onSave={toggle} onToast={() => {}} />)}
    </div>
  );
}
