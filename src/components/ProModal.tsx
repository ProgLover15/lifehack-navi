import React, { useState } from 'react';
import { Sparkles, X, KeyRound, Loader2 } from '../utils/icons';
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
          現在、ライフハックナビ Pro は限定ベータ版で、有料販売・課金は開始していません。
          ベータ利用者は案内済みのコードで利用できます。記事閲覧は無料です。
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4 text-[11px] text-slate-700">
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">記事閲覧は無料</div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">自分用に聞き放題</div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 px-3 py-2">ハックを自分用に確認</div>
        </div>

        <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-xl">
          Proの一般販売は現在行っていません。別途販売中のデジタル商品とは異なるサービスです。
        </p>

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
            placeholder="案内済みのベータコード"
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
