import React, { useState } from 'react';
import { CategoryId, AIConsultResponse } from '../types';
import { QUICK_PROMPTS } from '../data/categories';
import { getIcon, Sparkles, Send, Loader2, CheckCircle2, Bookmark, ChevronDown, ChevronUp } from '../utils/icons';
import { apiHeaders, incrementConsultCount, isProActive, parseApiError, QuotaExceededError, remainingFreeConsults } from '../lib/usage';
import { trackEvent } from '../lib/analytics';

interface AIConsultSheetProps {
  selectedCategory: CategoryId;
  onAddGeneratedHack: (consult: AIConsultResponse) => void;
  onQuotaExceeded: (message: string) => void;
  onUsageChanged: () => void;
}

export const AIConsultSheet: React.FC<AIConsultSheetProps> = ({
  selectedCategory,
  onAddGeneratedHack,
  onQuotaExceeded,
  onUsageChanged,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [situation, setSituation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIConsultResponse | null>(null);
  const [addedToList, setAddedToList] = useState(false);

  const freeRemaining = remainingFreeConsults();
  const freeLabel = isProActive()
    ? 'Pro: 自分用に聞き放題'
    : `月3回無料（残${Number.isFinite(freeRemaining) ? freeRemaining : 3}回）`;

  const handleConsult = async (queryText?: string) => {
    const textToSubmit = queryText || situation;
    if (!textToSubmit.trim()) {
      setError('困っていることを書いてください');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setAddedToList(false);
    if (!expanded) setExpanded(true);
    trackEvent('consult_start', { category: selectedCategory });

    try {
      const res = await fetch('/api/consult', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          situation: textToSubmit,
          category: selectedCategory === 'all' ? 'すべて' : selectedCategory,
        }),
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
        trackEvent('quota_exceeded', { source: 'consult_sheet' });
        onQuotaExceeded(err.message);
        setError(err.message);
      } else {
        setError(err instanceof Error ? err.message : '通信エラーが発生しました');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToList = () => {
    if (result && !addedToList) {
      onAddGeneratedHack(result);
      setAddedToList(true);
    }
  };

  return (
    <section className="border-t border-slate-200 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <button
          type="button"
          onClick={() => setExpanded(prev => !prev)}
          className="w-full flex items-center justify-between gap-3 text-left cursor-pointer group"
        >
          <div>
            <p className="text-xs text-slate-500 mb-0.5">お金・制度を自分の状況で</p>
            <p className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
              あなたの条件で試算・確認する
              <span className="ml-2 text-xs font-medium text-slate-500">({freeLabel})</span>
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
          )}
        </button>

        {expanded && (
          <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={situation}
                onChange={(e) => setSituation(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleConsult(); }}
                placeholder="例：年収500万・子ども2人でふるさと納税はいくらまで？"
                className="flex-1 bg-slate-100 focus:bg-white px-4 py-3 rounded-xl text-sm text-slate-900 border border-slate-200 focus:border-indigo-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleConsult()}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-5 py-3 rounded-xl flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>考え中...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>相談する</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <p className="text-red-600 text-xs">{error}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {QUICK_PROMPTS.slice(0, 3).map((qp) => (
                <button
                  key={qp.id}
                  type="button"
                  onClick={() => {
                    setSituation(qp.prompt);
                    handleConsult(qp.prompt);
                  }}
                  disabled={loading}
                  className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-indigo-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs text-slate-700 cursor-pointer"
                >
                  {getIcon(qp.icon, 'w-3.5 h-3.5 text-indigo-600')}
                  <span>{qp.label}</span>
                </button>
              ))}
            </div>

            {result && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-left">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-[11px] font-bold mb-2">
                      <Sparkles className="w-3 h-3" />
                      AI提案
                    </span>
                    <h3 className="font-bold text-slate-900">{result.title}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={handleSaveToList}
                    disabled={addedToList}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold cursor-pointer shrink-0 ${
                      addedToList
                        ? 'bg-emerald-600 text-white'
                        : 'bg-white border border-slate-200 hover:bg-slate-100 text-slate-800'
                    }`}
                  >
                    {addedToList ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>保存済み</span>
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-4 h-4 text-indigo-600" />
                        <span>保存する</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-sm text-slate-600 mb-3">{result.summary}</p>
                <ol className="space-y-2">
                  {result.steps.map((step, idx) => (
                    <li key={idx} className="flex gap-2 text-sm text-slate-800">
                      <span className="shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
