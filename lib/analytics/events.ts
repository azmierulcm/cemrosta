/**
 * Cemrosta Analytics Event Taxonomy
 * 
 * We use privacy-friendly analytics (Plausible/PostHog).
 * No PII is sent with these events.
 */

export const ANALYTICS_EVENTS = {
  // Authentication
  SIGN_IN_COMPLETED: 'sign_in_completed',
  SIGN_UP_COMPLETED: 'sign_up_completed',

  // Roster Flow
  ROSTER_UPLOAD_STARTED: 'roster_upload_started',
  ROSTER_UPLOAD_SUCCESS: 'roster_upload_success',
  ROSTER_UPLOAD_FAILED: 'roster_upload_failed', // { error_type: string }

  // Passport & Recap
  RECAP_CARD_GENERATED: 'recap_card_generated', // { month: string, year: number }
  RECAP_CARD_SHARED: 'recap_card_shared', // { platform: string }
  PATCH_DETAIL_VIEWED: 'patch_detail_viewed', // { city_code: string }

  // Marketplace
  MARKETPLACE_LISTING_VIEWED: 'marketplace_listing_viewed',
  MARKETPLACE_LISTING_CREATED: 'marketplace_listing_created', // { category: string }
  MARKETPLACE_REPORT_SUBMITTED: 'marketplace_report_submitted', // { reason: string }

  // Navigation
  PAGE_VIEW: 'page_view', // { path: string }
};

export type AnalyticsEvent = keyof typeof ANALYTICS_EVENTS;

/**
 * Pluggable track function.
 * In production, this wires to Plausible or PostHog.
 */
export function trackEvent(event: AnalyticsEvent, properties?: Record<string, string | number | boolean | null>) {
  const eventName = ANALYTICS_EVENTS[event];
  
  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}`, properties);
  }

  // Implementation for Plausible/PostHog would go here
  // if (typeof window !== 'undefined' && (window as any).plausible) {
  //   (window as any).plausible(eventName, { props: properties });
  // }
}
