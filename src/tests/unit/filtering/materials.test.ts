/**
 * @fileoverview Unit tests for pure filter utilities in filterProducts.ts.
 *
 * Tests:
 *   TC_3.4.1 — filter by type (R1.15: materials always grouped by type)
 *   TC_3.5.1 — case-insensitive search by name (R1.16)
 *   TC_3.5.2 — search + age-category filter (R1.16)
 *   TC_3.5.3 — search + event filter (R1.16)
 *
 * No DOM required — pure function tests.
 *
 * @module tests/unit/filtering/materials
 */

import { describe, it, expect } from 'vitest';
import type { Product } from '@/types';
import {
  filterByType,
  searchByTitle,
  filterByAgeCategory,
  filterByEvent,
  applyFilters,
} from '@/utils/filterProducts';

// ---------------------------------------------------------------------------
// Test fixture — 5 representative products with realistic Ukrainian strings
// ---------------------------------------------------------------------------

const products: Product[] = [
  {
    id: 1,
    title: 'Сценарій для корпоративу',
    price: 200,
    rating: 4.5,
    type: 'Сценарій',
    image: '/img/1.jpg',
    ageCategory: ['Дошкільний', 'Молодший шкільний'],
    events: ['Новий рік'],
    description: 'Опис',
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    additionalImages: [],
    additionalImageIds: [],
  },
  {
    id: 2,
    title: 'Квест на день народження',
    price: 150,
    rating: 4.0,
    type: 'Квест',
    image: '/img/2.jpg',
    ageCategory: ['Підлітковий'],
    events: ['День народження', 'Випускний'],
    description: 'Опис',
    createdAt: '2025-01-02',
    updatedAt: '2025-01-02',
    additionalImages: [],
    additionalImageIds: [],
  },
  {
    id: 3,
    title: 'КОРПОРАТИВНИЙ квест',
    price: 300,
    rating: 5.0,
    type: 'Квест',
    image: '/img/3.jpg',
    ageCategory: ['Дорослий'],
    events: ['Новий рік', 'День народження'],
    description: 'Опис',
    createdAt: '2025-01-03',
    updatedAt: '2025-01-03',
    additionalImages: [],
    additionalImageIds: [],
  },
  {
    id: 4,
    title: 'Вірш привітання',
    price: 50,
    rating: 4.8,
    type: 'Поезія',
    image: '/img/4.jpg',
    ageCategory: ['Молодший шкільний', 'Підлітковий'],
    events: ['День народження'],
    description: 'Опис',
    createdAt: '2025-01-04',
    updatedAt: '2025-01-04',
    additionalImages: [],
    additionalImageIds: [],
  },
  {
    id: 5,
    title: 'Безкоштовний конкурс',
    price: 0,
    rating: 4.2,
    type: 'Безкоштовний матеріал',
    image: '/img/5.jpg',
    ageCategory: ['Дошкільний'],
    events: ['Випускний'],
    description: 'Опис',
    createdAt: '2025-01-05',
    updatedAt: '2025-01-05',
    additionalImages: [],
    additionalImageIds: [],
  },
];

// ---------------------------------------------------------------------------
// TC_3.4.1 — Filter by type  (R1.15)
// ---------------------------------------------------------------------------

