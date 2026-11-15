'use client';
// components/communities/SmartImg.tsx — an <img> that never shows a broken
// image. If a photo fails (removed upload, blocked CDN, flaky network) it
// quietly tries the next candidate; if they all fail it hides itself and
// the gradient + emoji behind it shows instead.
import { useState } from 'react';

export function SmartImg({ srcs, alt = '', className, eager = false }: { srcs: string[]; alt?: string; className?: string; eager?: boolean }) {
  const [i, setI] = useState(0);
  const [ok, setOk] = useState(false);
  if (i >= srcs.length) return null;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img key={srcs[i]} src={srcs[i]} alt={alt} className={`${className ?? ''}${ok ? ' is-loaded' : ''}`}
      loading={eager ? 'eager' : 'lazy'} decoding="async" draggable={false} referrerPolicy="no-referrer"
      onLoad={() => setOk(true)} onError={() => { setOk(false); setI((x) => x + 1); }} />
  );
}
