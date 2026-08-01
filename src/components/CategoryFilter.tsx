import React from 'react';
import { CategoryId } from '../types';
import { CATEGORIES } from '../data/categories';
import { getIcon, Search } from '../utils/icons';

interface CategoryFilterProps {
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: 'popular' | 'new' | 'time';
  onSortChange: (sort: 'popular' | 'new' | 'time') => void;
  totalResultsCount: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  totalResultsCount
}) => {
  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        
        {/* Horizontal Category Scrollable Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-3 pt-1 scrollbar-none no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer border ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-105'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className={isSelected ? 'text-teal-400' : cat.color}>
                  {getIcon(cat.icon, "w-4 h-4")}
                </span>
                <span>{cat.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Search Input Bar & Sort Selectors */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          
          {/* Keyword Search */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="キーワード検索（例：100均, 時短, 節約, NISA, レンジ, 相続）..."
              className="w-full bg-slate-100 hover:bg-slate-200/60 focus:bg-white pl-10 pr-4 py-2 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 border border-transparent focus:border-indigo-500 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Results Count & Sort selector */}
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <span className="text-xs font-medium text-slate-500">
              <span className="font-mono font-bold text-slate-900">{totalResultsCount}</span> 件の知恵
            </span>

            <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => onSortChange('popular')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sortBy === 'popular' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                🔥 人気順
              </button>
              <button
                onClick={() => onSortChange('new')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sortBy === 'new' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ✨ 新着順
              </button>
              <button
                onClick={() => onSortChange('time')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  sortBy === 'time' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ⚡ 時短順
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
