const PRO_TOKEN_KEY = 'lifehack_navi_pro_token_v1';
const USAGE_KEY = 'lifehack_navi_usage_v1';
export const FREE_MONTHLY_LIMIT = 3;

export interface UsageState {
  month: string;
  consultCount: number;
}

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function getUsageState(): UsageState {
  try {
    const raw = localStorage.getItem(USAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UsageState;
      if (parsed.month === currentMonth()) return parsed;
    }
  } catch {
    // ignore
  }
  return { month: currentMonth(), consultCount: 0 };
}

export function incrementConsultCount(): UsageState {
  const state = getUsageState();
  const next = { ...state, consultCount: state.consultCount + 1 };
  localStorage.setItem(USAGE_KEY, JSON.stringify(next));
  return next;
}

export function getProToken(): string | null {
  return localStorage.getItem(PRO_TOKEN_KEY);
}

export function setProToken(token: string): void {
  localStorage.setItem(PRO_TOKEN_KEY, token);
}

export function clearProToken(): void {
  localStorage.removeItem(PRO_TOKEN_KEY);
}

export function isProActive(): boolean {
  return Boolean(getProToken());
}

export function remainingFreeConsults(): number {
  if (isProActive()) return Number.POSITIVE_INFINITY;
  return Math.max(0, FREE_MONTHLY_LIMIT - getUsageState().consultCount);
}

export function apiHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getProToken();
  if (token) headers['X-Pro-Token'] = token;
  return headers;
}

export class QuotaExceededError extends Error {
  constructor(message = '今月の無料「自分用」枠を使い切りました。') {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

export async function parseApiError(res: Response, data: { error?: string; code?: string }): Promise<never> {
  if (res.status === 402 || data.code === 'QUOTA_EXCEEDED' || data.code === 'PRO_REQUIRED') {
    throw new QuotaExceededError(data.error);
  }
  throw new Error(data.error || '通信エラーが発生しました。');
}
