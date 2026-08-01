import React from 'react';
import { UserStats } from '../types';
import { Sparkles, Trophy, Clock, Bookmark } from '../utils/icons';

interface NavbarProps {
  stats: UserStats;
  onShowBookmarksOnly: () => void;
  showBookmarksOnly: boolean;
  isPro: boolean;
  onOpenPro: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  onShowBookmarksOnly,
  showBookmarksOnly,
  isPro,
  onOpenPro,
}) => {
  const showGamification =
    stats.practicedHackIds.length >= 3 || stats.bookmarkedHackIds.length >= 1;

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => { if (showBookmarksOnly) onShowBookmarksOnly(); }}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 via-blue-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-sans font-bold text-lg sm:text-xl text-slate-900 tracking-tight">
                ライフハックナビ
              </h1>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              日本の実用ワザを発見
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">

          {showGamification && (
            <>
              <div className="hidden md:flex items-center space-x-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 px-3 py-1.5 rounded-full">
                <Trophy className="w-4 h-4 text-amber-600" />
                <div className="text-xs font-medium text-slate-800">
                  Lv.<span className="font-mono font-bold text-amber-700">{stats.level}</span>
                </div>
              </div>

              <div className="hidden sm:flex items-center space-x-1.5 bg-slate-100 px-3 py-1.5 rounded-full text-xs font-medium text-slate-700">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="font-mono font-bold text-slate-900">
                  {stats.totalMinutesSaved >= 60
                    ? `${Math.floor(stats.totalMinutesSaved / 60)}h${stats.totalMinutesSaved % 60}m`
                    : `${stats.totalMinutesSaved}m`}
                </span>
              </div>
            </>
          )}

          {!isPro && (
            <button
              type="button"
              onClick={onOpenPro}
              className="hidden sm:block px-3 py-1.5 rounded-full text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-all cursor-pointer"
            >
              自分用
            </button>
          )}

          {isPro && (
            <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-teal-100 text-teal-800 border border-teal-200">
              Pro
            </span>
          )}

          <button
            type="button"
            onClick={onShowBookmarksOnly}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              showBookmarksOnly
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
            title="保存したライフハックを表示"
          >
            <Bookmark className={`w-3.5 h-3.5 ${showBookmarksOnly ? 'fill-white' : ''}`} />
            <span className="hidden sm:inline">保存</span>
            {stats.bookmarkedHackIds.length > 0 && (
              <span className="font-mono ml-0.5 px-1 py-0.2 bg-white/20 rounded text-[11px]">
                {stats.bookmarkedHackIds.length}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
};
