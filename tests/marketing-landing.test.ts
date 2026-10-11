import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const page = readFileSync(join(process.cwd(), 'public/ai-ops-checklist/index.html'), 'utf8');
const app = readFileSync(join(process.cwd(), 'src/App.tsx'), 'utf8');

describe('AI work checklist acquisition entrypoint', () => {
  it('renders one Japanese title and standalone search-readable guide', () => {
    expect(page).toContain('<html lang="ja">');
    expect(page.match(/<h1>/g)).toHaveLength(1);
    expect(page).toContain('name="description"');
    expect(page).toContain('正本');
    expect(page).toContain('停止条件');
    expect(page).toContain('検収');
  });

  it('keeps the paid offer explicitly separate from free and beta Pro', () => {
    expect(page).toContain('500円');
    expect(page).toContain('買い切り');
    expect(page).toContain('月額Pro機能とは別商品');
    expect(page).toContain('https://buy.stripe.com/5kQcN55DLehn50jdRLdAk00?');
    expect(page).toContain('utm_campaign=ai_ops_checklist');
    expect(page).toContain('utm_content=landing_page');
    expect(page).not.toContain('¥680/月');
  });

  it('is linked from the app without depending on the AI API', () => {
    expect(app).toContain('href="/ai-ops-checklist/"');
    expect(page).toContain('href="/"');
    expect(page).not.toContain('GEMINI_API_KEY');
    expect(page).not.toContain('PRO_CODES');
  });

  it('does not assert fabricated outcomes', () => {
    expect(page).toContain('未確認');
    expect(page).not.toContain('購入者の声');
    expect(page).not.toContain('毎月確実に');
  });
});
