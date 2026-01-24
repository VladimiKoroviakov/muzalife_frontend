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
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export const ORDER_STATUS_COLORS: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'text-yellow-600',
  [ORDER_STATUS.IN_PROGRESS]: 'text-blue-600',
  [ORDER_STATUS.COMPLETED]: 'text-green-600',
  [ORDER_STATUS.CANCELLED]: 'text-red-600',
  [ORDER_STATUS.APPROVED]: 'text-green-700',
  [ORDER_STATUS.REJECTED]: 'text-red-700',
} as const;

export const ORDER_STATUS_TEXT: Record<string, string> = {
  [ORDER_STATUS.PENDING]: 'Pending',
  [ORDER_STATUS.IN_PROGRESS]: 'In Progress',
  [ORDER_STATUS.COMPLETED]: 'Completed',
  [ORDER_STATUS.CANCELLED]: 'Cancelled',
  [ORDER_STATUS.APPROVED]: 'Approved',
  [ORDER_STATUS.REJECTED]: 'Rejected',
} as const;

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
} as const;