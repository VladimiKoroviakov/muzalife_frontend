/**
 * @fileoverview LiqPay checkout form submission utility.
 *
 * LiqPay's hosted checkout requires a browser-initiated form POST — a plain
 * `fetch` call is not sufficient because LiqPay must set its own cookies and
 * redirect the user.  This module provides a single helper that builds and
 * submits a hidden form programmatically.
 *
 * @module lib/liqpay
 */

/**
 * Submits a hidden HTML form to the LiqPay hosted checkout page.
 *
 * Call this immediately after receiving a `{data, signature}` payload from
 * any of the backend payment-initiation endpoints.  The browser will navigate
 * away to LiqPay; after payment the user is redirected back to `/payment/result`.
 *
 * @param data      - Base64-encoded JSON payload returned by the backend.
 * @param signature - Base64-encoded SHA1 signature returned by the backend.
 * @returns void — the function triggers a full-page navigation.
 * @example
 * ```ts
 * const payment = await apiService.initiateCartPayment([1, 2]);
 * submitLiqPayForm(payment.data, payment.signature);
 * ```
 */
/** localStorage key used to persist the LiqPay order_id across the payment redirect. */
const PENDING_ORDER_KEY = 'liqpay_pending_order_id';

/**
 * Reads the order_id stored by the last {@link submitLiqPayForm} call.
 * Returns `null` if nothing is stored (user navigated directly or already claimed).
 *
 * @returns The pending order_id string, or `null`.
 */
export function getPendingOrderId(): string | null {
  return localStorage.getItem(PENDING_ORDER_KEY);
}

/**
 * Removes the pending order_id from localStorage after it has been claimed.
 */
export function clearPendingOrderId(): void {
  localStorage.removeItem(PENDING_ORDER_KEY);
}

/**
 * Removes the purchased product IDs encoded in an order_id from the
 * `cartItems` localStorage entry.  Call this after a successful payment.
 *
 * Handles `cart_*` (multiple products) and `product_*` (single product)
 * formats.  Personal-order IDs do not touch the cart.
 *
 * @param orderId - The LiqPay order_id (e.g. `cart_1-2-3_42_1714000000000`).
 */
export function removeOrderFromCart(orderId: string): void {
  try {
    const cart: number[] = JSON.parse(localStorage.getItem('cartItems') || '[]');
    let purchased: number[] = [];

    if (orderId.startsWith('cart_')) {
      purchased = orderId.split('_')[1].split('-').map(Number);
    } else if (orderId.startsWith('product_')) {
      purchased = [Number(orderId.split('_')[1])];
    }

    if (purchased.length > 0) {
      localStorage.setItem(
        'cartItems',
        JSON.stringify(cart.filter((id) => !purchased.includes(id))),
      );
    }
  } catch {
    // Non-critical: if parsing fails, leave cart as-is.
  }
}

export function submitLiqPayForm(data: string, signature: string): void {
  // Decode the LiqPay payload to extract the order_id and persist it in
  // localStorage so the payment result page can claim the purchase even when
  // LiqPay's servers cannot reach our localhost webhook.
  try {
    const payload = JSON.parse(atob(data)) as Record<string, unknown>;
    if (typeof payload.order_id === 'string') {
      localStorage.setItem(PENDING_ORDER_KEY, payload.order_id);
    }
  } catch {
    // Non-critical: if decoding fails we proceed without storing.
  }

  const form = document.createElement('form');
  form.method = 'POST';
  form.action = 'https://www.liqpay.ua/api/3/checkout';
  form.acceptCharset = 'utf-8';

  const dataInput = document.createElement('input');
  dataInput.type = 'hidden';
  dataInput.name = 'data';
  dataInput.value = data;
  form.appendChild(dataInput);

  const sigInput = document.createElement('input');
  sigInput.type = 'hidden';
  sigInput.name = 'signature';
  sigInput.value = signature;
  form.appendChild(sigInput);

  document.body.appendChild(form);
  form.submit();
}
