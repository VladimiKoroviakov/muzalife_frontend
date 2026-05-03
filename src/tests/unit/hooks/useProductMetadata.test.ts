/**
 * @fileoverview Unit tests for the {@link useProductMetadata} hook.
 *
 * Covers parallel metadata fetching (types, age categories, events) used
 * in the admin product-creation form and catalogue filter bar.
 *
 * QA Test Cases: TC_3.4.x — filter options loading (R1.15, R1.16).
 *
 * @module tests/unit/hooks/useProductMetadata
 */

// @vitest-environment happy-dom

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProductMetadata } from '@/hooks/useProductMetadata';
import { apiService } from '@/services/api';

vi.mock('@/services/api', () => ({
  apiService: {
    getProductTypes: vi.fn(),
    getAgeCategories: vi.fn(),
    getEvents: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { toast } from 'sonner';

const mockGetTypes = vi.mocked(apiService.getProductTypes);
const mockGetAgeCategories = vi.mocked(apiService.getAgeCategories);
const mockGetEvents = vi.mocked(apiService.getEvents);
const mockToastError = vi.mocked(toast.error);

const sampleTypes = [
  { id: 1, name: 'Сценарій' },
  { id: 2, name: 'Квест' },
  { id: 3, name: 'Поезія' },
];

const sampleAgeCategories = [
  { id: 1, name: 'Дошкільний' },
  { id: 2, name: 'Молодший шкільний' },
];

const sampleEvents = [
  { id: 1, name: 'Новий рік' },
  { id: 2, name: 'День народження' },
];

beforeEach(() => {
  vi.resetAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────
describe('useProductMetadata — initial state', () => {
  it('isLoading starts as true and all arrays are empty', async () => {
    mockGetTypes.mockResolvedValueOnce(sampleTypes);
    mockGetAgeCategories.mockResolvedValueOnce(sampleAgeCategories);
    mockGetEvents.mockResolvedValueOnce(sampleEvents);

    const { result } = renderHook(() => useProductMetadata());

    // Check synchronous initial values before first async tick
    expect(result.current.isLoading).toBe(true);
    expect(result.current.types).toEqual([]);
    expect(result.current.ageCategories).toEqual([]);
    expect(result.current.events).toEqual([]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Success path (TC_3.4.x — filter options load correctly)
// ─────────────────────────────────────────────────────────────────────────────
describe('useProductMetadata — success path', () => {
  it('sets types, ageCategories, and events after all three APIs resolve', async () => {
    mockGetTypes.mockResolvedValueOnce(sampleTypes);
    mockGetAgeCategories.mockResolvedValueOnce(sampleAgeCategories);
    mockGetEvents.mockResolvedValueOnce(sampleEvents);

    const { result } = renderHook(() => useProductMetadata());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.types).toEqual(sampleTypes);
    expect(result.current.ageCategories).toEqual(sampleAgeCategories);
    expect(result.current.events).toEqual(sampleEvents);
  });

  it('calls all three API methods exactly once', async () => {
    mockGetTypes.mockResolvedValueOnce(sampleTypes);
    mockGetAgeCategories.mockResolvedValueOnce(sampleAgeCategories);
    mockGetEvents.mockResolvedValueOnce(sampleEvents);

    const { result } = renderHook(() => useProductMetadata());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockGetTypes).toHaveBeenCalledTimes(1);
    expect(mockGetAgeCategories).toHaveBeenCalledTimes(1);
    expect(mockGetEvents).toHaveBeenCalledTimes(1);
  });

  it('returned types have correct { id, name } shape', async () => {
    mockGetTypes.mockResolvedValueOnce(sampleTypes);
    mockGetAgeCategories.mockResolvedValueOnce(sampleAgeCategories);
    mockGetEvents.mockResolvedValueOnce(sampleEvents);

    const { result } = renderHook(() => useProductMetadata());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.types[0]).toMatchObject({ id: expect.any(Number), name: expect.any(String) });
    expect(result.current.ageCategories[0]).toMatchObject({ id: expect.any(Number), name: expect.any(String) });
    expect(result.current.events[0]).toMatchObject({ id: expect.any(Number), name: expect.any(String) });
  });

  it('does not call toast.error on success', async () => {
    mockGetTypes.mockResolvedValueOnce(sampleTypes);
    mockGetAgeCategories.mockResolvedValueOnce(sampleAgeCategories);
    mockGetEvents.mockResolvedValueOnce(sampleEvents);

    const { result } = renderHook(() => useProductMetadata());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockToastError).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Error path
// ─────────────────────────────────────────────────────────────────────────────
describe('useProductMetadata — error path', () => {
  it('shows toast.error and keeps arrays empty when fetch fails', async () => {
    mockGetTypes.mockRejectedValueOnce(new Error('Network error'));
    mockGetAgeCategories.mockRejectedValueOnce(new Error('Network error'));
    mockGetEvents.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useProductMetadata());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockToastError).toHaveBeenCalledTimes(1);
    expect(result.current.types).toEqual([]);
    expect(result.current.ageCategories).toEqual([]);
    expect(result.current.events).toEqual([]);
  });

  it('sets isLoading to false even when the fetch fails', async () => {
    mockGetTypes.mockRejectedValueOnce(new Error('fail'));
    mockGetAgeCategories.mockResolvedValueOnce([]);
    mockGetEvents.mockResolvedValueOnce([]);

    const { result } = renderHook(() => useProductMetadata());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isLoading).toBe(false);
  });
});
