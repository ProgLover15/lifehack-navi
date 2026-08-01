import { Lifehack, IntentId } from '../types';
import { DISCOVERY_INTENTS } from '../data/intents';

const CLUSTER_SIZE = 6;

function intentMatchScore(hack: Lifehack, intentId: IntentId): number {
  const intent = DISCOVERY_INTENTS.find(i => i.id === intentId);
  if (!intent) return 0;

  const categoryMatch = intent.categoryIds.includes(hack.category);
  const haystack = `${hack.title} ${hack.summary} ${hack.tags.join(' ')}`.toLowerCase();
  let tagMatches = 0;
  for (const keyword of intent.tagKeywords) {
    if (haystack.includes(keyword.toLowerCase())) {
      tagMatches += 1;
    }
  }

  if (!categoryMatch && tagMatches === 0) {
    return 0;
  }

  let score = categoryMatch ? 10 : 0;
  score += tagMatches * 3;
  score += hack.likesCount / 1000;
  return score;
}

export function getIntentById(intentId: IntentId) {
  return DISCOVERY_INTENTS.find(i => i.id === intentId) ?? DISCOVERY_INTENTS[0];
}

export function getIntentCluster(hacks: Lifehack[], intentId: IntentId, limit = CLUSTER_SIZE): Lifehack[] {
  const intent = getIntentById(intentId);

  const inCategory = [...hacks]
    .filter(h => intent.categoryIds.includes(h.category))
    .sort((a, b) => b.likesCount - a.likesCount);

  const ranked = [...hacks]
    .filter(h => !inCategory.some(c => c.id === h.id))
    .map(hack => ({ hack, score: intentMatchScore(hack, intentId) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => b.score - a.score || b.hack.likesCount - a.hack.likesCount)
    .map(entry => entry.hack);

  const cluster = [...inCategory, ...ranked].slice(0, limit);

  if (cluster.length >= 3) {
    return cluster;
  }

  if (cluster.length > 0) {
    return cluster;
  }

  return [...hacks].sort((a, b) => b.likesCount - a.likesCount).slice(0, limit);
}

export function getNextIntentId(current: IntentId): IntentId {
  const index = DISCOVERY_INTENTS.findIndex(i => i.id === current);
  const next = (index + 1) % DISCOVERY_INTENTS.length;
  return DISCOVERY_INTENTS[next].id;
}
