import React from 'react';

export const DiscoveryHero: React.FC = () => {
  return (
    <section className="bg-gradient-to-b from-slate-50 to-slate-100 border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-2 text-center sm:text-left">
        <h2 className="font-sans font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight mb-2">
          知らなきゃ損する、日本の実用ワザ
        </h2>
        <p className="text-sm sm:text-base text-slate-600">
          まず、今のあなたに近いものを選ぶ。カードを開くだけ。明日から使える。
        </p>
      </div>
    </section>
  );
};
