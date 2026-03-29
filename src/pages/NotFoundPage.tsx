/**
 * @fileoverview 404 Not Found page for MuzaLife frontend.
 *
 * Rendered when the user navigates to a URL that does not match any route.
 * Provides bilingual (Ukrainian / English) messaging, navigation actions,
 * and a clear, non-technical explanation — no error codes or stack traces
 * are shown to end users.
 *
 * @module pages/NotFoundPage
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';

const MESSAGES = {
  uk: {
    code: '404',
    title: 'Сторінку не знайдено',
    body: 'На жаль, сторінка, яку ви шукаєте, не існує або була переміщена.',
    action: 'Що можна зробити:',
    hints: [
      'Перевірте правильність введеної адреси',
      'Поверніться на головну сторінку',
      'Скористайтеся пошуком для знаходження потрібного товару',
    ],
    home: 'На головну',
    back: 'Повернутися назад',
  },
  en: {
    code: '404',
    title: 'Page not found',
    body: 'Sorry, the page you are looking for does not exist or has been moved.',
    action: 'What you can do:',
    hints: [
      'Check the URL for typos',
      'Go back to the home page',
      'Use the search to find the product you need',
    ],
    home: 'Go home',
    back: 'Go back',
  },
};

/**
 * 404 Not Found page component.
 */
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    logger.warn('404 Not Found — user navigated to missing route', {
      module: 'NotFoundPage',
      url: window.location.href,
    });
  }, []);

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
        {/* Large 404 */}
        <div style={{
          fontSize: '6rem',
          fontWeight: 900,
          color: '#e5e7eb',
          lineHeight: 1,
          marginBottom: '1rem',
        }}>
          404
        </div>

        {/* Bilingual title */}
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: '0 0 0.5rem' }}>
          {MESSAGES.uk.title}
        </h1>
        <h2 style={{ fontSize: '1rem', fontWeight: 400, color: '#6b7280', margin: '0 0 1.5rem' }}>
          {MESSAGES.en.title}
        </h2>

        {/* Bilingual body */}
        <p style={{ color: '#374151', marginBottom: '0.5rem' }}>{MESSAGES.uk.body}</p>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          {MESSAGES.en.body}
        </p>

        {/* Hints (Ukrainian) */}
        <div style={{
          background: '#f3f4f6',
          borderRadius: 8,
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          textAlign: 'left',
        }}>
          <p style={{ fontWeight: 600, color: '#374151', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            {MESSAGES.uk.action}
          </p>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', color: '#6b7280', fontSize: '0.875rem' }}>
            {MESSAGES.uk.hints.map((hint, i) => (
              <li key={i} style={{ marginBottom: '0.25rem' }}>{hint}</li>
            ))}
          </ul>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/')}
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
            {MESSAGES.uk.home}
          </button>
          <button
            onClick={() => navigate(-1)}
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
            {MESSAGES.uk.back}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
