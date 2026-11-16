'use client';
// components/communities/PlatformDock.tsx — "join where you already hang
// out". A phone-dock of app tiles (WhatsApp, Telegram, Instagram, Discord…)
// with live count badges; tap one to filter by how you join. Icons are
// generic glyphs in each app's colour family — no brand logos.
import { motion, useReducedMotion } from 'framer-motion';
import { MessageCircle, Send, Camera, Gamepad2, Users, MessagesSquare, ThumbsUp, Globe, Link2, Sparkles } from 'lucide-react';
import type { JoinPlatform } from '@/lib/communities';
import { burst } from './CursorBuddy';

type Tile = { id: JoinPlatform; label: string; Icon: React.ComponentType<{ size?: number; strokeWidth?: number }>; bg: string; emoji: string };

export const DOCK: Tile[] = [
  { id: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle, bg: 'linear-gradient(145deg,#5BF08A,#16A34A)', emoji: '💬' },
  { id: 'telegram', label: 'Telegram', Icon: Send, bg: 'linear-gradient(145deg,#6FD3FF,#1D8FE0)', emoji: '✈️' },
  { id: 'instagram', label: 'Instagram', Icon: Camera, bg: 'linear-gradient(145deg,#FFC94D,#FF3D8B 55%,#8B3DFF)', emoji: '📸' },
  { id: 'meetup', label: 'Meetup', Icon: Users, bg: 'linear-gradient(145deg,#FF7A7A,#E0245E)', emoji: '🤝' },
  { id: 'discord', label: 'Discord', Icon: Gamepad2, bg: 'linear-gradient(145deg,#9AA5FF,#5865F2)', emoji: '🎮' },
  { id: 'reddit', label: 'Reddit', Icon: MessagesSquare, bg: 'linear-gradient(145deg,#FFA463,#FF4500)', emoji: '🗨️' },
  { id: 'facebook', label: 'Facebook', Icon: ThumbsUp, bg: 'linear-gradient(145deg,#6AA8FF,#1857D6)', emoji: '👍' },
  { id: 'website', label: 'Website', Icon: Globe, bg: 'linear-gradient(145deg,#B9F27A,#3F9C2F)', emoji: '🌐' },
  { id: 'other', label: 'Forms & apps', Icon: Link2, bg: 'linear-gradient(145deg,#D7C6FF,#7C3AED)', emoji: '🔗' },
];

export function PlatformDock({ counts, value, onPick }: { counts: Map<string, number>; value: JoinPlatform | 'any'; onPick: (p: JoinPlatform | 'any') => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="cop-dock" role="group" aria-label="Join via">
      <span className="cop-dock-lbl">Join on <i>your</i> app</span>
      <div className="cop-dock-row">
        <motion.button type="button" className={`cop-app any${value === 'any' ? ' on' : ''}`} aria-pressed={value === 'any'} onClick={() => onPick('any')} data-cur="✨"
          initial={reduce ? false : { y: 18, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }}>
          <span className="ico"><Sparkles size={20} strokeWidth={2.4} /></span>
          <span className="nm">Any</span>
        </motion.button>
        {DOCK.map((t, i) => {
          const n = counts.get(t.id) ?? 0;
          const on = value === t.id;
          return (
            <motion.button key={t.id} type="button" className={`cop-app${on ? ' on' : ''}${n === 0 ? ' empty' : ''}`} aria-pressed={on} data-cur={t.emoji}
              title={n ? `${n} communit${n === 1 ? 'y' : 'ies'} you join on ${t.label}` : `None on ${t.label} here yet`}
              style={{ ['--bg' as string]: t.bg, ['--i' as string]: i }}
              initial={reduce ? false : { y: 18, opacity: 0, rotate: -8 }} animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.08 + i * 0.045 }}
              whileHover={reduce ? undefined : { y: -6, rotate: i % 2 ? 6 : -6, scale: 1.08 }} whileTap={{ scale: 0.9 }}
              onClick={(e) => { if (!on) burst(e.clientX, e.clientY, t.emoji); onPick(on ? 'any' : t.id); }}>
              <span className="ico"><t.Icon size={20} strokeWidth={2.4} /></span>
              {n > 0 && <span className="badge">{n > 99 ? '99+' : n}</span>}
              <span className="nm">{t.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
