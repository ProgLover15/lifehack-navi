import React from 'react';

type LegalSlug = 'terms' | 'privacy' | 'disclaimer' | 'tokusho';

const operatorName = import.meta.env.VITE_OPERATOR_NAME || '運営者名を設定してください';
const operatorEmail = import.meta.env.VITE_OPERATOR_EMAIL || 'contact@example.com';
const refundPolicy =
  import.meta.env.VITE_REFUND_POLICY ||
  'デジタルコンテンツの性質上、原則返金不可。不具合時は個別対応します。';

const PAGES: Record<LegalSlug, { title: string; body: React.ReactNode }> = {
  terms: {
    title: '利用規約',
    body: (
      <>
        <p>本サービス「ライフハックナビ」（以下「本サービス」）の利用には、本規約に同意いただく必要があります。</p>
        <h3 className="font-bold mt-4">第1条（サービス内容）</h3>
        <p>本サービスは、ライフハック情報の閲覧およびAIによる一般的な提案を提供するものです。専門的な法律・医療・税務・金融アドバイスではありません。</p>
        <h3 className="font-bold mt-4">第2条（禁止事項）</h3>
        <p>APIの不正利用、他者への迷惑行為、本サービスの逆コンパイル等を禁止します。</p>
        <h3 className="font-bold mt-4">第3条（免責）</h3>
        <p>本サービスの利用により生じた損害について、運営者は故意または重過失がある場合を除き責任を負いません。</p>
      </>
    ),
  },
  privacy: {
    title: 'プライバシーポリシー',
    body: (
      <>
        <p>本サービスでは、サービス提供のため以下の情報を扱います。</p>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li>ブラウザに保存される利用状況（ブックマーク・実践記録等）</li>
          <li>AI相談に入力したテキスト（Gemini API処理のため）</li>
          <li>アクセス元IPアドレス（不正利用防止のため）</li>
        </ul>
        <p className="mt-4">第三者提供: Google（Gemini API）はAI相談の処理に利用します。Stripeは現在利用しておらず、決済機能の開始時に必要な範囲で利用予定です。</p>
      </>
    ),
  },
  disclaimer: {
    title: 'AI免責事項',
    body: (
      <>
        <p className="font-semibold text-amber-900 bg-amber-50 p-3 rounded-xl border border-amber-200">
          本サービスのAI回答は参考情報です。法律・医療・税務・金融・安全に関わる判断は、必ず専門家または公式情報源でご確認ください。
        </p>
        <p className="mt-4">補助金・制度・相続・投資等の情報は変更される場合があります。申請・手続き前に自治体・官公庁の最新情報を確認してください。</p>
      </>
    ),
  },
  tokusho: {
    title: '特定商取引法に基づく表記',
    body: (
      <>
        <dl className="space-y-2 text-sm">
          <div><dt className="font-bold">販売事業者</dt><dd>{operatorName}</dd></div>
          <div><dt className="font-bold">連絡先</dt><dd>{operatorEmail}</dd></div>
          <div><dt className="font-bold">販売状況</dt><dd>現在、限定ベータ版のため有料販売・課金を行っていません。</dd></div>
          <div><dt className="font-bold">販売価格</dt><dd>有料プランの価格は、提供開始時に別途表示します。現在は購入できません。</dd></div>
          <div><dt className="font-bold">支払方法</dt><dd>決済機能は現在未開始です。決済方法は、提供開始時に別途表示します。</dd></div>
          <div><dt className="font-bold">提供時期</dt><dd>有料提供は現在未開始です。提供時期と利用方法は、提供開始時に別途表示します。</dd></div>
          <div><dt className="font-bold">返金</dt><dd>{refundPolicy}</dd></div>
        </dl>
        {(operatorName === '運営者名を設定してください' || operatorEmail === 'contact@example.com') && (
          <p className="mt-4 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3">
            公開前に `VITE_OPERATOR_NAME` と `VITE_OPERATOR_EMAIL` を設定してください。
          </p>
        )}
      </>
    ),
  },
};

interface LegalPageProps {
  slug: LegalSlug;
  onBack: () => void;
}

export const LegalPage: React.FC<LegalPageProps> = ({ slug, onBack }) => {
  const page = PAGES[slug];
  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4">
      <article className="max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 text-sm text-slate-700 leading-relaxed space-y-3">
        <button onClick={onBack} className="text-xs text-indigo-600 font-bold mb-4 cursor-pointer hover:underline">
          ← トップに戻る
        </button>
        <h1 className="text-xl font-bold text-slate-900 mb-4">{page.title}</h1>
        {page.body}
      </article>
    </div>
  );
};

export type { LegalSlug };
