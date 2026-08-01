import React from 'react';
import { IntentId } from '../types';
import { DISCOVERY_INTENTS } from '../data/intents';
import { getIcon } from '../utils/icons';

interface IntentChipsProps {
  selectedIntent: IntentId;
  onSelectIntent: (id: IntentId) => void;
}

export const IntentChips: React.FC<IntentChipsProps> = ({
  selectedIntent,
  onSelectIntent,
}) => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-4">
      <p className="text-sm font-bold text-slate-800 mb-3 text-center sm:text-left">
        あなた向けはどれ？
      </p>
      <div className="flex flex-wrap justify-center sm:justify-start gap-2">
        {DISCOVERY_INTENTS.map(intent => {
          const isSelected = selectedIntent === intent.id;
          return (
            <button
              key={intent.id}
              type="button"
              onClick={() => onSelectIntent(intent.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
              }`}
            >
              <span className={isSelected ? 'text-teal-300' : 'text-indigo-600'}>
                {getIcon(intent.icon, 'w-3.5 h-3.5')}
              </span>
              <span>{intent.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
