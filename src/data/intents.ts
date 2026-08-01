import { DiscoveryIntent } from '../types';

export const DISCOVERY_INTENTS: DiscoveryIntent[] = [
  {
    id: 'easyLife',
    label: '今すぐラクしたい',
    clusterTitle: '今すぐラクになるハック',
    icon: 'Sparkle',
    categoryIds: ['cooking', 'cleaning', 'pc'],
    tagKeywords: ['時短', '洗い物', 'レンジ', 'コピペ'],
  },
  {
    id: 'saveMoney',
    label: 'お金の損を減らしたい',
    clusterTitle: 'お金の損を減らすハック',
    icon: 'Wallet',
    categoryIds: ['money'],
    tagKeywords: ['ふるさと納税', '新NISA', 'ポイ活', 'クレカ積立'],
  },
  {
    id: 'hiddenRules',
    label: '知らないと損する制度',
    clusterTitle: '知らないと損する制度・補助',
    icon: 'Landmark',
    categoryIds: ['subsidy', 'law'],
    tagKeywords: ['給付金', '医療費', '控除', '補助'],
  },
  {
    id: 'workSmart',
    label: '仕事で消耗したくない',
    clusterTitle: '仕事で消耗しないハック',
    icon: 'Briefcase',
    categoryIds: ['work', 'pc', 'school'],
    tagKeywords: ['メール', '定時', '効率化', '集中'],
  },
  {
    id: 'futureAnxiety',
    label: '親・将来の不安',
    clusterTitle: '親・将来の不安を減らすハック',
    icon: 'ShieldAlert',
    categoryIds: ['law', 'subsidy', 'emergency'],
    tagKeywords: ['相続', 'エンディング', 'エンディングノート', '医療'],
  },
];

export const DEFAULT_INTENT_ID = DISCOVERY_INTENTS[0].id;
