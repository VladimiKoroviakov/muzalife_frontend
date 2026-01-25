export const CACHE_KEYS = {
  PRODUCTS: 'cachedProducts',
  PRODUCTS_TIMESTAMP: 'cachedProducts_timestamp',
  SAVED_PRODUCTS: 'savedProducts',
  BOUGHT_PRODUCTS: 'boughtProducts',
  USER_PROFILE: 'userProfile',
  REVIEWED_PRODUCTS: 'reviewedProducts',
  PERSONAL_ORDERS: 'cachedPersonalOrders',
  PERSONAL_ORDERS_TIMESTAMP: 'cachedPersonalOrders_timestamp',
  FAQS: 'cachedFAQs',
  FAQS_TIMESTAMP: 'cachedFAQs_timestamp',
  POLLS: 'pollsCache',
  POLLS_TIMESTAMP: 'pollsCache_timestamp',
} as const;

export const CACHE_DURATIONS = {
  PRODUCTS: 5 * 60 * 1000,      // 5 minutes
  POLLS: 15 * 60 * 1000,        // 15 minutes
  PERSONAL_ORDERS: 20 * 60 * 1000, // 20 minutes
  USER_DATA: 30 * 60 * 1000,    // 30 minutes
  FAQS: 60 * 60 * 1000,         // 1 hour
  DEFAULT: 10 * 60 * 1000,      // 10 minutes
} as const;