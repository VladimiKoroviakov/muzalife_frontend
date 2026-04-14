/**
 * @fileoverview Payment result landing page for LiqPay redirect.
 *
 * LiqPay redirects the user here after completing (or cancelling) a payment.
 * The authoritative payment confirmation is handled server-to-server by the
 * backend webhook; this page is purely informational.
 *
 * On mount the bought-products cache is invalidated so the next visit to the
 * cabinet fetches fresh purchase data from the server.
 *
 * @module pages/PaymentResultPage
 */

import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CacheManager } from '@/utils/cache-manager';
import { apiService } from '@/services/api';
import {
  getPendingOrderId,
  clearPendingOrderId,
  removeOrderFromCart,
  getGuestPaymentToken,
  clearGuestPaymentToken,
} from '@/lib/liqpay';
import config from '@/config';

const fontBold = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 700" };
const fontRegular = { fontVariationSettings: "'CTGR' 0, 'wdth' 100, 'wght' 400" };

/**
 * Landing page shown after a LiqPay payment redirect.
 *
 * Clears the bought-products cache on mount so the cabinet reflects the
 * latest purchase state when the user navigates there.
 *
 * @returns The payment result page.
 * @example
 * ```tsx
 * <Route path="/payment/result" element={<PaymentResultPage />} />
 * ```
 */
export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const isFailure = status === 'failure';

  const [isVerifying, setIsVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [isGuestOrder, setIsGuestOrder] = useState(false);

  useEffect(() => {
    const claim = async () => {
      const orderId = getPendingOrderId();
      const guestToken = getGuestPaymentToken();
      const orderIsGuest = !!orderId && orderId.includes('_guest_');
      setIsGuestOrder(orderIsGuest);

      if (orderId) {
        try {
          if (orderIsGuest && guestToken) {
            await apiService.verifyGuestPayment(orderId, guestToken);
          } else if (!orderIsGuest) {
            await apiService.verifyPayment(orderId);
          }
          setVerified(true);
        } catch {
          // Webhook may have already recorded it — treat as verified.
          setVerified(true);
        }
        removeOrderFromCart(orderId);
        clearPendingOrderId();
        if (guestToken) { clearGuestPaymentToken(); }
      } else {
        // No pending order in storage (e.g. page refreshed) — skip claim.
        setVerified(true);
      }
      // Invalidate cache so the cabinet fetches fresh data for authenticated users.
      if (!orderIsGuest) {
        CacheManager.removeItem(config.cacheKeys.BOUGHT_PRODUCTS);
      }
      setIsVerifying(false);
    };

    if (!isFailure) {
      claim();
    } else {
      setIsVerifying(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isVerifying) {
    return (
      <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center px-[24px]">
        <div className="bg-white rounded-[24px] p-[48px] flex flex-col items-center gap-[16px] max-w-[480px] w-full shadow-sm">
          <p className="text-[18px] text-[#4d4d4d] m-0" style={fontRegular}>Обробка оплати...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center px-[24px]">
      <div className="bg-white rounded-[24px] p-[48px] flex flex-col items-center gap-[24px] max-w-[480px] w-full shadow-sm">

        {/* Status icon */}
        {isFailure ? (
          <div className="w-[72px] h-[72px] rounded-full bg-[#cc000015] flex items-center justify-center shrink-0">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                stroke="#cc0000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        ) : (
          <div className="w-[72px] h-[72px] rounded-full bg-[#00800015] flex items-center justify-center shrink-0">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                stroke="#008000"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        )}

        {/* Heading */}
        <div className="flex flex-col items-center gap-[8px] text-center">
          <h1 className="text-[28px] text-[#0d0d0d] m-0" style={fontBold}>
            {isFailure ? 'Оплату не завершено' : 'Дякуємо за покупку!'}
          </h1>
          <p className="text-[15px] text-[#4d4d4d] m-0" style={fontRegular}>
            {isFailure ? 'Payment was not completed.' : 'Thank you for your purchase!'}
          </p>
          {!isFailure && !verified && (
            <p className="text-[13px] text-[#ff9900] m-0" style={fontRegular}>
              Не вдалося підтвердити оплату автоматично
            </p>
          )}
        </div>

        {/* Info text */}
        <p className="text-[15px] text-[#4d4d4d] text-center m-0 leading-[22px]" style={fontRegular}>
          {isFailure
            ? 'Щось пішло не так або ви скасували оплату. Спробуйте ще раз або зверніться до підтримки.'
            : isGuestOrder
              ? 'Придбані матеріали будуть надіслані на вашу електронну пошту найближчим часом.'
              : <>Придбані матеріали з&apos;являться у розділі <strong style={fontBold}>«Мої покупки»</strong> вашого кабінету. Якщо матеріали ще не відображаються, зачекайте кілька секунд і оновіть сторінку.</>
          }
        </p>

        {/* Navigation buttons */}
        <div className="flex gap-[12px] w-full mt-[8px]">
          <Link
            to="/"
            className={`${isGuestOrder || isFailure ? 'flex-1' : ''} h-[44px] flex items-center justify-center rounded-[12px] border border-[#b3b3b3] bg-white text-[15px] text-[#4d4d4d] hover:bg-[#f2f2f2] transition-colors px-[24px]`}
            style={fontRegular}
          >
            На головну
          </Link>
          {!isGuestOrder && !isFailure && (
            <Link
              to="/cabinet"
              className="flex-1 h-[44px] flex items-center justify-center rounded-[12px] bg-[#5e89e8] text-[15px] text-white hover:opacity-90 transition-opacity"
              style={fontBold}
            >
              До кабінету
            </Link>
          )}
        </div>

      </div>
    </div>
  );
}
