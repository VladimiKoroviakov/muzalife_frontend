/**
 * @fileoverview Single entry-point for all shared TypeScript types.
 *
 * Import from `@/types` — this barrel re-exports every domain module so
 * existing call-sites require no changes.
 *
 * Domain modules:
 * - {@link module:types/api}     — ApiError, ApiResponse
 * - {@link module:types/auth}    — AuthUser, AuthState, auth response types, AuthLogoTitleProps
 * - {@link module:types/faq}     — FAQItem, QuestionProps, UseFAQsReturn
 * - {@link module:types/orders}  — PersonalOrder, CreatePersonalOrderData, UpdatePersonalOrderData, PersonalOrdersApiResponse
 * - {@link module:types/polls}   — Poll, ApiPoll, vote types, poll component props
 * - {@link module:types/product} — Product, Review, order types, product component props
 * - {@link module:types/ui}      — ErrorStateProps, IconBookmarksProps, LocalMallProps, HelpProps, CloseButtonProps
 * - {@link module:types/user}    — UserProfileApiResponse, UserProfileData
 *
 * @module types
 */

export * from './api';
export * from './auth';
export * from './faq';
export * from './orders';
export * from './polls';
export * from './product';
export * from './ui';
export * from './user';
