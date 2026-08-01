import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../server';
import { resetUsageForTests } from '../server/quota';

describe('api', () => {
  const originalCodes = process.env.PRO_CODES;

  beforeEach(() => {
    resetUsageForTests();
    process.env.PRO_CODES = 'test-pro-code';
  });

  afterEach(() => {
    process.env.PRO_CODES = originalCodes;
    resetUsageForTests();
  });

  it('GET /health returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('POST /api/verify-pro rejects empty code', async () => {
    const res = await request(app).post('/api/verify-pro').send({ code: '' });
    expect(res.status).toBe(400);
  });

  it('POST /api/verify-pro accepts valid code', async () => {
    const res = await request(app).post('/api/verify-pro').send({ code: 'test-pro-code' });
    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.token).toBe('test-pro-code');
  });

  it('POST /api/consult returns 400 without situation', async () => {
    const res = await request(app).post('/api/consult').send({});
    expect(res.status).toBe(400);
  });

  it('POST /api/consult returns 402 after free quota', async () => {
    const { recordConsult, FREE_MONTHLY_LIMIT } = await import('../server/quota');
    const ip = '203.0.113.10';
    for (let i = 0; i < FREE_MONTHLY_LIMIT; i++) {
      recordConsult(ip);
    }
    const blocked = await request(app)
      .post('/api/consult')
      .set('X-Forwarded-For', ip)
      .send({ situation: 'fourth consult should block' });
    expect(blocked.status).toBe(402);
    expect(blocked.body.code).toBe('QUOTA_EXCEEDED');
  });

  it('POST /api/followup requires pro', async () => {
    const res = await request(app)
      .post('/api/followup')
      .send({ question: 'test?', hackTitle: 'title' });
    expect(res.status).toBe(402);
    expect(res.body.code).toBe('PRO_REQUIRED');
  });

  it('POST /api/event rejects invalid event', async () => {
    const res = await request(app).post('/api/event').send({ event: 'unknown' });
    expect(res.status).toBe(400);
  });

  it('POST /api/event accepts allowed event', async () => {
    const res = await request(app)
      .post('/api/event')
      .send({ event: 'pro_modal_open', meta: { hasReason: false } });
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('does not apply API rate limiting to page and asset routes', async () => {
    for (let index = 0; index < 35; index += 1) {
      const res = await request(app)
        .get('/non-api-asset.js')
        .set('X-Forwarded-For', '203.0.113.77');
      expect(res.status).toBe(404);
    }
  });
});
