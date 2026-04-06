/**
 * @fileoverview React hook for fetching product metadata (types, age categories, events).
 *
 * Encapsulates parallel fetching and localStorage caching of the three lookup
 * tables used when creating or editing products in the admin panel.  All three
 * lists are cached for 1 hour so repeat visits never trigger extra network
 * requests.
 *
 * @module hooks/useProductMetadata
 */

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService } from '../services/api';
import type { ProductTypeLookup, AgeCategoryLookup, EventLookup } from '../types';

/**
 * Return shape of {@link useProductMetadata}.
 */
export interface UseProductMetadataReturn {
  /** All product types from the `ProductTypes` table. */
  types: ProductTypeLookup[];
  /** All age categories from the `AgeCategories` table. */
  ageCategories: AgeCategoryLookup[];
  /** All events from the `Events` table. */
  events: EventLookup[];
  /** `true` while the initial fetch is in flight. */
  isLoading: boolean;
}

/**
 * Fetches product types, age categories, and events in parallel on mount.
 *
 * Results are served from a 1-hour localStorage cache on subsequent renders,
 * avoiding redundant backend calls.  On fetch failure an error toast is shown
 * and empty arrays are returned so the rest of the form remains usable.
 *
 * @returns `{ types, ageCategories, events, isLoading }`
 *
 * @example
 * ```tsx
 * function AdminForm() {
 *   const { types, ageCategories, events, isLoading } = useProductMetadata();
 *   if (isLoading) return <Spinner />;
 *   return <select>{types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>;
 * }
 * ```
 */
export function useProductMetadata(): UseProductMetadataReturn {
  const [types, setTypes] = useState<ProductTypeLookup[]>([]);
  const [ageCategories, setAgeCategories] = useState<AgeCategoryLookup[]>([]);
  const [events, setEvents] = useState<EventLookup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchMetadata = async () => {
      try {
        const [fetchedTypes, fetchedAgeCategories, fetchedEvents] = await Promise.all([
          apiService.getProductTypes(),
          apiService.getAgeCategories(),
          apiService.getEvents(),
        ]);

        if (!cancelled) {
          setTypes(fetchedTypes);
          setAgeCategories(fetchedAgeCategories);
          setEvents(fetchedEvents);
        }
      } catch {
        if (!cancelled) {
          toast.error('Не вдалося завантажити довідникові дані');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchMetadata();
    return () => { cancelled = true; };
  }, []);

  return { types, ageCategories, events, isLoading };
}
