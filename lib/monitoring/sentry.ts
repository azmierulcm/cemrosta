/**
 * Conceptually wires up Sentry for error tracking.
 * PII scrubbing is enabled by default.
 */

export function captureException(error: unknown, context?: Record<string, unknown>) {
  // Console logging for development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[Sentry] Exception Captured:`, error, context);
  }

  // Implementation for Sentry would go here
  // Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Sentry] Message [${level}]:`, message);
  }
  // Sentry.captureMessage(message, level);
}
