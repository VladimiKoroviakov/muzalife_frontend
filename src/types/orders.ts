/**
 * @fileoverview Personal order types: entities, request payloads, and API response shapes.
 *
 * Covers the full lifecycle of a custom material request as defined in the
 * personal orders spec (see .claude/personal-orders.md).
 *
 * @module types/orders
 */

/**
 * All valid order statuses as stored in the database.
 *
 * Transitions are system-controlled (spec §5):
 * pending → in_review → accepted | declined
 * accepted → paid | declined
 * paid → in_development → done
 */
export type OrderStatus =
  | 'pending'
  | 'in_review'
  | 'accepted'
  | 'declined'
  | 'paid'
  | 'in_development'
  | 'done';

/**
 * A personal order entity as returned by the API.
 *
 * Fields map directly to DB column names. `user_name` and `user_email` are
 * populated only in admin-facing responses.
 */
export interface PersonalOrder {
  order_id: number;
  user_id: number;
  order_title: string;
  order_description: string;
  order_status: OrderStatus;
  /** Null until the admin sets a price during the in_review → accepted transition. */
  order_price: number | null;
  /** Human-readable product type name. */
  order_material_type: string;
  /** Human-readable age category name. */
  order_material_age_category: string;
  order_deadline: string | null;
  order_created_at: string;
  /** Required when status is 'declined'; null otherwise. */
  order_decline_reason: string | null;
  // Admin-only fields
  user_name?: string;
  user_email?: string;
}

/**
 * Payload for creating a new personal order.
 *
 * The backend assigns `orderStatus = 'pending'` and `orderPrice = null` by
 * default — do not send these from the client.
 */
export interface CreatePersonalOrderData {
  orderTitle: string;
  orderDescription: string;
  /** FK id from ProductTypes table (sent as `orderMaterialType` to match backend field name). */
  orderMaterialType: number;
  /** FK id from AgeCategories table (sent as `orderMaterialAgeCategory` to match backend field name). */
  orderMaterialAgeCategory: number;
  /** ISO date string. Optional — user may omit a deadline. */
  orderDeadline?: string;
}

/**
 * Payload for updating an existing personal order.
 *
 * Users may only update while `status = 'pending'` (spec §7).
 * Admins use `adminUpdatePersonalOrder` which accepts the same shape plus
 * `orderStatus`, `orderPrice`, and `orderDeclineReason`.
 */
export interface UpdatePersonalOrderData {
  orderTitle?: string;
  orderDescription?: string;
  /** Status transitions — system validates preconditions server-side. */
  orderStatus?: OrderStatus;
  /** Set by admin only during in_review → accepted transition. */
  orderPrice?: number;
  orderMaterialType?: number;
  orderMaterialAgeCategory?: number;
  orderDeadline?: string | null;
  /** Required when transitioning to 'declined'. */
  orderDeclineReason?: string | null;
}

/** Standard API envelope for personal-order endpoints. */
export interface PersonalOrdersApiResponse {
  success: boolean;
  personalOrders?: PersonalOrder[];
  personalOrder?: PersonalOrder;
  error?: string;
}
