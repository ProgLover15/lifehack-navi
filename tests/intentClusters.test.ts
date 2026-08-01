import { describe, it, expect } from 'vitest';
import { INITIAL_LIFEHACKS } from '../src/data/lifehacks';
import { getIntentCluster, getNextIntentId } from '../src/lib/intentClusters';

describe('intentClusters', () => {
  it('returns 3-6 hacks for easyLife intent', () => {
    const cluster = getIntentCluster(INITIAL_LIFEHACKS, 'easyLife');
    expect(cluster.length).toBeGreaterThanOrEqual(3);
    expect(cluster.length).toBeLessThanOrEqual(6);
  });

  it('does not pad saveMoney with unrelated popular hacks', () => {
    const cluster = getIntentCluster(INITIAL_LIFEHACKS, 'saveMoney');
    expect(cluster.every(h => h.category === 'money')).toBe(true);
    expect(cluster.length).toBe(2);
  });

  it('cycles intents with getNextIntentId', () => {
    expect(getNextIntentId('easyLife')).toBe('saveMoney');
    expect(getNextIntentId('futureAnxiety')).toBe('easyLife');
  });
});
