import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  checkConsultQuota,
  recordConsult,
  resetUsageForTests,
  isValidProToken,
  FREE_MONTHLY_LIMIT,
} from '../server/quota';

describe('quota', () => {
  const originalCodes = process.env.PRO_CODES;

  beforeEach(() => {
    resetUsageForTests();
    process.env.PRO_CODES = 'test-pro-code';
  });

  afterEach(() => {
    process.env.PRO_CODES = originalCodes;
    resetUsageForTests();
  });

  it('allows consults under free limit', () => {
    const ip = '127.0.0.1';
    expect(checkConsultQuota(ip, undefined).allowed).toBe(true);
    recordConsult(ip);
    recordConsult(ip);
    expect(checkConsultQuota(ip, undefined).remaining).toBe(1);
  });

  it('blocks consult after free limit', () => {
    const ip = '10.0.0.1';
    for (let i = 0; i < FREE_MONTHLY_LIMIT; i++) {
      recordConsult(ip);
    }
    const result = checkConsultQuota(ip, undefined);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('pro token bypasses quota', () => {
    const ip = '10.0.0.2';
    for (let i = 0; i < FREE_MONTHLY_LIMIT + 2; i++) {
      recordConsult(ip);
    }
    expect(checkConsultQuota(ip, 'test-pro-code').allowed).toBe(true);
    expect(isValidProToken('test-pro-code')).toBe(true);
  });
});
