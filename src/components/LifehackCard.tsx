import React from 'react';
import { Lifehack } from '../types';
import { CATEGORIES } from '../data/categories';
import { formatSocialProof } from '../lib/featuredHack';
import { getIcon, Clock, Bookmark, CheckCircle2 } from '../utils/icons';

interface LifehackCardProps {
  hack: Lifehack;
  compact?: boolean;
  isBookmarked: boolean;
  isPracticed: boolean;
  onToggleBookmark: (e: React.MouseEvent, id: string) => void;
  onPracticed: (e: React.MouseEvent, hack: Lifehack) => void;
  onClick: (hack: Lifehack) => void;
}

export const LifehackCard: React.FC<LifehackCardProps> = ({
  hack,
  compact = false,
  isBookmarked,
  isPracticed,
  onToggleBookmark,
  onPracticed,
  onClick
}) => {
  const catObj = CATEGORIES.find(c => c.id === hack.category) || CATEGORIES[0];
  const hookTag = hack.tags[0];

  return (
    <div
      onClick={() => onClick(hack)}
      className={`group bg-white rounded-2xl border p-5 sm:p-6 transition-all hover:-translate-y-1 hover:shadow-xl cursor-pointer flex flex-col justify-between relative overflow-hidden ${
        isPracticed ? 'border-emerald-300 bg-emerald-50/10' : 'border-slate-200 hover:border-indigo-200'
      }`}
    >
      {isPracticed && (
        <div className="absolute -right-12 top-6 bg-emerald-500 text-white font-bold text-[10px] py-1 px-12 rotate-45 shadow-sm flex items-center justify-center pointer-events-none">
          実践済
        </div>
      )}

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${catObj.bgColor} ${catObj.color} ${catObj.borderColor}`}>
            {getIcon(catObj.icon, 'w-3 h-3')}
            <span>{catObj.shortName}</span>
          </span>
          <button
            type="button"
            onClick={(e) => onToggleBookmark(e, hack.id)}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
            title={isBookmarked ? '保存解除' : '保存する'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-indigo-600 text-indigo-600' : ''}`} />
          </button>
        </div>

        <h3 className={`font-sans font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 ${compact ? 'text-base line-clamp-2 leading-snug' : 'text-sm text-slate-500 line-clamp-1'}`}>
          {hack.title}
        </h3>

        <p className={`text-slate-800 leading-relaxed mb-2 ${compact ? 'text-sm line-clamp-1' : 'text-sm sm:text-base font-medium line-clamp-2'}`}>
          {hack.summary}
        </p>

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1">
          <span className="flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-md font-medium text-slate-700">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            {hack.timeRequired}
          </span>
          <span className="font-medium text-slate-600">
            {formatSocialProof(hack.likesCount)}
          </span>
          {hookTag && (
            <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">
              #{hookTag}
            </span>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
        <span className="text-xs font-bold text-indigo-600 group-hover:text-indigo-800">
          手順を見る →
        </span>
        <button
          type="button"
          onClick={(e) => onPracticed(e, hack)}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isPracticed
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{isPracticed ? '実践済' : '試した'}</span>
        </button>
      </div>
    </div>
  );
};
