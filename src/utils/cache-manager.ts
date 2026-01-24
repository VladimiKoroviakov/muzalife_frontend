export class CacheManager {
  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error caching ${key}:`, error);
    }
  }

  static getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key}:`, error);
      return null;
    }
  }

  static removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
    }
  }

  static setWithTimestamp(key: string, value: any): void {
    this.setItem(key, value);
    this.setItem(`${key}_timestamp`, Date.now());
  }

  static isCacheValid(key: string, duration: number): boolean {
    const timestamp = this.getItem<number>(`${key}_timestamp`);
    if (!timestamp) return false;
    return Date.now() - timestamp < duration;
  }

  static clearUserCache(): void {
    const cachePatterns = [
      /^cachedProducts/,
      /^savedProducts/,
      /^boughtProducts/,
      /^userProfile/,
      /^reviewedOrders/,
      /^cachedPersonalOrders/,
      /^cachedFAQs/,
      /^reviewedProducts/,
      /^pollsCache/,
      /_timestamp$/,
      'authToken',
    ];

    Object.keys(localStorage).forEach(key => {
      if (cachePatterns.some(pattern => 
        typeof pattern === 'string' ? key === pattern : pattern.test(key)
      )) {
        localStorage.removeItem(key);
      }
    });
  }
}