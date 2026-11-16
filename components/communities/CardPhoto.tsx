'use client';
// components/communities/CardPhoto.tsx — a listing's cover image.
// Organiser-supplied `imageUrl` if we have one; otherwise a credited,
// freely-licensed representative photo for the category (labelled so
// nobody mistakes it for the group itself). Falls back through other
// photos if one fails, and finally to a gradient + emoji.
import { useMemo } from 'react';
import type { Community } from '@/lib/communities';
import { photosFor, photoSrc, photoPage } from '@/data/category-photos';
import { SmartImg } from './SmartImg';
import { CAT_EMOJI } from './emoji';

export function CardPhoto({ c, w = 640, h = 360, className = '', credit = true, eager = false }: { c: Pick<Community, 'slug' | 'category' | 'imageUrl' | 'name'>; w?: number; h?: number; className?: string; credit?: boolean; eager?: boolean }) {
  const photos = useMemo(() => photosFor(c.slug, c.category), [c.slug, c.category]);
  const srcs = useMemo(() => [...(c.imageUrl ? [c.imageUrl] : []), ...photos.map((p) => photoSrc(p, w, h))], [c.imageUrl, photos, w, h]);
  const p = photos[0];
  return (
    <figure className={`cop-photo${c.imageUrl ? '' : ' stock'} ${className}`}>
      <span className="ph-emo" aria-hidden="true">{CAT_EMOJI[c.category]}</span>
      <SmartImg srcs={srcs} alt={c.imageUrl ? c.name : p.alt} eager={eager} />
      {credit && !c.imageUrl && (
        <figcaption>
          Representative photo · <a href={photoPage(p)} target="_blank" rel="noopener noreferrer">{p.by} / Unsplash</a>
        </figcaption>
      )}
    </figure>
  );
}
