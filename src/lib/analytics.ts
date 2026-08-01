export type AnalyticsEvent =
  | 'pro_modal_open'
  | 'consult_start'
  | 'quota_exceeded'
  | 'bookmark_add'
  | 'intent_switch';

type EventMeta = Record<string, string | number | boolean>;

export function trackEvent(event: AnalyticsEvent, meta?: EventMeta): void {
  if (typeof window === 'undefined') return;

  void fetch('/api/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event, meta }),
  }).catch(() => {
    // 計測失敗はUXに影響させない
  });
}
