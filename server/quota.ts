export const FREE_MONTHLY_LIMIT = 3;

const ipUsage = new Map<string, number>();

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function usageKey(ip: string): string {
  return `${ip}:${currentMonthKey()}`;
}

export function getProCodes(): string[] {
  return (process.env.PRO_CODES || '')
    .split(',')
    .map((code) => code.trim())
    .filter(Boolean);
}

export function isValidProToken(token: string | undefined): boolean {
  if (!token) return false;
  return getProCodes().includes(token);
}

export function getConsultCount(ip: string): number {
  return ipUsage.get(usageKey(ip)) ?? 0;
}

export function resetUsageForTests(): void {
  ipUsage.clear();
}

export function checkConsultQuota(
  ip: string,
  proToken: string | undefined
): { allowed: boolean; remaining: number } {
  if (isValidProToken(proToken)) {
    return { allowed: true, remaining: Number.POSITIVE_INFINITY };
  }
  const count = getConsultCount(ip);
  if (count >= FREE_MONTHLY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: FREE_MONTHLY_LIMIT - count };
}

export function recordConsult(ip: string): void {
  const key = usageKey(ip);
  ipUsage.set(key, (ipUsage.get(key) ?? 0) + 1);
}

export function getClientIp(req: { ip?: string; headers: Record<string, unknown> }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  return req.ip || 'unknown';
}
