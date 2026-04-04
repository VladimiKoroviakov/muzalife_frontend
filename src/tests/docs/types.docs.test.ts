/**
 * @fileoverview Living documentation for shared TypeScript types and interfaces.
 *
 * These tests document the **shape contracts** of the key data types used
 * across the MuzaLife Frontend.  Each test constructs a value that satisfies
 * the interface and asserts the fields exist with the expected types.
 *
 * Because TypeScript interfaces are erased at runtime, the tests use
 * runtime object construction as "compile-time documentation" — if you try
 * to build a value that violates the interface TypeScript will refuse to
 * compile this file.
 *
 * @module tests/docs/types.docs
 */

import { describe, it, expect } from 'vitest';
import { ApiError } from '../../types';
import type {
  AuthResponse,
  AuthState,
  FAQItem,
  Review,
  PersonalOrder,
} from '../../types';

// ─────────────────────────────────────────────────────────────────────────────
// ApiError — thrown by apiService on non-2xx responses
// ─────────────────────────────────────────────────────────────────────────────
describe('ApiError class', () => {
  it('extends Error and captures HTTP status', () => {
    const err = new ApiError('Not found', 404);
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(404);
    expect(err.name).toBe('ApiError');
    expect(err.message).toBe('Not found');
  });

  it('accepts an optional machine-readable error code', () => {
    const err = new ApiError('Forbidden', 403, 'FORBIDDEN');
    expect(err.code).toBe('FORBIDDEN');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AuthResponse — returned by POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
describe('AuthResponse interface', () => {
  it('requires token (string) and user fields', () => {
    const response: AuthResponse = {
      token: 'eyJhbGciOiJIUzI1NiJ9.example.sig',
      user: {
        id: 1,
        email: 'user@example.com',
        name: 'Alice',
        avatar_url: undefined,
        is_admin: false,
        auth_provider: 'email',
        created_at: '2025-01-01T00:00:00.000Z',
      },
    };
    expect(response.token).toBeTruthy();
    expect(response.user?.id).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// AuthState — shape stored inside AuthContext
// ─────────────────────────────────────────────────────────────────────────────
describe('AuthState interface', () => {
  it('can represent an unauthenticated state', () => {
    const state: AuthState = {
      user: null,
      isLoading: false,
      error: null,
    };
    expect(state.user).toBeNull();
    expect(state.isLoading).toBe(false);
  });

  it('can represent an authenticated state with a full user object', () => {
    const state: AuthState = {
      user: {
        id: 5, email: 'bob@test.com', name: 'Bob',
        avatar_url: undefined, is_admin: false,
        auth_provider: 'google', created_at: '',
      },
      isLoading: false,
      error: null,
    };
    expect(state.user).not.toBeNull();
    expect(state.user?.id).toBe(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// FAQItem — returned by GET /api/faqs
// ─────────────────────────────────────────────────────────────────────────────
describe('FAQItem interface', () => {
  it('contains id, question, and answer fields', () => {
    const faq: FAQItem = {
      id: 1,
      question: 'Як купити сценарій?',
      answer: 'Натисніть кнопку "Купити" на сторінці продукту.',
    };
    expect(faq.id).toBe(1);
    expect(faq.question).toContain('Як');
    expect(faq.answer.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Review — returned by GET /api/reviews
// ─────────────────────────────────────────────────────────────────────────────
describe('Review interface', () => {
  it('includes user info, product reference, rating and comment', () => {
    const review: Review = {
      id: 10,
      productId: 42,
      userId: 3,
      userName: 'Carol',
      userAvatar: undefined,
      rating: 5,
      comment: 'Чудовий сценарій!',
      createdAt: '2025-06-01T12:00:00.000Z',
    };
    expect(review.rating).toBeGreaterThanOrEqual(1);
    expect(review.rating).toBeLessThanOrEqual(5);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// PersonalOrder — returned by GET /api/personal-orders
// ─────────────────────────────────────────────────────────────────────────────
describe('PersonalOrder interface', () => {
  it('tracks the full lifecycle of a custom material request', () => {
    const order: PersonalOrder = {
      order_id: 1,
      user_id: 7,
      order_title: 'Корпоратив 2026',
      order_description: 'Сценарій для 50 осіб',
      order_status: 'pending',
      order_price: 1200,
      order_material_type: 'Сценарій',
      order_material_age_category: '18+',
      order_deadline: null,
      order_created_at: '2026-01-10T10:00:00.000Z',
    };
    expect(order.order_status).toBe('pending');
    expect(order.order_deadline).toBeNull(); // deadline is optional
  });
});
