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
import { useVerificationCode } from '../../hooks/useVerificationCode';

interface VerificationCodeModalProps {
  isOpen: boolean;
  email: string;

  title: string;
  description?: string;

  submitLabel: string;
  successToast?: string;

  onSubmit: (code: string) => Promise<void>;
  onResend: () => Promise<void>;

  onClose: () => void;
}

export function VerificationCodeModal({
  isOpen,
  email,
  title,
  description,
  submitLabel,
  successToast,
  onSubmit,
  onResend,
  onClose,
}: VerificationCodeModalProps) {
  const vc = useVerificationCode({ isOpen });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const code = vc.getCode();
    if (code.length !== 6) {
      vc.setError('Будь ласка, введіть повний 6-значний код');
      return;
    }

    vc.setIsSubmitting(true);

    try {
      await onSubmit(code);
      if (successToast) toast.success(successToast);
      onClose();
    } catch (err: any) {
      vc.setError(err?.message ?? 'Помилка підтвердження');
      vc.reset();
    } finally {
      vc.setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!vc.canResend || vc.isResending) return;

    vc.setIsResending(true);
    try {
      await onResend();
      toast.success('Новий код відправлено');
      vc.reset();
    } catch (err: any) {
      toast.error(err?.message ?? 'Не вдалося відправити код');
    } finally {
      vc.setIsResending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">{title}</DialogTitle>
          <DialogDescription className="text-center">
            {description ?? (
              <>
                Ми відправили 6-значний код на
                <span className="block font-semibold text-blue-600 mt-1">
                  {email}
                </span>
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Label className="text-base block text-center mb-3">
            Введіть код з листа
          </Label>

          <div className="flex justify-center gap-2 mb-4">
            {vc.code.map((digit, i) => (
              <Input
                key={i}
                value={digit}
                onChange={e => vc.onChange(i, e)}
                onKeyDown={vc.onKeyDown}
                onPaste={i === 0 ? vc.onPaste : undefined}
                maxLength={1}
                inputMode="numeric"
                className="h-12 text-center text-2xl font-bold"
              />
            ))}
          </div>

          {vc.error && (
            <p className="text-sm text-red-500 text-center mb-3">
              {vc.error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-12"
            disabled={vc.isSubmitting}
          >
            {submitLabel}
          </Button>

          <Button
            type="button"
            variant="link"
            className="w-full mt-2"
            onClick={handleResend}
            disabled={!vc.canResend || vc.isResending}
          >
            {vc.canResend
              ? 'Надіслати код ще раз'
              : `Надіслати код ще раз через ${vc.countdown} сек`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}