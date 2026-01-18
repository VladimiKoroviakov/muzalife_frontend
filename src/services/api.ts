const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
import { Product, Review, AuthUser } from '../types';

class ApiService {
  private token: string | null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  private setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  private getAuthHeaders() {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || 'Request failed');
        (error as any).status = response.status;
        throw error;
      }

      return data;
    } catch (error: any) {
      if (error.status !== 401) {
        console.error('API request failed:', error);
      }
      throw error;
    }
  }

  // Auth methods
  private async authRequest(endpoint: string, body: any) {
    const result = await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    if (result.token) {
      this.setToken(result.token);
    }
    
    return result;
  }

  async initiateRegistration(email: string, password: string, name: string) {
    try {
      return await this.request('/auth/register/initiate', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
    } catch (error: any) {
      throw error;
    }
  }

  async verifyRegistration(email: string, password: string, name: string, verificationCode: string) {
    return this.authRequest('/auth/register/verify', { 
      email, 
      password, 
      name, 
      verificationCode 
    });
  }

  async resendVerificationCode(email: string) {
    return this.request('/auth/register/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async login(email: string, password: string, loginType: 'regular' | 'admin' = 'regular') {
    return this.authRequest('/auth/login', { email, password, loginType });
  }

  async googleLogin(accessToken: string) {
    return this.authRequest('/auth/google', { accessToken });
  }

  async facebookLogin(accessToken: string) {
    return this.authRequest('/auth/facebook', { accessToken });
  }

  async logout() {
    this.clearUserData();
  }

  // Profile management
  async getProfile(): Promise<AuthUser> {
    const data = await this.request('/users/profile');

    if (!data || typeof data !== 'object' || !data.user) {
      throw new Error('Invalid profile response: missing user');
    }

    const user = data.user;

    if (
      typeof user.id !== 'number' ||
      typeof user.name !== 'string' ||
      typeof user.email !== 'string'
    ) {
      throw new Error('Invalid profile response: malformed user object');
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url || undefined,
      auth_provider: user.authProvider,
      created_at: user.createdAt,
      is_admin: user.is_admin ?? false,
    };
  }

  async updateName(name: string) {
    return this.request('/users/profile/name', {
      method: 'PUT',
      body: JSON.stringify({ name }),
    });
  }

  async initiateEmailChange(newEmail: string, id: number) {
    return this.request('/users/email/change/initiate', {
      method: 'POST',
      body: JSON.stringify({ newEmail, id }),
    });
  }

  async verifyEmailChange(verificationCode: string, newEmail: string, userId: number) {
    return this.request('/users/email/change/verify', {
      method: 'POST',
      body: JSON.stringify({ newEmail, verificationCode, userId }),
    });
  }

  async resendEmailChangeCode(email: string) {
    return this.request('/users/email/change/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async changePassword(oldPassword: string, newPassword: string) {
    return this.request('/users/change-password', {
      method: 'POST',
      body: JSON.stringify({ oldPassword, newPassword }),
    });
  }

  async uploadProfileImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/users/profile/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed');
    }

    console.log('🖼️ Profile image upload response:', data);
    
    // Update local cache with new image URL
    const cachedProfile = localStorage.getItem('userProfile');
    if (cachedProfile) {
      try {
        const profile = JSON.parse(cachedProfile);
        profile.imageUrl = data.imageUrl; // Use the full URL from response
        localStorage.setItem('userProfile', JSON.stringify(profile));
      } catch (e) {
        console.log('Error updating cached profile:', e);
      }
    }

    return data;
  }

  async removeProfileImage() {
    return this.request('/users/profile/image', { method: 'DELETE' });
  }

  async deleteAccount() {
    return this.request('/users/account', { method: 'DELETE' });
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    try {
      // Check if we have valid cached products
      const cached = this.getCachedProducts();
      if (cached && this.isProductsCacheValid()) {
        return cached;
      }

      console.log('🔄 Fetching fresh products from API');
      const products = await this.request('/products');
      
      // Cache the fresh products
      this.setCachedProducts(products);
      
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      
      // Fallback to cached products even if expired
      const cached = this.getCachedProducts();
      if (cached) {
        console.log('📦 Falling back to cached products (API failed)');
        return cached;
      }
      
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product> {
    return this.request(`/products/${id}`);
  }

  // Product cache management
  private getCachedProducts(): Product[] | null {
    try {
      const cached = localStorage.getItem('cachedProducts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error reading cached products:', error);
    }
    return null;
  }

  private setCachedProducts(products: Product[]): void {
    try {
      localStorage.setItem('cachedProducts', JSON.stringify(products));
      // Also store timestamp for cache expiration
      localStorage.setItem('cachedProducts_timestamp', Date.now().toString());
    } catch (error) {
      console.error('Error caching products:', error);
    }
  }

  private isProductsCacheValid(): boolean {
    try {
      const timestamp = localStorage.getItem('cachedProducts_timestamp');
      if (!timestamp) return false;
      
      const cacheTime = parseInt(timestamp, 10);
      const currentTime = Date.now();
      const cacheAge = currentTime - cacheTime;
      
      // Cache valid for 5 minutes (300000 ms)
      return cacheAge < 300000;
    } catch (error) {
      return false;
    }
  }

  // Add method to clear products cache if needed
  clearProductsCache(): void {
    try {
      localStorage.removeItem('cachedProducts');
      localStorage.removeItem('cachedProducts_timestamp');
      console.log('🧹 Products cache cleared');
    } catch (error) {
      console.error('Error clearing products cache:', error);
    }
  }

  // Update the clearUserDataCache method to include products cache
  clearUserDataCache(): void {
    try {
      const userKeys = [
        'userProfile', 
        'userPreferences', 
        'cartItems', 
        'recentProducts', 
        'searchHistory',
        'cachedProducts',
        'cachedProducts_timestamp'
      ];
      userKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing user data cache:', error);
    }
  }

  // Cache management
  private getCachedSavedProducts(): number[] | null {
    try {
      const cached = localStorage.getItem('savedProducts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error reading cached saved products:', error);
    }
    return null;
  }
  
  private getCachedBoughtProducts(): number[] | null {
    try {
      const cached = localStorage.getItem('boughtProducts');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
          return parsed;
        }
      }
    } catch (error) {
      console.error('Error reading cached bought products:', error);
    }
    return null;
  }

  // Saved products methods with localStorage caching
  async getSavedProducts(): Promise<number[]> {
    try {
      const cached = this.getCachedSavedProducts();
      if (cached) {
        console.log('Using cached saved products');
        return cached;
      }

      const response = await this.request('/saved-products/ids');
      if (response.success && Array.isArray(response.data)) {
        this.setCachedSavedProducts(response.data);
        return response.data;
      }
      
      console.error('Unexpected response format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching saved products:', error);
      return this.getCachedSavedProducts() || [];
    }
  }

  async saveProduct(productId: number): Promise<void> {
    const response = await this.request('/saved-products', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to save product');
    }

    this.addToCachedSavedProducts(productId);
  }

  async unsaveProduct(productId: number): Promise<void> {
    const response = await this.request(`/saved-products/${productId}`, {
      method: 'DELETE'
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to unsave product');
    }

    this.removeFromCachedSavedProducts(productId);
  }

  private setCachedSavedProducts(productIds: number[]): void {
    try {
      localStorage.setItem('savedProducts', JSON.stringify(productIds));
    } catch (error) {
      console.error('Error caching saved products:', error);
    }
  }

  private addToCachedSavedProducts(productId: number): void {
    const current = this.getCachedSavedProducts() || [];
    if (!current.includes(productId)) {
      this.setCachedSavedProducts([...current, productId]);
    }
  }

  private removeFromCachedSavedProducts(productId: number): void {
    const current = this.getCachedSavedProducts() || [];
    this.setCachedSavedProducts(current.filter(id => id !== productId));
  }

  clearSavedProductsCache(): void {
    try {
      localStorage.removeItem('savedProducts');
      localStorage.removeItem('savedProducts_timestamp');
    } catch (error) {
      console.error('Error clearing saved products cache:', error);
    }
  }

  // Bought products methods with localStorage caching
  async getBoughtProducts(): Promise<number[]> {
    try {
      const cached = this.getCachedBoughtProducts();
      if (cached) {
        console.log('Using cached bought products');
        return cached;
      }

      const response = await this.request('/bought-products/ids');
      if (response.success && Array.isArray(response.data)) {
        this.setCachedBoughtProducts(response.data);
        return response.data;
      }
      
      console.error('Unexpected response format:', response);
      return [];
    } catch (error) {
      console.error('Error fetching bought products:', error);
      return this.getCachedBoughtProducts() || [];
    }
  }

  async buyProduct(productId: number): Promise<void> {
    const response = await this.request('/bought-products', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to save product');
    }

    this.addToCachedBoughtProducts(productId);
  }

  private setCachedBoughtProducts(productIds: number[]): void {
    try {
      localStorage.setItem('boughtProducts', JSON.stringify(productIds));
    } catch (error) {
      console.error('Error caching bought products:', error);
    }
  }

  private addToCachedBoughtProducts(productId: number): void {
    const current = this.getCachedBoughtProducts() || [];
    if (!current.includes(productId)) {
      this.setCachedBoughtProducts([...current, productId]);
    }
  }

  clearBoughtProductsCache(): void {
    try {
      localStorage.removeItem('boughtProducts');
      localStorage.removeItem('boughtProducts_timestamp');
    } catch (error) {
      console.error('Error clearing bought products cache:', error);
    }
  }

  // Clear all user-related data on logout
  private clearUserData(): void {
    this.clearSavedProductsCache();
    this.clearBoughtProductsCache();
    this.clearUserDataCache();
    this.setToken(null);
  }

  clearAllUsersCache(): void {
    try {
      const allKeys = Object.keys(localStorage);
      const userDataKeys = allKeys.filter(key => 
        key.startsWith('boughtProducts_') || 
        key.startsWith('savedProducts_') ||
        key.startsWith('userProfile_') ||
        key.startsWith('userPreferences_') ||
        key.startsWith('cartItems_') ||
        key.includes('_timestamp')
      );
      
      userDataKeys.forEach(key => localStorage.removeItem(key));
      
      const genericKeys = [
        'savedProducts', 'savedProducts_timestamp', 'userProfile',
        'userPreferences', 'cartItems', 'authToken', 'lastLoggedInUser'
      ];
      
      genericKeys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing all users cache:', error);
    }
  }

  // Review methods
  async submitReview(materialName: string, purchaseDate: string, rating: number, reviewText: string) {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ materialName, purchaseDate, rating, reviewText }),
    });
  }

  async getReviewsByProductId(productId: string): Promise<Review[]> {
    try {
      return await this.request(`/reviews/product/${productId}`);
    } catch (error) {
      console.log('Reviews endpoint not available yet, using empty array');
      return [];
    }
  }
}

export const apiService = new ApiService();