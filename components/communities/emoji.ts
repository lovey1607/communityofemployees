// components/communities/emoji.ts — one emoji per category. Used for the
// chips, the deck cards and the cursor buddy that follows the mouse.
import type { CommunityCategory } from '@/lib/communities';

export const CAT_EMOJI: Record<CommunityCategory | 'all', string> = {
  all: '📍', running: '👟', cycling: '🚴', sports: '🏓', fitness: '🏋️', outdoors: '🥾',
  tech: '💻', startup: '🚀', creative: '🎨', books: '📚', food: '🍜', social: '🫶',
  language: '🗣️', cause: '🌱', wellbeing: '🧘', parents: '🍼', pets: '🐾',
  professional: '💼', games: '🎲', dating: '💘', men: '🧔', women: '💃', civic: '📣', other: '✨',
};
