/**
 * @fileoverview Unit tests for the {@link useVerificationCode} hook.
 *
 * Covers the OTP input state machine used across registration (TC_3.1.1),
 * email-change verification (TC_3.10.1), and guest purchase confirmation
 * (TC_3.6.3).
 *
 * Requirement: R1.12 (OTP step in email registration).
 *
 * @module tests/unit/hooks/useVerificationCode
 */

// @vitest-environment happy-dom

import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useVerificationCode } from '@/hooks/useVerificationCode';

afterEach(() => {
  vi.useRealTimers();
});

// ─────────────────────────────────────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────────────────────────────────────
describe('useVerificationCode — initial state', () => {
  it('code starts as an array of empty strings with the requested length', () => {
    const { result } = renderHook(() =>
      useVerificationCode({ isOpen: true, length: 6, resendCooldown: 60 }),
    );
    expect(result.current.code).toHaveLength(6);
    expect(result.current.code.every((c) => c === '')).toBe(true);
  });

  it('countdown starts at resendCooldown', () => {
    const { result } = renderHook(() =>
      useVerificationCode({ isOpen: true, resendCooldown: 30 }),
    );
    expect(result.current.countdown).toBe(30);
  });

  it('canResend starts as false', () => {
    const { result } = renderHook(() => useVerificationCode({ isOpen: true }));
    expect(result.current.canResend).toBe(false);
  });

  it('error starts as null', () => {
    const { result } = renderHook(() => useVerificationCode({ isOpen: true }));
    expect(result.current.error).toBeNull();
  });

  it('isSubmitting and isResending start as false', () => {
    const { result } = renderHook(() => useVerificationCode({ isOpen: true }));
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isResending).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getCode / reset
// ─────────────────────────────────────────────────────────────────────────────
describe('useVerificationCode — getCode / reset', () => {
  it('getCode returns the code digits joined as a string', () => {
    const { result } = renderHook(() => useVerificationCode({ isOpen: false }));
    // Simulate pasting digits
    act(() => {
      const pasteEvent = {
        preventDefault: vi.fn(),
        clipboardData: { getData: () => '123456' },
      } as unknown as React.ClipboardEvent<HTMLInputElement>;
      result.current.onPaste(pasteEvent);
    });
    expect(result.current.getCode()).toBe('123456');
  });

  it('reset clears code back to empty strings', () => {
    const { result } = renderHook(() => useVerificationCode({ isOpen: false }));
    act(() => {
      const pasteEvent = {
        preventDefault: vi.fn(),
        clipboardData: { getData: () => '654321' },
      } as unknown as React.ClipboardEvent<HTMLInputElement>;
      result.current.onPaste(pasteEvent);
    });
    act(() => result.current.reset());
    expect(result.current.code.every((c) => c === '')).toBe(true);
  });

  it('reset clears the error', () => {
    const { result } = renderHook(() => useVerificationCode({ isOpen: false }));
    act(() => result.current.setError('some error'));
    act(() => result.current.reset());
    expect(result.current.error).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Countdown & canResend
// ─────────────────────────────────────────────────────────────────────────────
describe('useVerificationCode — countdown', () => {
  it('canResend becomes true after countdown reaches 0', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useVerificationCode({ isOpen: true, resendCooldown: 3 }),
    );
    expect(result.current.canResend).toBe(false);

    // Advance one second at a time so React can flush state updates (and
    // re-run the countdown effect to schedule the next tick) between each
    // interval.  A single advanceTimersByTimeAsync(3000) fires all three
    // timeouts before React processes the intermediate state changes, so the
    // subsequent timers are never registered.
    await act(() => vi.advanceTimersByTimeAsync(1000)); // countdown: 3→2
    await act(() => vi.advanceTimersByTimeAsync(1000)); // countdown: 2→1
    await act(() => vi.advanceTimersByTimeAsync(1000)); // countdown: 1→0 → canResend=true

    expect(result.current.canResend).toBe(true);
    expect(result.current.countdown).toBe(0);
  });

  it('countdown does not tick when isOpen is false', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() =>
      useVerificationCode({ isOpen: false, resendCooldown: 5 }),
    );
    await act(() => vi.advanceTimersByTimeAsync(5000));
    // canResend stays false because the timer never started
    expect(result.current.canResend).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// onPaste
// ─────────────────────────────────────────────────────────────────────────────
describe('useVerificationCode — onPaste', () => {
  it('fills code array when pasted text is all digits', () => {
    const { result } = renderHook(() =>
      useVerificationCode({ isOpen: false, length: 6 }),
    );
    act(() => {
      const evt = {
        preventDefault: vi.fn(),
        clipboardData: { getData: () => '246810' },
      } as unknown as React.ClipboardEvent<HTMLInputElement>;
      result.current.onPaste(evt);
    });
    expect(result.current.getCode()).toBe('246810');
    expect(result.current.error).toBeNull();
  });

  it('sets error and does not fill code when pasted text contains non-digits', () => {
    const { result } = renderHook(() =>
      useVerificationCode({ isOpen: false, length: 6 }),
    );
    act(() => {
      const evt = {
        preventDefault: vi.fn(),
        clipboardData: { getData: () => 'abc123' },
      } as unknown as React.ClipboardEvent<HTMLInputElement>;
      result.current.onPaste(evt);
    });
    expect(result.current.error).not.toBeNull();
    // code should remain all-empty
    expect(result.current.code.every((c) => c === '')).toBe(true);
  });

  it('truncates pasted text to hook length', () => {
    const { result } = renderHook(() =>
      useVerificationCode({ isOpen: false, length: 4 }),
    );
    act(() => {
      const evt = {
        preventDefault: vi.fn(),
        clipboardData: { getData: () => '12345678' },
      } as unknown as React.ClipboardEvent<HTMLInputElement>;
      result.current.onPaste(evt);
    });
    expect(result.current.code).toHaveLength(4);
    expect(result.current.getCode()).toBe('1234');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// setIsSubmitting / setIsResending
// ─────────────────────────────────────────────────────────────────────────────
describe('useVerificationCode — loading flags', () => {
  it('setIsSubmitting(true) sets isSubmitting', () => {
    const { result } = renderHook(() => useVerificationCode({ isOpen: false }));
    act(() => result.current.setIsSubmitting(true));
    expect(result.current.isSubmitting).toBe(true);
  });

  it('setIsResending(true) sets isResending', () => {
    const { result } = renderHook(() => useVerificationCode({ isOpen: false }));
    act(() => result.current.setIsResending(true));
    expect(result.current.isResending).toBe(true);
  });
});
