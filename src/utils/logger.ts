/**
 * @fileoverview Frontend logging utility for MuzaLife.
 *
 * Provides structured, levelled logging for browser-side code.
 * In production, DEBUG and INFO messages are suppressed; WARN and ERROR
 * always go through so critical issues are never silently swallowed.
 *
 * **Log level** is controlled by the `VITE_LOG_LEVEL` environment variable
 * (set in `.env` files) without requiring a code change or rebuild, thanks
 * to Vite's static replacement at build time.  The level can also be
 * overridden at runtime via `localStorage.setItem('logLevel', 'debug')`.
 *
 * **Remote logging:** every ERROR-level entry is forwarded to the backend's
 * `/api/errors/client` endpoint (if available) so that frontend crashes are
 * visible in the server-side logs alongside backend events.
 *
 * @module utils/logger
 */

// ── Log level hierarchy ───────────────────────────────────────────────────────
const LOG_LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  silent: 4,
} as const;

type LogLevel = keyof typeof LOG_LEVELS;

/**
 * Resolves the active log level.
 * Priority: localStorage override → VITE_LOG_LEVEL env → NODE_ENV default.
 */
const resolveLevel = (): LogLevel => {
  try {
    const stored = localStorage.getItem('logLevel') as LogLevel | null;
    if (stored && stored in LOG_LEVELS) return stored;
  } catch {
    // localStorage may be unavailable in certain contexts
  }

  const envLevel = import.meta.env.VITE_LOG_LEVEL as LogLevel | undefined;
  if (envLevel && envLevel in LOG_LEVELS) return envLevel;

  return import.meta.env.MODE === 'development' ? 'debug' : 'warn';
};

// ── Unique session ID (persists across navigation within a tab) ───────────────
const SESSION_ID = (() => {
  try {
    let id = sessionStorage.getItem('muzalife_session_id');
    if (!id) {
      id = `fe-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem('muzalife_session_id', id);
    }
    return id;
  } catch {
    return `fe-${Date.now()}`;
  }
})();

// ── Remote error reporting ────────────────────────────────────────────────────
/**
 * Sends an error log entry to the backend for centralised storage.
 * Fails silently so logging never interrupts the user experience.
 */
const sendRemoteError = async (entry: Record<string, unknown>): Promise<void> => {
  try {
    await fetch('/api/errors/client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      keepalive: true, // survives page unload
    });
  } catch {
    // Remote reporting is best-effort
  }
};

// ── Logger factory ────────────────────────────────────────────────────────────

/** Context automatically included in every log entry. */
interface LogContext {
  module?: string;
  errorId?: string;
  userId?: string | number;
  [key: string]: unknown;
}

const buildEntry = (
  level: LogLevel,
  message: string,
  context: LogContext
): Record<string, unknown> => ({
  timestamp: new Date().toISOString(),
  level,
  message,
  sessionId: SESSION_ID,
  url: window.location.href,
  userAgent: navigator.userAgent,
  ...context,
});

const activeLevel = resolveLevel();

/**
 * Core log dispatcher.  Writes to the browser console and — for errors —
 * also sends to the backend.
 */
const log = (level: LogLevel, message: string, context: LogContext = {}): void => {
  if (LOG_LEVELS[level] < LOG_LEVELS[activeLevel]) return;

  const entry = buildEntry(level, message, context);

  switch (level) {
    case 'debug':
      console.debug('[MuzaLife]', message, context);
      break;
    case 'info':
      console.info('[MuzaLife]', message, context);
      break;
    case 'warn':
      console.warn('[MuzaLife]', message, context);
      break;
    case 'error':
      console.error('[MuzaLife]', message, context);
      // Forward errors to backend for centralised analysis
      sendRemoteError(entry);
      break;
  }
};

// ── Public API ────────────────────────────────────────────────────────────────

const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info:  (message: string, context?: LogContext) => log('info',  message, context),
  warn:  (message: string, context?: LogContext) => log('warn',  message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),

  /** Logs an Error object with its stack trace. */
  exception: (message: string, err: unknown, context?: LogContext) => {
    const errContext: LogContext = {
      ...context,
      errorMessage: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      errorId: `fe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
    log('error', message, errContext);
  },

  /** Returns current active log level (useful for debugging). */
  getLevel: () => activeLevel,
};

// ── Global JS error capture ───────────────────────────────────────────────────
// Catches unhandled errors and promise rejections so they appear in logs
// even if no try/catch exists in the calling code.
window.addEventListener('error', (event) => {
  logger.exception('Unhandled JavaScript error', event.error, {
    module: 'window.onerror',
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  logger.exception('Unhandled promise rejection', event.reason, {
    module: 'window.onunhandledrejection',
  });
});

export default logger;