describe('filterByType — TC_3.4.1 (R1.15)', () => {
  it('returns all products when typeName is null', () => {
    expect(filterByType(products, null)).toHaveLength(5);
  });

  it('returns all products when typeName is undefined', () => {
    expect(filterByType(products, undefined)).toHaveLength(5);
  });

  it('filters to only Квест items — 2 results', () => {
    const result = filterByType(products, 'Квест');
    expect(result).toHaveLength(2);
    expect(result.every((p) => p.type === 'Квест')).toBe(true);
  });

  it('filters to only Поезія items — 1 result', () => {
    const result = filterByType(products, 'Поезія');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it('filters to only Сценарій items — 1 result', () => {
    const result = filterByType(products, 'Сценарій');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(1);
  });

  it('filters to Безкоштовний матеріал — 1 result', () => {
    expect(filterByType(products, 'Безкоштовний матеріал')).toHaveLength(1);
  });

  it('returns 0 results for a type that has no matches', () => {
    expect(filterByType(products, 'Інше')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// TC_3.5.1 — Case-insensitive search by title  (R1.16)
// ---------------------------------------------------------------------------

describe('searchByTitle — TC_3.5.1 (R1.16)', () => {
  it('returns all products when query is an empty string', () => {
    expect(searchByTitle(products, '')).toHaveLength(5);
  });

  it('returns all products when query is only whitespace', () => {
    expect(searchByTitle(products, '   ')).toHaveLength(5);
  });

  it('finds both "корпоративу" and "КОРПОРАТИВНИЙ" with query "корпорат" — 2 results', () => {
    const result = searchByTitle(products, 'корпорат');
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id).sort()).toEqual([1, 3]);
  });

  it('finds all "Квест" products case-insensitively using "КВЕСТ" — 2 results', () => {
    const result = searchByTitle(products, 'КВЕСТ');
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id).sort()).toEqual([2, 3]);
  });

  it('finds "Вірш привітання" when searching for "вірш" — 1 result', () => {
    const result = searchByTitle(products, 'вірш');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(4);
  });

  it('returns 0 results for a query that matches nothing', () => {
    expect(searchByTitle(products, 'xyz-нічого')).toHaveLength(0);
  });

  it('search is substring-based, not exact-match', () => {
    expect(searchByTitle(products, 'сценарій')).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// TC_3.5.2 — Filter by age category  (R1.16)
// ---------------------------------------------------------------------------

describe('filterByAgeCategory — TC_3.5.2 (R1.16)', () => {
  it('returns all products when ageCategoryName is null', () => {
    expect(filterByAgeCategory(products, null)).toHaveLength(5);
  });

  it('returns all products when ageCategoryName is undefined', () => {
    expect(filterByAgeCategory(products, undefined)).toHaveLength(5);
  });

  it('returns products with "Дошкільний" — ids 1 and 5 (2 results)', () => {
    const result = filterByAgeCategory(products, 'Дошкільний');
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id).sort()).toEqual([1, 5]);
  });

  it('returns products with "Підлітковий" — ids 2 and 4 (2 results)', () => {
    const result = filterByAgeCategory(products, 'Підлітковий');
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id).sort()).toEqual([2, 4]);
  });

  it('returns empty array when age category name has no matches', () => {
    expect(filterByAgeCategory(products, 'Пенсіонер')).toHaveLength(0);
  });

  it('combined — applyFilters query="квест" + ageCategoryName="Підлітковий" → only id 2', () => {
    const result = applyFilters(products, { query: 'квест', ageCategoryName: 'Підлітковий' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// TC_3.5.3 — Filter by event  (R1.16)
// ---------------------------------------------------------------------------

describe('filterByEvent — TC_3.5.3 (R1.16)', () => {
  it('returns all products when eventName is null', () => {
    expect(filterByEvent(products, null)).toHaveLength(5);
  });

  it('returns all products when eventName is undefined', () => {
    expect(filterByEvent(products, undefined)).toHaveLength(5);
  });

  it('returns products with event "Новий рік" — ids 1 and 3 (2 results)', () => {
    const result = filterByEvent(products, 'Новий рік');
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id).sort()).toEqual([1, 3]);
  });

  it('returns products with event "День народження" — ids 2, 3, 4 (3 results)', () => {
    const result = filterByEvent(products, 'День народження');
    expect(result).toHaveLength(3);
    expect(result.map((p) => p.id).sort()).toEqual([2, 3, 4]);
  });

  it('returns empty array when event name has no matches', () => {
    expect(filterByEvent(products, 'Хеловін')).toHaveLength(0);
  });

  it('combined — applyFilters query="квест" + eventName="День народження" → ids 2 and 3', () => {
    const result = applyFilters(products, { query: 'квест', eventName: 'День народження' });
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id).sort()).toEqual([2, 3]);
  });
});

// ---------------------------------------------------------------------------
// applyFilters — combined filter scenarios
// ---------------------------------------------------------------------------

describe('applyFilters — combined filters', () => {
  it('returns all products when filters object is empty', () => {
    expect(applyFilters(products, {})).toHaveLength(5);
  });

  it('type-only filter works correctly via applyFilters', () => {
    expect(applyFilters(products, { typeName: 'Квест' })).toHaveLength(2);
  });

  it('chaining type + search narrows results — Квест + "день" → id 2 only', () => {
    const result = applyFilters(products, { typeName: 'Квест', query: 'день' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('triple filter: query="квест" + age="Підлітковий" + event="День народження" → id 2 only', () => {
    const result = applyFilters(products, {
      query: 'квест',
      ageCategoryName: 'Підлітковий',
      eventName: 'День народження',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(2);
  });

  it('returns empty array when combined filters match nothing', () => {
    // No Квест products have Дошкільний age category
    const result = applyFilters(products, { typeName: 'Квест', ageCategoryName: 'Дошкільний' });
    expect(result).toHaveLength(0);
  });

  it('type + event filter: Квест + Новий рік → id 3 only', () => {
    const result = applyFilters(products, { typeName: 'Квест', eventName: 'Новий рік' });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(3);
  });
});
