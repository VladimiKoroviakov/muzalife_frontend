/**
 * @fileoverview React Error Boundary for MuzaLife frontend.
 *
 * Catches JavaScript errors anywhere in the child component tree, logs them
 * via the frontend logger, and renders a user-friendly fallback UI instead
 * of the crashed component tree.
 *
 * **Usage:**
 * ```tsx
 * <ErrorBoundary>
 *   <App />
 * </ErrorBoundary>
 * ```
 *
 * The boundary can also wrap individual page sections to limit the blast
 * radius of a single component crash.
 *
 * @module components/errors/ErrorBoundary
 */

import React, { Component, ReactNode } from 'react';
import logger from '../../utils/logger';

// ── Localised user messages ───────────────────────────────────────────────────
const MESSAGES = {
  uk: {
    title: 'Щось пішло не так',
    body: 'Виникла несподівана помилка. Ми вже повідомлені про неї та працюємо над вирішенням.',
    reload: 'Перезавантажити сторінку',
    home: 'На головну',
    report: 'Повідомити про проблему',
    errorId: 'Ідентифікатор помилки',
  },
  en: {
    title: 'Something went wrong',
    body: 'An unexpected error occurred. We have been notified and are working on a fix.',
    reload: 'Reload page',
    home: 'Go home',
    report: 'Report an issue',
    errorId: 'Error ID',
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Props {
  children: ReactNode;
  /** Custom fallback UI; receives the error and reset callback. */
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Class-based error boundary (React only supports class components here).
 * Logs caught errors and renders a bilingual (Ukrainian/English) error page.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `fe-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    logger.exception('React component tree crashed (ErrorBoundary caught)', error, {
      module: 'ErrorBoundary',
      errorId: this.state.errorId,
      componentStack: info.componentStack ?? undefined,
    });
  }

  reset = () => {
    this.setState({ hasError: false, error: null, errorId: '' });
  };

  render() {
    const { hasError, error, errorId } = this.state;
    const { children, fallback } = this.props;

    if (!hasError || !error) return children;

    if (fallback) return fallback(error, this.reset);

    const m = MESSAGES;

    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, sans-serif',
        background: '#f9fafb',
        padding: '2rem',
      }}>
        <div style={{
          maxWidth: 560,
          width: '100%',
          background: '#fff',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          padding: '2.5rem',
          textAlign: 'center',
        }}>
          {/* Error icon */}
          <div style={{ fontSize: 48, marginBottom: '1rem' }}>⚠️</div>

          {/* Bilingual title */}
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem' }}>
            {m.uk.title}
          </h1>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 400, color: '#6b7280', margin: '0 0 1.5rem' }}>
            {m.en.title}
          </h2>

          {/* Bilingual body */}
          <p style={{ color: '#374151', marginBottom: '0.5rem' }}>{m.uk.body}</p>
          <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{m.en.body}</p>

          {/* Error ID for support */}
          <div style={{
            background: '#f3f4f6',
            borderRadius: 6,
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            fontSize: '0.8rem',
            color: '#6b7280',
            wordBreak: 'break-all',
          }}>
            <strong>{m.uk.errorId} / {m.en.errorId}:</strong>{' '}
            <code style={{ color: '#111827' }}>{errorId}</code>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                background: '#111827',
                color: '#fff',
                border: 'none',
                borderRadius: 8,
                padding: '0.6rem 1.2rem',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              {m.uk.reload} / {m.en.reload}
            </button>

            <button
              onClick={() => { window.location.href = '/'; }}
              style={{
                background: 'transparent',
                color: '#111827',
                border: '1.5px solid #d1d5db',
                borderRadius: 8,
                padding: '0.6rem 1.2rem',
                cursor: 'pointer',
                fontSize: '0.9rem',
              }}
            >
              {m.uk.home} / {m.en.home}
            </button>

            <button
              onClick={() => {
                const subject = encodeURIComponent(`MuzaLife Error Report — ${errorId}`);
                const body = encodeURIComponent(
                  `Error ID: ${errorId}\nURL: ${window.location.href}\nError: ${error.message}\n\nSteps to reproduce:\n1. \n2. `
                );
                window.open(`mailto:support@muzalife.com?subject=${subject}&body=${body}`);
              }}
              style={{
                background: 'transparent',
                color: '#6b7280',
                border: '1.5px solid #e5e7eb',
                borderRadius: 8,
                padding: '0.6rem 1.2rem',
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {m.uk.report} / {m.en.report}
            </button>
          </div>

          {/* Stack trace (dev only) */}
          {import.meta.env.MODE === 'development' && (
            <details style={{ marginTop: '1.5rem', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: '0.8rem' }}>
                Developer details
              </summary>
              <pre style={{
                marginTop: '0.5rem',
                padding: '0.75rem',
                background: '#f3f4f6',
                borderRadius: 6,
                fontSize: '0.75rem',
                overflow: 'auto',
                color: '#991b1b',
              }}>
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
