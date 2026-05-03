/**
 * @fileoverview Unit tests for the {@link useFAQs} hook.
 *
 * Covers the FAQ data-fetching logic: loading state, success path,
 * the "empty = error" business rule, and network failure handling.
 *
 * @module tests/unit/hooks/useFAQs
 */

// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useFAQs } from '@/hooks/useFAQs';
import { apiService } from '@/services/api';

vi.mock('@/services/api', () => ({
  apiService: {
    getFAQs: vi.fn(),
  },
}));

const mockGetFAQs = vi.mocked(apiService.getFAQs);

const sampleFAQs = [
  { id: 1, question: 'Що таке Muzalife?', answer: 'Платформа для сценаріїв.' },
  { id: 2, question: 'Як купити?', answer: 'Додайте до кошика.' },
];

beforeEach(() => {
  vi.resetAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// Initial loading state
// ─────────────────────────────────────────────────────────────────────────────
describe('useFAQs — initial state', () => {
  it('starts with loading true and no data', () => {
    mockGetFAQs.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useFAQs());
    expect(result.current.loading).toBe(true);
    expect(result.current.faqs).toEqual([]);
    expect(result.current.error).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Success path
// ─────────────────────────────────────────────────────────────────────────────
describe('useFAQs — success', () => {
  it('populates faqs and clears loading on a successful fetch', async () => {
    mockGetFAQs.mockResolvedValueOnce(sampleFAQs);
    const { result } = renderHook(() => useFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.faqs).toHaveLength(2);
    expect(result.current.faqs[0].id).toBe(1);
    expect(result.current.error).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Empty-array = error  (business rule documented in the hook)
// ─────────────────────────────────────────────────────────────────────────────
describe('useFAQs — empty-array business rule', () => {
  it('treats an empty result as an error state because FAQs must always have content', async () => {
    mockGetFAQs.mockResolvedValueOnce([]);
    const { result } = renderHook(() => useFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.faqs).toEqual([]);
    expect(result.current.error).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Network failure
// ─────────────────────────────────────────────────────────────────────────────
describe('useFAQs — network failure', () => {
  it('sets error from the thrown Error message and leaves faqs empty', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetFAQs.mockRejectedValueOnce(new Error('Network error'));
    const { result } = renderHook(() => useFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Network error');
    expect(result.current.faqs).toEqual([]);
    consoleSpy.mockRestore();
  });

  it('uses a fallback Ukrainian message when the rejection is not an Error instance', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockGetFAQs.mockRejectedValueOnce('server down');
    const { result } = renderHook(() => useFAQs());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toContain('Не вдалося');
    consoleSpy.mockRestore();
  });
});
