import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { CategoryId, Lifehack, UserStats, AIConsultResponse, IntentId } from './types';
import { INITIAL_LIFEHACKS } from './data/lifehacks';
import { CATEGORIES } from './data/categories';
import { DEFAULT_INTENT_ID } from './data/intents';
import { Navbar } from './components/Navbar';
import { DiscoveryHero } from './components/DiscoveryHero';
import { IntentChips } from './components/IntentChips';
import { AIConsultSheet } from './components/AIConsultSheet';
import { CategoryFilter } from './components/CategoryFilter';
import { LifehackCard } from './components/LifehackCard';
import { LifehackModal } from './components/LifehackModal';
import { ProModal } from './components/ProModal';
import { LegalPage, LegalSlug } from './components/LegalPage';
import { Sparkles, Trophy, Lightbulb } from './utils/icons';
import { isProActive } from './lib/usage';
import { getIntentById, getIntentCluster, getNextIntentId } from './lib/intentClusters';
import { trackEvent } from './lib/analytics';

const STATS_KEY = 'lifehack_navi_user_stats_v1';
const CUSTOM_HACKS_KEY = 'lifehack_navi_custom_hacks_v1';

export default function App() {
  const discoveryTopRef = useRef<HTMLDivElement>(null);

  const [customHacks, setCustomHacks] = useState<Lifehack[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_HACKS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allHacks = useMemo(() => {
    return [...customHacks, ...INITIAL_LIFEHACKS];
  }, [customHacks]);

  const [stats, setStats] = useState<UserStats>(() => {
    try {
      const saved = localStorage.getItem(STATS_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      practicedHackIds: [],
      bookmarkedHackIds: [],
      totalMinutesSaved: 0,
      totalMoneySavedYen: 0,
      level: 1,
      levelTitle: '駆け出しライフハッカー'
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_HACKS_KEY, JSON.stringify(customHacks));
    } catch {
      // ignore
    }
  }, [customHacks]);

  const [selectedIntent, setSelectedIntent] = useState<IntentId>(DEFAULT_INTENT_ID);
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'new' | 'time'>('popular');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [modalHack, setModalHack] = useState<Lifehack | null>(null);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [proModalReason, setProModalReason] = useState<string | undefined>();
  const [legalSlug, setLegalSlug] = useState<LegalSlug | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [proActive, setProActive] = useState(() => isProActive());

  const refreshPlanState = useCallback(() => {
    setProActive(isProActive());
  }, []);

  const openProModal = useCallback((reason?: string) => {
    setProModalReason(reason);
    setProModalOpen(true);
    trackEvent('pro_modal_open', { hasReason: Boolean(reason) });
  }, []);

  const inDiscoveryView =
    !showBookmarksOnly && !searchQuery && !showAdvancedFilters;

  const activeIntent = useMemo(
    () => getIntentById(selectedIntent),
    [selectedIntent]
  );

  const updateLevel = (currentMinutes: number): { level: number; title: string } => {
    if (currentMinutes >= 1000) return { level: 5, title: '伝説の達人ライフハッカー' };
    if (currentMinutes >= 500) return { level: 4, title: '超効率マスター' };
    if (currentMinutes >= 200) return { level: 3, title: 'ベテラン時短ハッカー' };
    if (currentMinutes >= 60) return { level: 2, title: 'スマート生活実践者' };
    return { level: 1, title: '駆け出しライフハッカー' };
  };

  const handleToggleBookmark = (hackId: string) => {
    setStats(prev => {
      const isBookmarked = prev.bookmarkedHackIds.includes(hackId);
      const nextBookmarks = isBookmarked
        ? prev.bookmarkedHackIds.filter(id => id !== hackId)
        : [...prev.bookmarkedHackIds, hackId];
      if (!isBookmarked) {
        trackEvent('bookmark_add', { hackId });
      }
      return { ...prev, bookmarkedHackIds: nextBookmarks };
    });
  };

  const handleLikeHack = (hackId: string) => {
    setCustomHacks(prev => prev.map(h => h.id === hackId ? { ...h, likesCount: h.likesCount + 1 } : h));
    if (modalHack && modalHack.id === hackId) {
      setModalHack(prev => prev ? { ...prev, likesCount: prev.likesCount + 1 } : null);
    }
  };

  const handlePracticed = (hack: Lifehack) => {
    setStats(prev => {
      const isPracticed = prev.practicedHackIds.includes(hack.id);
      if (isPracticed) {
        const nextIds = prev.practicedHackIds.filter(id => id !== hack.id);
        const nextMin = Math.max(0, prev.totalMinutesSaved - hack.timeSavedMinutes);
        const nextYen = Math.max(0, prev.totalMoneySavedYen - (hack.moneySavedYen || 0));
        const lvl = updateLevel(nextMin);
        return {
          ...prev,
          practicedHackIds: nextIds,
          totalMinutesSaved: nextMin,
          totalMoneySavedYen: nextYen,
          level: lvl.level,
          levelTitle: lvl.title
        };
      }
      const nextIds = [...prev.practicedHackIds, hack.id];
      const nextMin = prev.totalMinutesSaved + hack.timeSavedMinutes;
      const nextYen = prev.totalMoneySavedYen + (hack.moneySavedYen || 0);
      const lvl = updateLevel(nextMin);
      return {
        ...prev,
        practicedHackIds: nextIds,
        totalMinutesSaved: nextMin,
        totalMoneySavedYen: nextYen,
        level: lvl.level,
        levelTitle: lvl.title
      };
    });
  };

  const handleAddGeneratedHack = (consult: AIConsultResponse) => {
    let catId: CategoryId = 'all';
    const catMatch = CATEGORIES.find(c => consult.category.includes(c.shortName) || consult.category.includes(c.name));
    if (catMatch && catMatch.id !== 'all') {
      catId = catMatch.id;
    } else {
      catId = 'pc';
    }

    const newHack: Lifehack = {
      id: `ai-${Date.now()}`,
      title: consult.title,
      category: catId,
      timeRequired: consult.timeRequired || '即効',
      difficulty: consult.difficulty || 'カンタン',
      summary: consult.summary,
      steps: consult.steps,
      itemsNeeded: consult.itemsNeeded,
      caution: consult.caution,
      proTip: consult.proTip,
      sourceType: 'ai_generated',
      likesCount: 1,
      practicedCount: 1,
      timeSavedMinutes: 15,
      moneySavedYen: 100,
      tags: ['AI即席生成', 'あなた専用知恵'],
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setCustomHacks(prev => [newHack, ...prev]);
    setStats(prev => {
      const nextBookmarks = [...prev.bookmarkedHackIds, newHack.id];
      const nextPracticed = [...prev.practicedHackIds, newHack.id];
      const nextMin = prev.totalMinutesSaved + newHack.timeSavedMinutes;
      const lvl = updateLevel(nextMin);
      return {
        ...prev,
        bookmarkedHackIds: nextBookmarks,
        practicedHackIds: nextPracticed,
        totalMinutesSaved: nextMin,
        level: lvl.level,
        levelTitle: lvl.title
      };
    });

    setModalHack(newHack);
  };

  const filteredHacks = useMemo(() => {
    let result = allHacks;

    if (showBookmarksOnly) {
      result = result.filter(h => stats.bookmarkedHackIds.includes(h.id));
    }

    if (selectedCategory !== 'all') {
      result = result.filter(h => h.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(h =>
        h.title.toLowerCase().includes(q) ||
        h.summary.toLowerCase().includes(q) ||
        h.steps.some(s => s.toLowerCase().includes(q)) ||
        h.tags.some(t => t.toLowerCase().includes(q)) ||
        (h.itemsNeeded && h.itemsNeeded.some(it => it.toLowerCase().includes(q)))
      );
    }

    result = [...result].sort((a, b) => {
      if (sortBy === 'popular') return b.likesCount - a.likesCount;
      if (sortBy === 'new') return b.dateAdded.localeCompare(a.dateAdded);
      if (sortBy === 'time') return b.timeSavedMinutes - a.timeSavedMinutes;
      return 0;
    });

    return result;
  }, [allHacks, showBookmarksOnly, selectedCategory, searchQuery, sortBy, stats.bookmarkedHackIds]);

  const displayHacks = useMemo(() => {
    if (!inDiscoveryView) {
      return filteredHacks;
    }
    return getIntentCluster(allHacks, selectedIntent);
  }, [inDiscoveryView, filteredHacks, allHacks, selectedIntent]);

  const handleSelectIntent = (intentId: IntentId) => {
    setSelectedIntent(intentId);
    setSelectedCategory('all');
    setShowAdvancedFilters(false);
    trackEvent('intent_switch', { intentId });
  };

  const handleSwitchIntent = () => {
    setSelectedIntent(prev => getNextIntentId(prev));
    setSelectedCategory('all');
    discoveryTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleOpenAdvancedBrowse = () => {
    setShowAdvancedFilters(true);
    setSelectedCategory('all');
  };

  if (legalSlug) {
    return <LegalPage slug={legalSlug} onBack={() => setLegalSlug(null)} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-teal-500 selection:text-white">

      <Navbar
        stats={stats}
        onShowBookmarksOnly={() => {
          setShowBookmarksOnly(prev => !prev);
          if (!showBookmarksOnly) {
            setSelectedCategory('all');
          }
        }}
        showBookmarksOnly={showBookmarksOnly}
        isPro={proActive}
        onOpenPro={() => openProModal()}
      />

      {inDiscoveryView && (
        <div ref={discoveryTopRef}>
          <DiscoveryHero />
          <IntentChips
            selectedIntent={selectedIntent}
            onSelectIntent={handleSelectIntent}
          />
        </div>
      )}

      {!showBookmarksOnly && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {inDiscoveryView ? (
            <div className="flex flex-wrap items-center gap-4 py-2">
              <button
                type="button"
                onClick={handleSwitchIntent}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
              >
                別の切り口を見る
              </button>
              <button
                type="button"
                onClick={handleOpenAdvancedBrowse}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                もっと探す（検索・全カテゴリ）
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowAdvancedFilters(false);
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer py-2"
            >
              ▲ シンプル表示に戻す
            </button>
          )}
        </div>
      )}

      {(showAdvancedFilters || searchQuery) && !showBookmarksOnly && (
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={(id) => {
            setSelectedCategory(id);
            setShowBookmarksOnly(false);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalResultsCount={filteredHacks.length}
        />
      )}

      {!showBookmarksOnly && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 pb-1">
          <h2 className="text-sm font-bold text-slate-700">
            {inDiscoveryView
              ? activeIntent.clusterTitle
              : selectedCategory === 'all'
                ? 'みんなが役立ったハック'
                : `${CATEGORIES.find(c => c.id === selectedCategory)?.shortName ?? ''}のハック`}
            <span className="ml-2 font-mono text-slate-500 font-medium">{displayHacks.length}件</span>
          </h2>
          {inDiscoveryView && (
            <p className="text-xs text-slate-500 mt-1">
              「{activeIntent.label}」に近いハックを{displayHacks.length}件ピックアップしました
            </p>
          )}
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {showBookmarksOnly && (
          <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-500/30 rounded-xl text-indigo-300">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold">あなたがブックマーク保存したライフハック一覧</h2>
                <p className="text-xs text-indigo-200">
                  現在 {stats.bookmarkedHackIds.length} 個をストック中
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowBookmarksOnly(false)}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
            >
              すべて表示に戻る
            </button>
          </div>
        )}

        {!showBookmarksOnly && showAdvancedFilters && selectedCategory !== 'all' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 flex items-center justify-between shadow-2xs">
            {(() => {
              const cat = CATEGORIES.find(c => c.id === selectedCategory);
              if (!cat) return null;
              return (
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span>{cat.name}</span>
                  </h2>
                  <p className="text-xs text-slate-600 mb-3">{cat.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-[11px] text-slate-500 font-bold mr-1">人気キーワード:</span>
                    {cat.popularTags.map((tag, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setSearchQuery(tag);
                          setShowAdvancedFilters(true);
                        }}
                        className="text-[11px] bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 px-2.5 py-0.5 rounded-full transition-colors cursor-pointer font-medium"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {displayHacks.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Lightbulb className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              該当するライフハックが見つかりませんでした
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              別の切り口を試すか、もっと探すから検索してみてください。
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {inDiscoveryView && (
                <>
                  <button
                    onClick={handleSwitchIntent}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-colors cursor-pointer"
                  >
                    別の切り口を見る
                  </button>
                  <button
                    onClick={handleOpenAdvancedBrowse}
                    className="px-4 py-2 bg-slate-200 text-slate-800 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors cursor-pointer"
                  >
                    もっと探す
                  </button>
                </>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  検索キーワードをクリア
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className={`grid gap-6 ${inDiscoveryView ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {displayHacks.map((hack) => (
              <LifehackCard
                key={hack.id}
                hack={hack}
                compact={inDiscoveryView}
                isBookmarked={stats.bookmarkedHackIds.includes(hack.id)}
                isPracticed={stats.practicedHackIds.includes(hack.id)}
                onToggleBookmark={(e, id) => {
                  e.stopPropagation();
                  handleToggleBookmark(id);
                }}
                onPracticed={(e, targetHack) => {
                  e.stopPropagation();
                  handlePracticed(targetHack);
                }}
                onClick={(targetHack) => setModalHack(targetHack)}
              />
            ))}
          </div>
        )}

      </main>

      {inDiscoveryView && (
        <AIConsultSheet
          selectedCategory={activeIntent.categoryIds[0] ?? 'all'}
          onAddGeneratedHack={handleAddGeneratedHack}
          onUsageChanged={refreshPlanState}
          onQuotaExceeded={(msg) => {
            refreshPlanState();
            openProModal(msg);
          }}
        />
      )}

      <footer className="bg-white border-t border-slate-200 mt-16 py-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center space-x-2 text-slate-800 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>ライフハックナビ Japan</span>
          </div>
          <p className="text-slate-500">
            知らなかった日本の実用ワザに出会える。記事は無料、Pro機能は限定ベータ中のため提供開始前です。
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-[11px]">
            <button type="button" onClick={() => setLegalSlug('terms')} className="text-indigo-600 hover:underline cursor-pointer">利用規約</button>
            <button type="button" onClick={() => setLegalSlug('privacy')} className="text-indigo-600 hover:underline cursor-pointer">プライバシー</button>
            <button type="button" onClick={() => setLegalSlug('disclaimer')} className="text-indigo-600 hover:underline cursor-pointer">AI免責</button>
            <button type="button" onClick={() => setLegalSlug('tokusho')} className="text-indigo-600 hover:underline cursor-pointer">特商法</button>
            <button type="button" onClick={() => openProModal()} className="text-indigo-600 hover:underline cursor-pointer font-bold">Pro機能（提供開始前）</button>
          </div>
          <p className="text-[11px] text-slate-400">
            © 2026 Lifehack Navi Japan Platform. All rights reserved.
          </p>
        </div>
      </footer>

      <LifehackModal
        hack={modalHack}
        onClose={() => setModalHack(null)}
        isBookmarked={modalHack ? stats.bookmarkedHackIds.includes(modalHack.id) : false}
        isPracticed={modalHack ? stats.practicedHackIds.includes(modalHack.id) : false}
        onToggleBookmark={(id) => handleToggleBookmark(id)}
        onPracticed={(targetHack) => handlePracticed(targetHack)}
        onLike={(id) => handleLikeHack(id)}
        onQuotaExceeded={(msg) => {
          refreshPlanState();
          openProModal(msg);
        }}
      />

      <ProModal
        open={proModalOpen}
        onClose={() => setProModalOpen(false)}
        onActivated={refreshPlanState}
        reason={proModalReason}
      />

    </div>
  );
}
