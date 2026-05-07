/**
 * @fileoverview Smoke tests for the {@link apiService} singleton.
 *
 * Verifies that the singleton is correctly assembled from all domain
 * factory functions and exposes the expected public surface.
 *
 * @module tests/unit/services/index
 */

// @vitest-environment happy-dom

import { describe, it, expect, vi } from 'vitest';

vi.mock('@/utils/cache-manager', () => ({
  CacheManager: {
    getItem: vi.fn().mockReturnValue(null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    isCacheValid: vi.fn().mockReturnValue(false),
    setWithTimestamp: vi.fn(),
    clearUserCache: vi.fn(),
  },
}));

import { apiService } from '@/services/api';

describe('apiService singleton — method surface', () => {
  describe('auth methods', () => {
    it('exposes initiateRegistration as a function', () => {
      expect(typeof apiService.initiateRegistration).toBe('function');
    });

    it('exposes verifyRegistration as a function', () => {
      expect(typeof apiService.verifyRegistration).toBe('function');
    });

    it('exposes login as a function', () => {
      expect(typeof apiService.login).toBe('function');
    });

    it('exposes googleLogin as a function', () => {
      expect(typeof apiService.googleLogin).toBe('function');
    });

    it('exposes facebookLogin as a function', () => {
      expect(typeof apiService.facebookLogin).toBe('function');
    });

    it('exposes logout as a function', () => {
      expect(typeof apiService.logout).toBe('function');
    });

    it('exposes initiateGuestVerification as a function', () => {
      expect(typeof apiService.initiateGuestVerification).toBe('function');
    });

    it('exposes confirmGuestEmail as a function', () => {
      expect(typeof apiService.confirmGuestEmail).toBe('function');
    });
  });

  describe('profile methods', () => {
    it('exposes getProfile as a function', () => {
      expect(typeof apiService.getProfile).toBe('function');
    });

    it('exposes updateName as a function', () => {
      expect(typeof apiService.updateName).toBe('function');
    });

    it('exposes deleteAccount as a function', () => {
      expect(typeof apiService.deleteAccount).toBe('function');
    });
  });

  describe('product methods', () => {
    it('exposes getProducts as a function', () => {
      expect(typeof apiService.getProducts).toBe('function');
    });

    it('exposes getProductById as a function', () => {
      expect(typeof apiService.getProductById).toBe('function');
    });

    it('exposes saveProduct as a function', () => {
      expect(typeof apiService.saveProduct).toBe('function');
    });

    it('exposes getBoughtProducts as a function', () => {
      expect(typeof apiService.getBoughtProducts).toBe('function');
    });
  });

  describe('order methods', () => {
    it('exposes getPersonalOrders as a function', () => {
      expect(typeof apiService.getPersonalOrders).toBe('function');
    });

    it('exposes createPersonalOrder as a function', () => {
      expect(typeof apiService.createPersonalOrder).toBe('function');
    });
  });

  describe('FAQ methods', () => {
    it('exposes getFAQs as a function', () => {
      expect(typeof apiService.getFAQs).toBe('function');
    });
  });

  describe('poll methods', () => {
    it('exposes getPolls as a function', () => {
      expect(typeof apiService.getPolls).toBe('function');
    });

    it('exposes submitVote as a function', () => {
      expect(typeof apiService.submitVote).toBe('function');
    });
  });

  describe('review methods', () => {
    it('exposes submitReview as a function', () => {
      expect(typeof apiService.submitReview).toBe('function');
    });

    it('exposes deleteReview as a function', () => {
      expect(typeof apiService.deleteReview).toBe('function');
    });
  });

  describe('admin methods', () => {
    it('exposes adminAddProduct as a function', () => {
      expect(typeof apiService.adminAddProduct).toBe('function');
    });

    it('exposes adminDeleteProduct as a function', () => {
      expect(typeof apiService.adminDeleteProduct).toBe('function');
    });

    it('exposes getProductAnalytics as a function', () => {
      expect(typeof apiService.getProductAnalytics).toBe('function');
    });

    it('exposes adminCreatePoll as a function', () => {
      expect(typeof apiService.adminCreatePoll).toBe('function');
    });
  });

  describe('payment methods', () => {
    it('exposes initiateProductPayment as a function', () => {
      expect(typeof apiService.initiateProductPayment).toBe('function');
    });

    it('exposes initiateCartPayment as a function', () => {
      expect(typeof apiService.initiateCartPayment).toBe('function');
    });

    it('exposes verifyPayment as a function', () => {
      expect(typeof apiService.verifyPayment).toBe('function');
    });
  });

  describe('cache utilities', () => {
    it('exposes clearUserData as a function', () => {
      expect(typeof apiService.clearUserData).toBe('function');
    });

    it('exposes clearProductsCache as a function', () => {
      expect(typeof apiService.clearProductsCache).toBe('function');
    });

    it('exposes clearAllCache as a function', () => {
      expect(typeof apiService.clearAllCache).toBe('function');
    });
  });
});
