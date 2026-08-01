import React, { useState } from 'react';
import { Lifehack } from '../types';
import { CATEGORIES } from '../data/categories';
import { formatSocialProof } from '../lib/featuredHack';
import { getIcon, Clock, ThumbsUp, Bookmark, CheckCircle2, AlertTriangle, Lightbulb, MessageSquarePlus, Send, Loader2, Share2, ChevronDown, ChevronUp } from '../utils/icons';
import { apiHeaders, isProActive, parseApiError, QuotaExceededError } from '../lib/usage';

interface LifehackModalProps {
  hack: Lifehack | null;
  onClose: () => void;
  isBookmarked: boolean;
  isPracticed: boolean;
  onToggleBookmark: (id: string) => void;
  onPracticed: (hack: Lifehack) => void;
  onLike: (id: string) => void;
  onQuotaExceeded: (message: string) => void;
}

export const LifehackModal: React.FC<LifehackModalProps> = ({
  hack,
  onClose,
  isBookmarked,
  isPracticed,
  onToggleBookmark,
  onPracticed,
  onLike,
  onQuotaExceeded
}) => {
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [qaList, setQaList] = useState<{ q: string; a: string }[]>([]);
  const [copiedShare, setCopiedShare] = useState(false);
  const [showFollowup, setShowFollowup] = useState(false);

  if (!hack) return null;

  const catObj = CATEGORIES.find(c => c.id === hack.category) || CATEGORIES[0];

  const handleAskFollowup = async () => {
    if (!question.trim()) return;
    if (!isProActive()) {
      onQuotaExceeded('自分の状況での追加確認はProプラン限定です。');
      return;
    }
    const qText = question;
    setQuestion('');
    setAsking(true);

    try {
      const res = await fetch('/api/followup', {
        method: 'POST',
        headers: apiHeaders(),
        body: JSON.stringify({
          hackTitle: hack.title,
          question: qText,
          previousContext: `${hack.summary}\n手順: ${hack.steps.join(' -> ')}`
        })
      });
      const data = await res.json() as { answer?: string; error?: string; code?: string };
      if (!res.ok || data.error) {
        await parseApiError(res, data);
      }
      if (data.answer) {
        setQaList(prev => [...prev, { q: qText, a: data.answer as string }]);
      }
    } catch (err) {
      if (err instanceof QuotaExceededError) {
        onQuotaExceeded(err.message);
      } else {
        setQaList(prev => [...prev, { q: qText, a: err instanceof Error ? err.message : 'エラーが発生しました。' }]);
      }
    } finally {
      setAsking(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${hack.title} - 日本のライフハックナビ`);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        
        <div className="bg-gradient-to-br from-indigo-600 to-slate-900 text-white p-6 sm:p-8 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-5 top-5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
          >
            ✕
          </button>

          <p className="text-amber-200 text-sm font-medium mb-2">
            知ってたら、もっと早く楽になってたかも
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/10 text-teal-200 border border-white/20">
              {getIcon(catObj.icon, 'w-3.5 h-3.5')}
              <span>{catObj.shortName}</span>
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-300">
              <Clock className="w-4 h-4" />
              {hack.timeRequired}
            </span>
            <span className="text-xs text-teal-200 font-medium">
              {formatSocialProof(hack.likesCount)}
            </span>
          </div>

          <h2 className="font-sans font-bold text-xl sm:text-2xl leading-tight pr-8 mb-2">
            {hack.title}
          </h2>

          <p className="text-sm text-indigo-100 leading-relaxed pr-4">
            {hack.summary}
          </p>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-slate-800 text-left">
          
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-1.5">
              <span>📋</span> やること（この順でOK）
            </h3>
            <div className="space-y-3">
              {hack.steps.map((step, idx) => (
                <div key={idx} className="flex items-start space-x-3.5 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-sm flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <p className="text-sm sm:text-base text-slate-800 pt-0.5 leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {hack.itemsNeeded && hack.itemsNeeded.length > 0 && (
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80">
                <h4 className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">
                  <span>🛍️</span> 必要なもの
                </h4>
                <ul className="text-xs sm:text-sm text-slate-700 space-y-1 list-disc pl-4">
                  {hack.itemsNeeded.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {hack.caution && hack.caution !== '特になし' && (
              <div className="bg-red-50/80 p-4 rounded-2xl border border-red-200/80">
                <h4 className="text-xs font-bold text-red-800 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  注意
                </h4>
                <p className="text-xs sm:text-sm text-red-900 leading-relaxed">{hack.caution}</p>
              </div>
            )}
          </div>

          {hack.proTip && (
            <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-teal-50 p-5 rounded-2xl border border-indigo-200">
              <h4 className="text-xs font-bold text-indigo-900 mb-1 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500" />
                もっと効く裏ワザ
              </h4>
              <p className="text-sm text-indigo-950 leading-relaxed">{hack.proTip}</p>
            </div>
          )}

          <div className="border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => setShowFollowup(prev => !prev)}
              className="w-full flex items-center justify-between text-left cursor-pointer group"
            >
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-1.5 group-hover:text-indigo-700">
                <MessageSquarePlus className="w-4 h-4 text-teal-600" />
                このハックを自分の状況で確認する
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded ml-1">
                  {isProActive() ? 'Pro' : 'Pro限定'}
                </span>
              </h4>
              {showFollowup ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {showFollowup && (
              <div className="mt-3 space-y-3">
                {qaList.length > 0 && (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {qaList.map((qa, i) => (
                      <div key={i} className="text-xs space-y-1 bg-slate-100 p-3 rounded-xl">
                        <p className="font-bold text-slate-800">Q: {qa.q}</p>
                        <p className="text-slate-600 pl-2 border-l-2 border-teal-500">A: {qa.a}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleAskFollowup(); }}
                    placeholder="例：独身・会社員ならこの制度は使えますか？"
                    className="flex-1 bg-slate-100 focus:bg-white px-4 py-2.5 rounded-xl text-xs sm:text-sm text-slate-900 border border-slate-200 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="button"
                    onClick={handleAskFollowup}
                    disabled={asking || !question.trim()}
                    className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white px-4 py-2.5 rounded-xl flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                  >
                    {asking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>質問</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

        <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-8 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => onLike(hack.id)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4 text-indigo-600" />
              <span>いいね</span>
            </button>

            <button
              type="button"
              onClick={() => onToggleBookmark(hack.id)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                isBookmarked 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-white border-slate-200 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-600 text-indigo-600' : ''}`} />
              <span>{isBookmarked ? '保存済' : 'あとで使う'}</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors cursor-pointer"
              title="タイトルをコピー"
            >
              <Share2 className="w-4 h-4 text-slate-500" />
              <span>{copiedShare ? 'コピー完了!' : 'シェア'}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => onPracticed(hack)}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
              isPracticed
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/20 active:scale-95'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{isPracticed ? '実践済' : '試してみた'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
