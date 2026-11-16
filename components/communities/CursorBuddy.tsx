'use client';
// components/communities/CursorBuddy.tsx — the normal mouse pointer stays;
// on a click, a small emoji of the current vibe pops beside it: 📚 for books, 🏓 for sports, 👟 for running… Over a card it
// turns into that card's emoji; over anything clickable it grows and gets a
// ring. Picking a category fires a little emoji burst.
//
// Desktop (fine pointer) only. Touch devices, reduced-motion users and
// text fields keep the normal cursor. Pure DOM + rAF, no re-renders on move.
import { useEffect, useRef } from 'react';

export function burst(x: number, y: number, emoji: string) {
  window.dispatchEvent(new CustomEvent('cop:burst', { detail: { x, y, emoji } }));
}

export function CursorBuddy({ emoji }: { emoji: string }) {
  const el = useRef<HTMLDivElement>(null);
  const face = useRef<HTMLSpanElement>(null);
  const base = useRef(emoji);
  base.current = emoji;

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || !el.current) return;
    // Native cursor stays. The emoji only pops up beside it for a moment
    // when the visitor clicks something (and when the vibe changes).
    let x = -100, y = -100, raf = 0, hideT: ReturnType<typeof setTimeout> | null = null;
    const show = (ms = 1100) => {
      el.current?.classList.remove('off');
      if (hideT) clearTimeout(hideT);
      hideT = setTimeout(() => el.current?.classList.add('off'), ms);
    };
    (window as unknown as { __copBuddyShow?: (ms?: number) => void }).__copBuddyShow = show;
    const paint = () => { raf = 0; if (el.current) el.current.style.transform = `translate3d(${x}px, ${y}px, 0)`; };
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(paint);
    };
    const leave = () => el.current?.classList.add('off');
    const enter = () => { /* stays hidden until a click */ };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const t = e.target as Element | null;
      if (t?.closest('input, textarea, select, iframe')) return;
      const hot = t?.closest('a, button, [role="button"], [role="tab"], label, summary, [data-cur]');
      if (!hot) return;
      const next = t?.closest<HTMLElement>('[data-cur]')?.dataset.cur ?? base.current;
      if (face.current) {
        face.current.textContent = next;
        face.current.animate?.([{ transform: 'scale(.3) rotate(-25deg)' }, { transform: 'scale(1.2)' }, { transform: 'scale(1)' }], { duration: reduce ? 0 : 320, easing: 'ease-out' });
      }
      x = e.clientX; y = e.clientY; paint();
      el.current?.classList.add('press');
      show();
    };
    const up = () => el.current?.classList.remove('press');
    const onBurst = (ev: Event) => {
      if (reduce) return;
      const { x: bx, y: by, emoji: be } = (ev as CustomEvent).detail as { x: number; y: number; emoji: string };
      for (let i = 0; i < 12; i++) {
        const s = document.createElement('span');
        s.className = 'cop-burst';
        s.textContent = be;
        s.style.left = `${bx}px`; s.style.top = `${by}px`;
        document.body.appendChild(s);
        const a = (Math.PI * 2 * i) / 12 + Math.random() * 0.5;
        const d = 60 + Math.random() * 70;
        s.animate([
          { transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 },
          { transform: `translate(calc(-50% + ${Math.cos(a) * d}px), calc(-50% + ${Math.sin(a) * d - 30}px)) scale(${0.8 + Math.random() * 0.6}) rotate(${Math.random() * 120 - 60}deg)`, opacity: 0 },
        ], { duration: 700 + Math.random() * 300, easing: 'cubic-bezier(.15,.8,.3,1)' }).onfinish = () => s.remove();
      }
    };
    addEventListener('pointermove', move, { passive: true });
    document.addEventListener('pointerleave', leave);
    document.addEventListener('pointerenter', enter);
    addEventListener('pointerdown', down);
    addEventListener('pointerup', up);
    addEventListener('cop:burst', onBurst);
    return () => {
      if (hideT) clearTimeout(hideT);
      removeEventListener('pointermove', move);
      document.removeEventListener('pointerleave', leave);
      document.removeEventListener('pointerenter', enter);
      removeEventListener('pointerdown', down);
      removeEventListener('pointerup', up);
      removeEventListener('cop:burst', onBurst);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // When the category changes, swap the face with a pop.
  useEffect(() => {
    if (face.current && face.current.textContent !== emoji) {
      face.current.textContent = emoji;
      face.current.animate?.([{ transform: 'scale(.3) rotate(-30deg)' }, { transform: 'scale(1.25)' }, { transform: 'scale(1)' }], { duration: 380, easing: 'ease-out' });
      (window as unknown as { __copBuddyShow?: (ms?: number) => void }).__copBuddyShow?.(1400);
    }
  }, [emoji]);

  return (
    <div ref={el} className="cop-buddy off" aria-hidden="true">
      <i className="dot" />
      <span ref={face} className="face">{emoji}</span>
    </div>
  );
}
