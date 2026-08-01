import React, { useState } from 'react';
import { AIConsultResponse } from '../types';
import { Sparkles, Zap, Flame, Loader2 } from '../utils/icons';
import { apiHeaders, incrementConsultCount, isProActive, parseApiError, QuotaExceededError } from '../lib/usage';

interface MoodConciergeProps {
  onConsultResult: (consult: AIConsultResponse) => void;
  onQuotaExceeded: (message: string) => void;
  onUsageChanged: () => void;
}

export const MoodConcierge: React.FC<MoodConciergeProps> = ({
  onConsultResult,
  onQuotaExceeded,
  onUsageChanged,
}) => {
  const [place, setPlace] = useState<'家' | '職場・学校' | '外出・お店'>('家');
  const [vibe, setVibe] = useState<'めんどい・ラクしたい' | 'お金を浮かせたい' | '焦っている・トラブル' | '将来が不安'>('めんどい・ラクしたい');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const PLACES = ['家', '職場・学校', '外出・お店'] as const;
  const VIBES = [
    { label: 'めんどい・ラクしたい', icon: '🛋️', desc: '家事や作業をサボる時短術' },
    { label: 'お金を浮かせたい', icon: '💰', desc: '固定費や普段の買い物節約' },
    { label: '焦っている・トラブル', icon: '⚡', desc: 'スマホ紛失や急なメール等' },
    { label: '将来が不安', icon: '🛡️', desc: '相続や公的補助金の知識' },
  ] as const;

  const handleQuickPrescribe = async () => {
    setLoading(true);
    setError(null);
    const prompt = `場所が「${place}」で、今の気分が「${vibe}」の人に今すぐ役立つ最高のライフハックを1つ提案して。`;
    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({ situation: prompt, category: 'すべて' })
      });
      const data = await res.json() as AIConsultResponse & { error?: string; code?: string };
      if (!res.ok || data.error) {
        await parseApiError(res, data);
      }
      if (!isProActive()) {
        incrementConsultCount();
        onUsageChanged();
      }
      onConsultResult(data);
    } catch (err) {
      if (err instanceof QuotaExceededError) {
        onQuotaExceeded(err.message);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : '通信エラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-indigo-900/80 via-slate-900 to-teal-950/80 border border-teal-500/30 rounded-3xl p-5 sm:p-7 text-left max-w-3xl mx-auto my-6 shadow-xl relative overflow-hidden">
      <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center space-x-2 mb-3">
        <span className="px-2.5 py-0.5 bg-amber-400 text-slate-950 font-bold text-[10px] rounded-full uppercase tracking-wider animate-pulse">
          入力が面倒なら
        </span>
        <h3 className="text-white font-bold text-sm sm:text-base flex items-center gap-1.5">
          <span>2タップで試す簡単版</span>
        </h3>
      </div>

      <p className="text-xs text-slate-300 mb-5">
        何を書けばいいか分からない人向けです。場所と今の気分を選ぶだけで、まず試すべきライフハックを1件返します。
      </p>
      {error && (
        <p className="text-xs text-red-200 bg-red-950/40 border border-red-500/30 rounded-xl px-3 py-2 mb-4">
          {error}
        </p>
      )}

      {/* Step 1: Place */}
      <div className="mb-4">
        <label className="text-[11px] font-mono uppercase text-teal-400 font-bold block mb-1.5">
          STEP 1: いまどこにいる？
        </label>
        <div className="flex gap-2">
          {PLACES.map((p) => (
            <button
              key={p}
              onClick={() => setPlace(p)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                place === p
                  ? 'bg-teal-400 text-slate-950 border-teal-400 shadow-md scale-102'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              📍 {p}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Vibe */}
      <div className="mb-6">
        <label className="text-[11px] font-mono uppercase text-teal-400 font-bold block mb-1.5">
          STEP 2: いまどんなモード？
        </label>
        <div className="grid grid-cols-2 gap-2">
          {VIBES.map((v) => (
            <button
              key={v.label}
              onClick={() => setVibe(v.label)}
              className={`p-2.5 rounded-xl text-left transition-all cursor-pointer border flex items-start space-x-2.5 ${
                vibe === v.label
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-base">{v.icon}</span>
              <div>
                <div className="text-xs font-bold leading-tight">{v.label}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 leading-tight hidden sm:block">{v.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Execute Prescribe */}
      <button
        onClick={handleQuickPrescribe}
        disabled={loading}
        className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-orange-400 to-teal-400 hover:from-amber-300 hover:to-teal-300 disabled:opacity-50 text-slate-950 font-extrabold rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-orange-500/20 active:scale-98 transition-all cursor-pointer text-sm"
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>最適な日本の知恵を調合中...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 fill-slate-950" />
            <span>この条件で1件だけ提案してもらう</span>
          </>
        )}
      </button>
    </div>
  );
};
