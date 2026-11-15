// components/communities/CardPhoto.tsx — a listing's cover image.
// Organiser-supplied `imageUrl` if we have one; otherwise a credited,
// freely-licensed representative photo for the category (labelled so
// nobody mistakes it for the group itself).
import type { Community } from '@/lib/communities';
import { photoFor, photoSrc, photoPage } from '@/data/category-photos';

export function CardPhoto({ c, w = 640, h = 360, className = '', credit = true }: { c: Pick<Community, 'slug' | 'category' | 'imageUrl' | 'name'>; w?: number; h?: number; className?: string; credit?: boolean }) {
  if (c.imageUrl) {
    return (
      <figure className={`cop-photo ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={c.imageUrl} alt={`${c.name}`} loading="lazy" decoding="async" draggable={false} />
      </figure>
    );
  }
  const p = photoFor(c.slug, c.category);
  return (
    <figure className={`cop-photo stock ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={photoSrc(p, w, h)} alt={p.alt} loading="lazy" decoding="async" draggable={false} />
      {credit && (
        <figcaption>
          Representative photo · <a href={photoPage(p)} target="_blank" rel="noopener noreferrer">{p.by} / Unsplash</a>
        </figcaption>
      )}
    </figure>
  );
}
