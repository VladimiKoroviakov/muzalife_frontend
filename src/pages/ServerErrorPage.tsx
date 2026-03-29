/**
 * @fileoverview 500 Server Error page for MuzaLife frontend.
 *
 * Displayed when the backend returns a 5xx error.  The page is intentionally
 * non-technical: it reassures the user, provides an error ID for support
 * reference, and offers clear next-step actions.
 *
 * @module pages/ServerErrorPage
 */

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';

interface ServerErrorPageProps {
  /** Unique backend error ID (from the API response `errorId` field). */
  errorId?: string;
  /** Optional override message (e.g. from API response). */
  message?: string;
}

const MESSAGES = {
  uk: {
    title: 'Помилка сервера',
    body: 'Виникла технічна проблема на нашому боці. Ми вже оповіщені та працюємо над вирішенням.',
    bodyExtra: 'Спробуйте повторити дію через кілька хвилин.',
    errorIdLabel: 'Код помилки для підтримки',
    home: 'На головну',
    retry: 'Спробувати знову',
    report: 'Повідомити про проблему',
  },
  en: {
    title: 'Server error',
    body: 'A technical problem occurred on our end. We have been notified and are working on a fix.',
    bodyExtra: 'Please try again in a few minutes.',
    errorIdLabel: 'Support error code',
    home: 'Go home',
    retry: 'Try again',
    report: 'Report an issue',
  },
};

/**
 * Renders a user-friendly 500 error page.
 */
const ServerErrorPage = ({ errorId, message }: ServerErrorPageProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    logger.error('Server error page displayed to user', {
      module: 'ServerErrorPage',
      errorId,
      message,
      url: window.location.href,
    });
  }, [errorId, message]);

  const displayId = errorId ?? `fe-${Date.now()}`;

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
        {/* Icon */}
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔧</div>

        {/* Status code */}
        <div style={{
          display: 'inline-block',
          background: '#fef2f2',
          color: '#dc2626',
          fontWeight: 700,
          fontSize: '0.85rem',
          borderRadius: 6,
          padding: '0.25rem 0.75rem',
          marginBottom: '1rem',
        }}>
          500 — {MESSAGES.uk.title} / {MESSAGES.en.title}
        </div>

        {/* Bilingual body */}
        <p style={{ color: '#374151', marginBottom: '0.5rem' }}>{MESSAGES.uk.body}</p>
        <p style={{ color: '#374151', marginBottom: '0.5rem' }}>{MESSAGES.uk.bodyExtra}</p>
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
          {MESSAGES.en.body} {MESSAGES.en.bodyExtra}
        </p>

        {/* Error ID */}
        <div style={{
          background: '#f3f4f6',
          borderRadius: 6,
          padding: '0.75rem 1rem',
          marginBottom: '1.5rem',
          fontSize: '0.8rem',
          color: '#6b7280',
          wordBreak: 'break-all',
        }}>
          <strong>{MESSAGES.uk.errorIdLabel} / {MESSAGES.en.errorIdLabel}:</strong>{' '}
          <code style={{ color: '#111827' }}>{displayId}</code>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: '#111827',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '0.6rem 1.4rem',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            {MESSAGES.uk.retry}
          </button>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              color: '#111827',
              border: '1.5px solid #d1d5db',
              borderRadius: 8,
              padding: '0.6rem 1.4rem',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            {MESSAGES.uk.home}
          </button>
          <button
            onClick={() => {
              const subject = encodeURIComponent(`MuzaLife Error Report — ${displayId}`);
              const body = encodeURIComponent(
                `Error ID: ${displayId}\nURL: ${window.location.href}\n\nWhat I was doing:\n\nSteps to reproduce:\n1. \n2. `
              );
              window.open(`mailto:support@muzalife.com?subject=${subject}&body=${body}`);
            }}
            style={{
              background: 'transparent',
              color: '#6b7280',
              border: '1.5px solid #e5e7eb',
              borderRadius: 8,
              padding: '0.6rem 1.4rem',
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            {MESSAGES.uk.report}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServerErrorPage;
