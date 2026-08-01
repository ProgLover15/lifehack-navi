import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { LegalPage, type LegalSlug } from '../src/components/LegalPage';

describe('legal pages', () => {
  const cases: Array<[LegalSlug, string, string]> = [
    ['terms', '利用規約', '第1条（サービス内容）'],
    ['privacy', 'プライバシーポリシー', 'Gemini API'],
    ['tokusho', '特定商取引法に基づく表記', '現在、限定ベータ版のため有料販売・課金を行っていません。'],
  ];

  it.each(cases)('%s renders its title and required content', (slug, title, content) => {
    const html = renderToStaticMarkup(
      React.createElement(LegalPage, { slug, onBack: () => {} }),
    );
    expect(html).toContain(title);
    expect(html).toContain(content);
    expect(html).toContain('トップに戻る');
  });
});
