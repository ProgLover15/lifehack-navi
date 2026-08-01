export type CategoryId = 
  | 'all'
  | 'pc'
  | 'cooking'
  | 'cleaning'
  | 'work'
  | 'school'
  | 'money'
  | 'law'
  | 'subsidy'
  | 'emergency';

export type IntentId =
  | 'easyLife'
  | 'saveMoney'
  | 'hiddenRules'
  | 'workSmart'
  | 'futureAnxiety';

export interface DiscoveryIntent {
  id: IntentId;
  label: string;
  clusterTitle: string;
  icon: string;
  categoryIds: CategoryId[];
  tagKeywords: string[];
}

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  popularTags: string[];
}

export interface Lifehack {
  id: string;
  title: string;
  category: CategoryId;
  timeRequired: string; // e.g. "即効", "3分", "10分"
  difficulty: 'カンタン' | '普通' | '本格的';
  summary: string;
  steps: string[];
  itemsNeeded?: string[];
  caution?: string;
  proTip?: string;
  sourceType: 'editorial' | 'ai_generated' | 'popular';
  likesCount: number;
  practicedCount: number;
  timeSavedMinutes: number; // Estimated minutes saved each time used
  moneySavedYen?: number; // Estimated money saved
  tags: string[];
  dateAdded: string;
}

export interface UserStats {
  practicedHackIds: string[];
  bookmarkedHackIds: string[];
  totalMinutesSaved: number;
  totalMoneySavedYen: number;
  level: number;
  levelTitle: string;
}

export interface AIConsultResponse {
  title: string;
  category: string;
  timeRequired: string;
  difficulty: 'カンタン' | '普通' | '本格的';
  summary: string;
  steps: string[];
  itemsNeeded: string[];
  caution: string;
  proTip: string;
}

export interface QuickSituationPrompt {
  id: string;
  label: string;
  prompt: string;
  category: CategoryId;
  icon: string;
}
