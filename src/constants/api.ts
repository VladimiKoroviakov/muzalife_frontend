export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  IN_REVIEW: 'in_review',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  PAID: 'paid',
  IN_DEVELOPMENT: 'in_development',
  DONE: 'done',
} as const;

/** Hex colours for order status badges in table cells. */
export const ORDER_STATUS_COLORS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: '#4d4d4d',
  [ORDER_STATUS.IN_REVIEW]: '#ff9900',
  [ORDER_STATUS.ACCEPTED]: '#ff7b00',
  [ORDER_STATUS.DECLINED]: '#cc0000',
  [ORDER_STATUS.PAID]: '#0066cc',
  [ORDER_STATUS.IN_DEVELOPMENT]: '#0066cc',
  [ORDER_STATUS.DONE]: '#008000',
} as const;

/** User-facing Ukrainian status labels (spec §6). */
export const ORDER_STATUS_LABELS_USER: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'Нове замовлення',
  [ORDER_STATUS.IN_REVIEW]: 'На розгляді',
  [ORDER_STATUS.ACCEPTED]: 'Очікує підтвердження та оплати',
  [ORDER_STATUS.DECLINED]: 'Відхилено',
  [ORDER_STATUS.PAID]: 'Оплачено',
  [ORDER_STATUS.IN_DEVELOPMENT]: 'В розробці',
  [ORDER_STATUS.DONE]: 'Виконано',
} as const;

/** Admin-facing Ukrainian status labels (spec §6). */
export const ORDER_STATUS_LABELS_ADMIN: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'Нове замовлення',
  [ORDER_STATUS.IN_REVIEW]: 'На розгляді',
  [ORDER_STATUS.ACCEPTED]: 'Очікує підтвердження від клієнта',
  [ORDER_STATUS.DECLINED]: 'Відхилено',
  [ORDER_STATUS.PAID]: 'Оплачено',
  [ORDER_STATUS.IN_DEVELOPMENT]: 'В розробці',
  [ORDER_STATUS.DONE]: 'Виконано',
} as const;

/** @deprecated Use ORDER_STATUS_LABELS_USER instead. */
export const ORDER_STATUS_TEXT = ORDER_STATUS_LABELS_USER;

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
} as const;
