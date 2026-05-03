/**
 * @fileoverview Pure utility functions for filtering and searching products
 * in the Muzalife catalogue.
 *
 * These helpers are separated from UI components so they can be thoroughly
 * unit-tested without a DOM environment.
 *
 * Requirements: R1.15 (grouping by type), R1.16 (case-insensitive search
 * with age-category and event filters).
 *
 * @module utils/filterProducts
 */

import type { Product } from '../types';

/**
 * Filters a product list by material type name.
 * Implements R1.15 — materials always grouped by type.
 *
 * @param products - Full product catalogue.
 * @param typeName - Type name to filter by (e.g. 'Квест'), or null/undefined to return all.
 * @returns Products matching the given type, or all products if typeName is nullish.
 */
export function filterByType(
  products: Product[],
  typeName: Product['type'] | null | undefined,
): Product[] {
  if (!typeName) {return products;}
  return products.filter((p) => p.type === typeName);
}

/**
 * Case-insensitive search by product title.
 * Implements R1.16 — search by name.
 *
 * @param products - Product list to search.
 * @param query - Search string (empty string returns all products).
 * @returns Products whose title contains the query (case-insensitive).
 */
export function searchByTitle(products: Product[], query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) {return products;}
  return products.filter((p) => p.title.toLowerCase().includes(q));
}

/**
 * Filters products by age category name.
 * Implements R1.16 — age-category filter combined with search.
 *
 * @param products - Product list to filter.
 * @param ageCategoryName - Age category name, or null/undefined to skip filter.
 * @returns Products that include the given age category.
 */
export function filterByAgeCategory(
  products: Product[],
  ageCategoryName: string | null | undefined,
): Product[] {
  if (!ageCategoryName) {return products;}
  return products.filter((p) => p.ageCategory.includes(ageCategoryName));
}

/**
 * Filters products by event name.
 * Implements R1.16 — event filter combined with search.
 *
 * @param products - Product list to filter.
 * @param eventName - Event name, or null/undefined to skip filter.
 * @returns Products associated with the given event.
 */
export function filterByEvent(
  products: Product[],
  eventName: string | null | undefined,
): Product[] {
  if (!eventName) {return products;}
  return products.filter((p) => p.events.includes(eventName));
}

/**
 * Applies all active catalogue filters in sequence: type → search → age → event.
 *
 * @param products - Full product list.
 * @param filters - Active filter values.
 * @returns Filtered product list.
 */
export function applyFilters(
  products: Product[],
  filters: {
    typeName?: Product['type'] | null;
    query?: string;
    ageCategoryName?: string | null;
    eventName?: string | null;
  },
): Product[] {
  let result = products;
  if (filters.typeName) {result = filterByType(result, filters.typeName);}
  if (filters.query) {result = searchByTitle(result, filters.query);}
  if (filters.ageCategoryName) {result = filterByAgeCategory(result, filters.ageCategoryName);}
  if (filters.eventName) {result = filterByEvent(result, filters.eventName);}
  return result;
}
