import React, { useState } from 'react';
import { CategoryId, AIConsultResponse } from '../types';
import { QUICK_PROMPTS } from '../data/categories';
import { getIcon, Sparkles, Send, Loader2, Lightbulb, CheckCircle2, Bookmark, Flame } from '../utils/icons';
import { apiHeaders, incrementConsultCount, isProActive, parseApiError, QuotaExceededError } from '../lib/usage';

interface HeroAIConsultProps {
  selectedCategory: CategoryId;
  onAddGeneratedHack: (consult: AIConsultResponse) => void;
  onQuotaExceeded: (message: string) => void;
  onUsageChanged: () => void;
}

export const HeroAIConsult: React.FC<HeroAIConsultProps> = ({
  selectedCategory,
  onAddGeneratedHack,
  onQuotaExceeded,
  onUsageChanged,
}) => {
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIConsultResponse | null>(null);
  const [addedToList, setAddedToList] = useState(false);

  const handleConsult = async (queryText?: string) => {
    const textToSubmit = queryText || situation;
    if (!textToSubmit.trim()) {
      setError('今困っていることや状況を入力してください（例：冷蔵庫の余り物で時短料理したい）');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setAddedToList(false);

    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          situation: textToSubmit,
          category: selectedCategory === 'all' ? 'すべて' : selectedCategory
        })
      });

      const data = await res.json() as AIConsultResponse & { error?: string; code?: string };
      if (!res.ok || data.error) {
        await parseApiError(res, data);
      }

      if (!isProActive()) {
        incrementConsultCount();
        onUsageChanged();
      }

      setResult(data);
    } catch (err) {
      if (err instanceof QuotaExceededError) {
        onQuotaExceeded(err.message);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : '通信エラーが発生しました。時間を置いて再度お試しください。');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickClick = (promptText: string) => {
    setSituation(promptText);
    handleConsult(promptText);
  };

  const handleSaveToList = () => {
    if (result && !addedToList) {
      onAddGeneratedHack(result);
      setAddedToList(true);
    }
  };

  return (
    <div className="relative bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-indigo-900/50 overflow-hidden">
      
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium mb-4">
          <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>悩みを書くと、具体策を1件返すAI</span>
        </div>

        {/* Title & Subtitle */}
        <h2 className="font-sans font-bold text-2xl sm:text-4xl text-white tracking-tight mb-3">
          悩みを書くと、
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-indigo-300 via-teal-200 to-amber-200 bg-clip-text text-transparent">
            日本向けのライフハックを1件返します
          </span>
        </h2>
        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto mb-8">
          家事・仕事・節約・相続などの困りごとに、今すぐ試せる具体策を手順つきで返します。まずは1回、必要な行動を1件だけもらうのがおすすめです。
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-[11px] sm:text-xs text-slate-200 mb-6">
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">今すぐ使える1案</span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">手順つき</span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">注意点つき</span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10">あとで保存できる</span>
        </div>

        {/* Mood Concierge 2-tap (No query needed) */}
        <div className="mb-8">
          {/* Lazy import or direct render via parent */}
        </div>

        {/* Search / Input Box */}
        <div className="bg-white/10 backdrop-blur-md p-2 sm:p-3 rounded-2xl border border-white/20 shadow-2xl max-w-2xl mx-auto mb-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleConsult(); }}
              placeholder="例：親の相続手続き、最初に何をすればいい？"
              className="flex-1 bg-white sm:bg-transparent px-4 py-3 rounded-xl sm:rounded-lg text-slate-900 sm:text-white placeholder:text-slate-400 focus:outline-none text-sm sm:text-base transition-all"
            />
            <button
              onClick={() => handleConsult()}
              disabled={loading}
              className="bg-gradient-to-r from-indigo-500 to-teal-400 hover:from-indigo-600 hover:to-teal-500 disabled:opacity-50 text-slate-950 font-bold px-6 py-3 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-teal-500/20 transition-all active:scale-95 cursor-pointer shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-slate-950" />
                  <span>知恵を検索中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-slate-950" />
                  <span>1件だけ提案してもらう</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] text-slate-300 mt-2 text-left px-2">
            何が返る？: やること / 手順 / 注意点 をまとめて1件返します。
          </p>
          {error && (
            <p className="text-red-300 text-xs mt-2 text-left px-2 flex items-center gap-1">
              <span>⚠️</span> {error}
            </p>
          )}
        </div>

        {/* Serendipity Omikuji Button */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => handleConsult("日本の知られていない驚きの裏ワザライフハックをランダムでおみくじのように1つ教えて")}
            disabled={loading}
            className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full bg-amber-400/20 hover:bg-amber-400/30 border border-amber-300/40 text-amber-200 text-xs font-bold transition-all cursor-pointer hover:scale-105"
          >
            <span>🥠</span>
            <span>迷ったらランダムで1件試す</span>
          </button>
        </div>

        {/* Quick Situation Prompts Chips */}
        <div className="text-left max-w-2xl mx-auto">
          <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-2.5">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>まずはこの悩み例から試す:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPTS.slice(0, 6).map((qp) => (
              <button
                key={qp.id}
                onClick={() => handleQuickClick(qp.prompt)}
                disabled={loading}
                className="inline-flex items-center space-x-1.5 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-indigo-400/50 px-3 py-1.5 rounded-lg text-xs text-slate-200 transition-all text-left group cursor-pointer"
              >
                <span className="text-indigo-300 group-hover:scale-110 transition-transform">
                  {getIcon(qp.icon, "w-3.5 h-3.5")}
                </span>
                <span>{qp.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* AI Generated Result Box */}
        {result && (
          <div className="mt-8 bg-slate-800/90 border border-teal-500/40 rounded-2xl p-6 text-left max-w-3xl mx-auto shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4 mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded text-[11px] font-bold">
                    AI提案ライフハック
                  </span>
                  <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-[11px]">
                    所要時間: {result.timeRequired}
                  </span>
                  <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded text-[11px]">
                    難易度: {result.difficulty}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white">{result.title}</h3>
              </div>
              <button
                onClick={handleSaveToList}
                disabled={addedToList}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  addedToList
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-white text-slate-900 hover:bg-teal-50'
                }`}
              >
                {addedToList ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>保存完了。あとで一覧から見返せます</span>
                  </>
                ) : (
                  <>
                    <Bookmark className="w-4 h-4 text-indigo-600" />
                    <span>あとで使うために保存</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-slate-300 text-sm mb-5 bg-slate-900/50 p-3.5 rounded-xl border border-slate-700/50">
              💡 {result.summary}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Steps */}
              <div className="md:col-span-2 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 font-mono">
                  実践アクションステップ
                </h4>
                <div className="space-y-2.5">
                  {result.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start space-x-3 bg-slate-900/40 p-3 rounded-xl border border-slate-700/30">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal-500 text-slate-950 font-bold text-xs flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <p className="text-sm text-slate-200">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Items & ProTip */}
              <div className="space-y-4">
                {result.itemsNeeded && result.itemsNeeded.length > 0 && (
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-700/40">
                    <h5 className="text-[11px] font-bold text-amber-300 mb-2 flex items-center gap-1">
                      <span>🛍️</span> 必要な道具・環境
                    </h5>
                    <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                      {result.itemsNeeded.map((it, i) => (
                        <li key={i}>{it}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.caution && result.caution !== '特になし' && (
                  <div className="bg-red-950/40 p-3.5 rounded-xl border border-red-500/30">
                    <h5 className="text-[11px] font-bold text-red-300 mb-1 flex items-center gap-1">
                      <span>⚠️</span> 落とし穴・注意点
                    </h5>
                    <p className="text-xs text-red-200 leading-relaxed">{result.caution}</p>
                  </div>
                )}

                {result.proTip && (
                  <div className="bg-indigo-950/50 p-3.5 rounded-xl border border-indigo-500/30">
                    <h5 className="text-[11px] font-bold text-indigo-300 mb-1 flex items-center gap-1">
                      <span>🌟</span> さらに効果UP豆知識
                    </h5>
                    <p className="text-xs text-indigo-200 leading-relaxed">{result.proTip}</p>
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};
