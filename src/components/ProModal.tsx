import React, { useState } from 'react';
import { Sparkles, X, ExternalLink, KeyRound, Loader2 } from '../utils/icons';
import { setProToken } from '../lib/usage';

interface ProModalProps {
  open: boolean;
  onClose: () => void;
  onActivated: () => void;
  reason?: string;
}

export const ProModal: React.FC<ProModalProps> = ({ open, onClose, onActivated, reason }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paymentLink = import.meta.env.VITE_STRIPE_PAYMENT_LINK_URL as string | undefined;

  if (!open) return null;

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('パスコードを入力してください。');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/verify-pro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = (await res.json()) as { valid?: boolean; token?: string; error?: string };
      if (!res.ok || !data.valid || !data.token) {
        throw new Error(data.error || 'パスコードが無効です。');
      }
      setProToken(data.token);
      setCode('');
      onActivated();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '認証に失敗しました。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 cursor-pointer"
          aria-label="閉じる"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-slate-900">ライフハックナビ Pro</h2>
        </div>

        {reason && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
            {reason}
          </p>
        )}

        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          <strong>¥680/月</strong> で、お金・制度・手続きを<strong>あなたの状況に合わせて</strong>無制限に聞けます。
          読んだハックが自分に当てはまるか、追加で確認することもできます。記事閲覧は無料のままです。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 text-[11px] text-slate-700">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">記事閲覧は無料</div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">自分用に聞き放題</div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">ハックを自分用に確認</div>
        </div>

        {paymentLink ? (
          <a
            href={paymentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full mb-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-500 text-white font-bold text-sm hover:opacity-95 transition-opacity"
          >
            <ExternalLink className="w-4 h-4" />
            StripeでProを購入する
          </a>
        ) : (
          <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl">
            購入リンクは準備中です。運営からパスコードを受け取った方は下に入力してください。
          </p>
        )}

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5" />
            Proパスコード
          </label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleVerify(); }}
            placeholder="購入後に届くコード"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-indigo-500"
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
          <button
            onClick={() => void handleVerify()}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            パスコードで解除
          </button>
        </div>
      </div>
    </div>
  );
};
