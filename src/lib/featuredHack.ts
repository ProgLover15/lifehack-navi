import { Lifehack } from '../types';

/** 日付ローテで「今日の一押し」を選ぶ（人気順リストから） */
export function pickFeaturedHack(hacks: Lifehack[]): Lifehack {
  const sorted = [...hacks].sort((a, b) => b.likesCount - a.likesCount);
  if (sorted.length === 0) {
    throw new Error('No lifehacks available');
  }
  const dayIndex = Math.floor(Date.now() / 86_400_000) % sorted.length;
  return sorted[dayIndex];
}

export function formatSocialProof(likesCount: number): string {
  return `${likesCount.toLocaleString()}人が役立った`;
}
