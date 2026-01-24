import { 
  CACHE_DURATIONS, 
  CACHE_KEYS, 
  HTTP_STATUS_CODES, 
  ORDER_STATUS, 
  ORDER_STATUS_COLORS,
  ORDER_STATUS_TEXT,
  CONTENT_TYPES 
} from '../constants';

const config = {
  // Environment variables
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  appName: import.meta.env.VITE_APP_NAME || 'MuzaLife',
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Constants
  cacheDurations: CACHE_DURATIONS,
  cacheKeys: CACHE_KEYS,
  httpStatusCodes: HTTP_STATUS_CODES,
  orderStatus: ORDER_STATUS,
  orderStatusColors: ORDER_STATUS_COLORS,
  orderStatusText: ORDER_STATUS_TEXT,
  contentTypes: CONTENT_TYPES,
  
  
  // Default headers
  defaultHeaders: {
    'Content-Type': CONTENT_TYPES.JSON,
  },
  
  // Feature flags
  features: {
    enableCache: true,
    enableOfflineMode: false,
  },
  
  // API endpoints
  endpoints: {
    auth: {
      login: '/auth/login',
      register: {
        initiate: '/auth/register/initiate',
        verify: '/auth/register/verify',
        resendCode: '/auth/register/resend-code',
      },
      google: '/auth/google',
      facebook: '/auth/facebook',
    },
    users: {
      profile: '/users/profile',
      name: '/users/profile/name',
      email: {
        change: {
          initiate: '/users/email/change/initiate',
          verify: '/users/email/change/verify',
          resendCode: '/users/email/change/resend-code',
        },
      },
      password: '/users/change-password',
      image: '/users/profile/image',
      account: '/users/account',
    },
    products: '/products',
    savedProducts: {
      base: '/saved-products',
      ids: '/saved-products/ids',
    },
    boughtProducts: {
      base: '/bought-products',
      ids: '/bought-products/ids',
    },
    personalOrders: {
      base: '/personal-orders',
      all: '/personal-orders/all',
    },
    reviews: '/reviews',
    faqs: '/faqs',
    polls: {
      base: '/polls',
      byId: (id: number) => `/polls/${id}`,
      vote: (id: number) => `/polls/${id}/vote`,
    },
  },
} as const;

export default config;