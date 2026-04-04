/**
 * @fileoverview Personal order types: entities, request payloads, and API response shapes.
 * @module types/orders
 */

export interface PersonalOrder {
  order_id: number;
  user_id: number;
  order_title: string;
  order_description: string;
  order_status: string;
  order_price: number;
  order_material_type: string;
  order_material_age_category: string;
  order_deadline: string | null;
  order_created_at: string;
  // Admin only fields
  user_name?: string;
  user_email?: string;
}

export interface CreatePersonalOrderData {
  orderTitle: string;
  orderDescription: string;
  orderStatus?: string;
  orderPrice?: number;
  orderMaterialType: string;
  orderMaterialAgeCategory: string;
  orderDeadline?: string;
}

export interface UpdatePersonalOrderData {
  orderTitle?: string;
  orderDescription?: string;
  orderStatus?: string;
  orderPrice?: number;
  orderMaterialType?: string;
  orderMaterialAgeCategory?: string;
  orderDeadline?: string | null;
}

export interface PersonalOrdersApiResponse {
  success: boolean;
  personalOrders?: PersonalOrder[];
  personalOrder?: PersonalOrder;
  error?: string;
}
