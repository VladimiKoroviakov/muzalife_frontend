import { useEffect, useRef, useState } from 'react';

const RE_DIGIT = /^\d+$/;

interface UseVerificationCodeOptions {
  length?: number;
  resendCooldown?: number;
  isOpen: boolean;
}

export function useVerificationCode({
  length = 6,
  resendCooldown = 60,
  isOpen,
}: UseVerificationCodeOptions) {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const [error, setError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [countdown, setCountdown] = useState(resendCooldown);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  /* ---------------- Countdown ---------------- */
  useEffect(() => {
    if (!isOpen) return;

    if (countdown > 0 && !canResend) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }

    if (countdown === 0) setCanResend(true);
  }, [countdown, canResend, isOpen]);

  /* ---------------- Reset on open ---------------- */
  useEffect(() => {
    if (!isOpen) return;

    setCode(Array(length).fill(''));
    setError(null);
    setCountdown(resendCooldown);
    setCanResend(false);

    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [isOpen, length, resendCooldown]);

  /* ---------------- Helpers ---------------- */
  const focusNext = (el: HTMLElement) =>
    (el.nextElementSibling as HTMLInputElement | null)?.focus();

  const focusPrev = (el: HTMLElement) =>
    (el.previousElementSibling as HTMLInputElement | null)?.focus();

  /* ---------------- Input handlers ---------------- */
  const onChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();

    if (val && !RE_DIGIT.test(val)) return;

    if (val.length === length) {
      setCode(val.split('').slice(0, length));
      setError(null);
      return;
    }

    const next = [...code];
    next[index] = val.slice(-1);
    setCode(next);
    setError(null);

    if (val && index < length - 1) focusNext(e.target);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const el = e.target as HTMLInputElement;

    if (e.key === 'Backspace' && !el.value) {
      e.preventDefault();
      focusPrev(el);
    }

    if (e.key === 'ArrowLeft') focusPrev(el);
    if (e.key === 'ArrowRight') focusNext(el);
  };

  const onPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();

    if (!RE_DIGIT.test(pasted)) {
      setError('Код має містити тільки цифри');
      return;
    }

    setCode(pasted.split('').slice(0, length));
    setError(null);
  };

  /* ---------------- API orchestration helpers ---------------- */
  const getCode = () => code.join('');

  const reset = () => {
    setCode(Array(length).fill(''));
    setError(null);
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  return {
    code,
    inputRefs,
    error,
    setError,

    isSubmitting,
    setIsSubmitting,

    isResending,
    setIsResending,

    countdown,
    canResend,

    onChange,
    onKeyDown,
    onPaste,

    getCode,
    reset,
  };
}