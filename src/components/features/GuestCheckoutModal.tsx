/**
 * @fileoverview Two-step guest checkout modal: email input → OTP verification.
 *
 * Allows unauthenticated users to purchase products without creating an account.
 * On successful OTP verification the caller receives a short-lived guest JWT
 * via the `onVerified` callback.
 *
 * @module components/features/GuestCheckoutModal
 */

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useVerificationCode } from '@/hooks/useVerificationCode';
import { apiService } from '@/services/api';

/** Steps of the guest checkout modal flow. */
type GuestCheckoutStep = 'email' | 'otp';

interface GuestCheckoutModalProps {
  /** Whether the modal is visible. */
  open: boolean;
  /** Called when the user dismisses the modal. */
  onClose: () => void;
  /**
   * Called after the guest email is successfully verified.
   * The caller should use the token to initiate a guest payment.
   *
   * @param guestToken - Short-lived JWT (30 min) for the payment endpoint.
   */
  onVerified: (guestToken: string) => void;
}

/**
 * Two-step guest checkout modal.
 *
 * **Step 1:** user enters their email → OTP is sent.
 * **Step 2:** user enters the 6-digit code → guest JWT is returned via `onVerified`.
 *
 * @param props - {@link GuestCheckoutModalProps}
 * @returns The guest checkout dialog element.
 * @example
 * ```tsx
 * <GuestCheckoutModal
 *   open={showGuestModal}
 *   onClose={() => setShowGuestModal(false)}
 *   onVerified={(token) => handleGuestPayment(token)}
 * />
 * ```
 */
export function GuestCheckoutModal({ open, onClose, onVerified }: GuestCheckoutModalProps) {
  const [step, setStep] = useState<GuestCheckoutStep>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const vc = useVerificationCode({ isOpen: open && step === 'otp' });

  const resetModal = () => {
    setStep('email');
    setEmail('');
    setEmailError('');
    setIsLoading(false);
    vc.reset();
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // ── Step 1: send OTP ──────────────────────────────────────────────────────

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Введіть коректну email-адресу');
      return;
    }
    setEmailError('');
    setIsLoading(true);
    try {
      await apiService.initiateGuestVerification(trimmed);
      setEmail(trimmed);
      setStep('otp');
    } catch {
      toast.error('Не вдалося надіслати код. Спробуйте пізніше.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: verify OTP ────────────────────────────────────────────────────

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = vc.getCode();
    if (code.length !== 6) {
      vc.setError('Будь ласка, введіть повний 6-значний код');
      return;
    }
    vc.setIsSubmitting(true);
    try {
      const { token } = await apiService.confirmGuestEmail(email, code);
      handleClose();
      onVerified(token);
    } catch {
      vc.setError('Невірний або застарілий код. Спробуйте ще раз.');
      vc.reset();
    } finally {
      vc.setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!vc.canResend || vc.isResending) { return; }
    vc.setIsResending(true);
    try {
      await apiService.resendGuestVerification(email);
      toast.success('Новий код відправлено');
      vc.reset();
    } catch {
      toast.error('Не вдалося відправити код');
    } finally {
      vc.setIsResending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">

        {step === 'email' ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">Оформлення замовлення</DialogTitle>
              <DialogDescription className="text-center">
                Введіть вашу email-адресу, щоб продовжити без реєстрації.
                На неї надійдуть придбані матеріали.
              </DialogDescription>
            </DialogHeader>

            <form className="flex flex-col gap-4" onSubmit={handleEmailSubmit}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="guest-email">Електронна пошта</Label>
                <Input
                  id="guest-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  className="h-12"
                />
                {emailError && (
                  <p className="text-sm text-red-500">{emailError}</p>
                )}
              </div>

              <Button type="submit" className="w-full h-12" disabled={isLoading}>
                {isLoading ? 'Надсилання...' : 'Далі'}
              </Button>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">Підтвердження email</DialogTitle>
              <DialogDescription className="text-center">
                Ми відправили 6-значний код на
                <span className="block font-semibold text-blue-600 mt-1">{email}</span>
              </DialogDescription>
            </DialogHeader>

            <form className="flex flex-col gap-4" onSubmit={handleOtpSubmit}>
              <Label className="text-base block text-center mb-1">
                Введіть код з листа
              </Label>

              <div className="flex justify-center gap-2 mb-2">
                {vc.code.map((digit, i) => (
                  <Input
                    key={i}
                    value={digit}
                    onChange={(e) => vc.onChange(i, e)}
                    onKeyDown={vc.onKeyDown}
                    onPaste={i === 0 ? vc.onPaste : undefined}
                    maxLength={1}
                    inputMode="numeric"
                    className="h-12 text-center text-2xl font-bold"
                  />
                ))}
              </div>

              {vc.error && (
                <p className="text-sm text-red-500 text-center">{vc.error}</p>
              )}

              <Button type="submit" className="w-full h-12" disabled={vc.isSubmitting}>
                {vc.isSubmitting ? 'Перевірка...' : 'Підтвердити та оплатити'}
              </Button>

              <Button
                type="button"
                variant="link"
                className="w-full"
                onClick={handleResend}
                disabled={!vc.canResend || vc.isResending}
              >
                {vc.canResend
                  ? 'Надіслати код ще раз'
                  : `Надіслати код ще раз через ${vc.countdown} сек`}
              </Button>
            </form>
          </>
        )}

      </DialogContent>
    </Dialog>
  );
}
