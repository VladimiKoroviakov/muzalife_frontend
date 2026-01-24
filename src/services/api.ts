import config from '../config';
import { CacheManager } from '../utils/cache-manager';
import { 
  Product, 
  PersonalOrder, 
  CreatePersonalOrderData, 
  UpdatePersonalOrderData, 
  UserProfileApiResponse,
  Review, 
  AuthUser,
  FAQItem,
  Poll,
  ApiPoll,
  VoterData,
  ApiResponse,
  AuthResponse,
  PersonalOrdersApiResponse
} from '../types';

class ApiService {
  private token: string | null;

  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // Token management
  private setToken(token: string | null): void {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // HTTP methods
  private async http<T>(
    endpoint: string,
    method: string = 'GET',
    body?: any,
    customHeaders?: Record<string, string>
  ): Promise<T> {
    const url = `${config.apiUrl}${endpoint}`;
    const headers = {
      ...config.defaultHeaders,
      ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      ...customHeaders,
    };

    const requestConfig: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    };

    try {
      const response = await fetch(url, requestConfig);
      const data = await response.json();

      if (!response.ok) {
        const error = new Error(data.error || 'Request failed');
        (error as any).status = response.status;
        throw error;
      }

      return data;
    } catch (error: any) {
      // Only log non-401 errors
      if (error.status !== config.httpStatusCodes.UNAUTHORIZED) {
      }
      throw error;
    }
  }

  private async get<T>(endpoint: string): Promise<T> {
    return this.http<T>(endpoint, 'GET');
  }

  private async post<T>(endpoint: string, body: any): Promise<T> {
    return this.http<T>(endpoint, 'POST', body);
  }

  private async put<T>(endpoint: string, body: any): Promise<T> {
    return this.http<T>(endpoint, 'PUT', body);
  }

  private async delete<T>(endpoint: string): Promise<T> {
    return this.http<T>(endpoint, 'DELETE');
  }

  // Auth methods
  private async authRequest<T = AuthResponse>(endpoint: string, body: any): Promise<T> {
    const result = await this.post<T>(endpoint, body);
    
    // Type-safe token check
    if (result && typeof result === 'object' && 'token' in result) {
      const token = (result as any).token;
      if (typeof token === 'string') {
        this.setToken(token);
      }
    }
    
    return result;
  }

  async initiateRegistration(email: string, password: string, name: string): Promise<ApiResponse> {
    return this.post<ApiResponse>(config.endpoints.auth.register.initiate, { email, password, name });
  }

  async verifyRegistration(
    email: string, 
    password: string, 
    name: string, 
    verificationCode: string
  ): Promise<AuthResponse> {
    return this.authRequest<AuthResponse>(config.endpoints.auth.register.verify, { 
      email, password, name, verificationCode 
    });
  }

  async resendVerificationCode(email: string): Promise<ApiResponse> {
    return this.post<ApiResponse>(config.endpoints.auth.register.resendCode, { email });
  }

  async login(
    email: string, 
    password: string, 
    loginType: 'regular' | 'admin' = 'regular'
  ): Promise<AuthResponse> {
    return this.authRequest<AuthResponse>(config.endpoints.auth.login, { email, password, loginType });
  }

  async googleLogin(accessToken: string): Promise<AuthResponse> {
    return this.authRequest<AuthResponse>(config.endpoints.auth.google, { accessToken });
  }

  async facebookLogin(accessToken: string): Promise<AuthResponse> {
    return this.authRequest<AuthResponse>(config.endpoints.auth.facebook, { accessToken });
  }

  async logout(): Promise<void> {
    this.clearUserData();
  }

  // Profile management
  async getProfile(): Promise<AuthUser> {
    // Use the UserProfileApiResponse type
    const response = await this.get<UserProfileApiResponse>(config.endpoints.users.profile);

    if (!response || !response.user) {
      throw new Error('Invalid profile response: missing user');
    }

    const user = response.user;

    // Validate required fields
    if (
      typeof user.id !== 'number' ||
      typeof user.name !== 'string' ||
      typeof user.email !== 'string' ||
      typeof user.authProvider !== 'string' ||
      typeof user.createdAt !== 'string'
    ) {
      throw new Error('Invalid profile response: malformed user object');
    }

    // Map to AuthUser type
    const profile: AuthUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url || undefined,
      auth_provider: user.authProvider,
      created_at: user.createdAt,
      is_admin: user.is_admin ?? false,
    };

    // Cache profile
    CacheManager.setItem(config.cacheKeys.USER_PROFILE, profile);
    return profile;
  }

  async updateName(name: string): Promise<void> {
    await this.put(config.endpoints.users.name, { name });
    
    // Update cached profile
    const cachedProfile = CacheManager.getItem<AuthUser>(config.cacheKeys.USER_PROFILE);
    if (cachedProfile) {
      cachedProfile.name = name;
      CacheManager.setItem(config.cacheKeys.USER_PROFILE, cachedProfile);
    }
  }

  async initiateEmailChange(newEmail: string, id: number): Promise<ApiResponse> {
    return this.post<ApiResponse>(config.endpoints.users.email.change.initiate, { newEmail, id });
  }

  async verifyEmailChange(
    verificationCode: string, 
    newEmail: string, 
    userId: number
  ): Promise<ApiResponse> {
    return this.post<ApiResponse>(config.endpoints.users.email.change.verify, { 
      newEmail, verificationCode, userId 
    });
  }

  async resendEmailChangeCode(email: string): Promise<ApiResponse> {
    return this.post<ApiResponse>(config.endpoints.users.email.change.resendCode, { email });
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.post(config.endpoints.users.password, { oldPassword, newPassword });
  }

  async uploadProfileImage(file: File): Promise<{ imageUrl: string }> {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${config.apiUrl}${config.endpoints.users.image}`, {
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
    
    // Update cached profile
    const cachedProfile = CacheManager.getItem<AuthUser>(config.cacheKeys.USER_PROFILE);
    if (cachedProfile) {
      cachedProfile.avatar_url = data.imageUrl;
      CacheManager.setItem(config.cacheKeys.USER_PROFILE, cachedProfile);
    }

    return data;
  }

  async removeProfileImage(): Promise<void> {
    await this.delete(config.endpoints.users.image);
    
    // Update cached profile
    const cachedProfile = CacheManager.getItem<AuthUser>(config.cacheKeys.USER_PROFILE);
    if (cachedProfile) {
      cachedProfile.avatar_url = undefined;
      CacheManager.setItem(config.cacheKeys.USER_PROFILE, cachedProfile);
    }
  }

  async deleteAccount(): Promise<void> {
    await this.delete(config.endpoints.users.account);
    this.clearUserData();
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    // Check cache
    const cachedProducts = CacheManager.getItem<Product[]>(config.cacheKeys.PRODUCTS);
    const isCacheValid = CacheManager.isCacheValid(
      config.cacheKeys.PRODUCTS,
      config.cacheDurations.PRODUCTS
    );

    if (cachedProducts && isCacheValid) {
      return cachedProducts;
    }

    try {
      const products = await this.get<Product[]>(config.endpoints.products);
      
      // Cache products
      CacheManager.setWithTimestamp(config.cacheKeys.PRODUCTS, products);
      
      return products;
    } catch (error) {
      
      // Fallback to cached products
      if (cachedProducts) {
        return cachedProducts;
      }
      
      throw error;
    }
  }

  async getProductById(id: string): Promise<Product> {
    return this.get<Product>(`${config.endpoints.products}/${id}`);
  }

  // Saved products methods
  async getSavedProducts(): Promise<number[]> {
    const cached = CacheManager.getItem<number[]>(config.cacheKeys.SAVED_PRODUCTS);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.get<ApiResponse<number[]>>(config.endpoints.savedProducts.ids);
      
      if (response.success && Array.isArray(response.data)) {
        CacheManager.setItem(config.cacheKeys.SAVED_PRODUCTS, response.data);
        return response.data;
      }
      
      throw new Error(response.error || 'Invalid response format');
    } catch (error) {
      return cached || [];
    }
  }

  async saveProduct(productId: number): Promise<void> {
    const response = await this.post<ApiResponse<void>>(
      config.endpoints.savedProducts.base, 
      { productId }
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to save product');
    }

    this.updateCachedArray<number>(config.cacheKeys.SAVED_PRODUCTS, productId, 'add');
  }

  async unsaveProduct(productId: number): Promise<void> {
    const response = await this.delete<ApiResponse<void>>(
      `${config.endpoints.savedProducts.base}/${productId}`
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to unsave product');
    }

    this.updateCachedArray<number>(config.cacheKeys.SAVED_PRODUCTS, productId, 'remove');
  }

  // Bought products methods
  async getBoughtProducts(): Promise<number[]> {
    const cached = CacheManager.getItem<number[]>(config.cacheKeys.BOUGHT_PRODUCTS);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.get<ApiResponse<number[]>>(config.endpoints.boughtProducts.ids);
      
      if (response.success && Array.isArray(response.data)) {
        CacheManager.setItem(config.cacheKeys.BOUGHT_PRODUCTS, response.data);
        return response.data;
      }
      
      throw new Error(response.error || 'Invalid response format');
    } catch (error) {
      return cached || [];
    }
  }

  async buyProduct(productId: number): Promise<void> {
    const response = await this.post<ApiResponse<void>>(
      config.endpoints.boughtProducts.base, 
      { productId }
    );
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to save bought product');
    }

    this.updateCachedArray<number>(config.cacheKeys.BOUGHT_PRODUCTS, productId, 'add');
  }

  // Cache helper methods
  private getCachedArray<T>(key: string): T[] | null {
    return CacheManager.getItem<T[]>(key);
  }

  private updateCachedArray<T>(
    key: string,
    item: T,
    operation: 'add' | 'remove',
    comparator: (a: T, b: T) => boolean = (a, b) => a === b
  ): void {
    const current = this.getCachedArray<T>(key) || [];
    let updated: T[];
    
    if (operation === 'add') {
      updated = current.some(existing => comparator(existing, item)) 
        ? current 
        : [...current, item];
    } else {
      updated = current.filter(existing => !comparator(existing, item));
    }
    
    CacheManager.setItem(key, updated);
  }

  // Personal orders methods
  async getPersonalOrders(): Promise<PersonalOrder[]> {
    try {
      const response = await this.get<PersonalOrdersApiResponse>(config.endpoints.personalOrders.base);
      
      if (response.success && Array.isArray(response.personalOrders)) {
        return response.personalOrders;
      }
      
      throw new Error(response.error || 'Invalid response format');
    } catch (error: any) {
      if (error.status === config.httpStatusCodes.FORBIDDEN) {
        throw new Error('Authentication required to view personal orders');
      }
      throw error;
    }
  }

  async getAllPersonalOrders(): Promise<PersonalOrder[]> {
    try {
      const response = await this.get<PersonalOrdersApiResponse>(config.endpoints.personalOrders.all);
      
      if (response.success && Array.isArray(response.personalOrders)) {
        return response.personalOrders;
      }
      
      throw new Error(response.error || 'Invalid response format');
    } catch (error: any) {
      if (error.status === config.httpStatusCodes.FORBIDDEN) {
        throw new Error('Admin access required to view all personal orders');
      }
      throw error;
    }
  }

  async getPersonalOrderById(orderId: number): Promise<PersonalOrder> {
    try {
      const response = await this.get<PersonalOrdersApiResponse>(
        `${config.endpoints.personalOrders.base}/${orderId}`
      );
      
      if (response.success && response.personalOrder) {
        return response.personalOrder;
      }
      
      throw new Error(response.error || 'Invalid response format');
    } catch (error: any) {
      if (error.status === config.httpStatusCodes.NOT_FOUND) {
        throw new Error('Order not found');
      }
      throw error;
    }
  }

  async createPersonalOrder(orderData: CreatePersonalOrderData): Promise<PersonalOrder> {
    const dataToSend = {
      orderTitle: orderData.orderTitle,
      orderDescription: orderData.orderDescription,
      orderStatus: orderData.orderStatus || 'pending',
      orderPrice: orderData.orderPrice || 0,
      orderMaterialType: orderData.orderMaterialType,
      orderMaterialAgeCategory: orderData.orderMaterialAgeCategory,
      orderDeadline: orderData.orderDeadline || null
    };

    const response = await this.post<PersonalOrdersApiResponse>(
      config.endpoints.personalOrders.base,
      dataToSend
    );
    
    if (response.success && response.personalOrder) {
      return response.personalOrder;
    }
    
    throw new Error(response.error || 'Invalid response format');
  }

  async updatePersonalOrder(
    orderId: number, 
    updateData: UpdatePersonalOrderData
  ): Promise<PersonalOrder> {
    const response = await this.put<PersonalOrdersApiResponse>(
      `${config.endpoints.personalOrders.base}/${orderId}`,
      updateData
    );
    
    if (response.success && response.personalOrder) {
      return response.personalOrder;
    }
    
    // Handle specific errors
    if (response.error?.includes('not found')) {
      throw new Error('Order not found');
    }
    if (response.error?.includes('authorized')) {
      throw new Error('Not authorized to update this order');
    }
    
    throw new Error(response.error || 'Invalid update data provided');
  }

  async deletePersonalOrder(orderId: number): Promise<void> {
    const response = await this.delete<PersonalOrdersApiResponse>(
      `${config.endpoints.personalOrders.base}/${orderId}`
    );
    
    if (!response.success) {
      if (response.error?.includes('not found')) {
        throw new Error('Order not found');
      }
      if (response.error?.includes('authorized')) {
        throw new Error('Not authorized to delete this order');
      }
      throw new Error(response.error || 'Failed to delete personal order');
    }
  }

  // FAQ methods
  async getFAQs(): Promise<FAQItem[]> {
    // Check cache first
    const cachedFAQs = CacheManager.getItem<FAQItem[]>(config.cacheKeys.FAQS);
    const isCacheValid = CacheManager.isCacheValid(
      config.cacheKeys.FAQS,
      config.cacheDurations.FAQS
    );

    if (cachedFAQs && isCacheValid) {
      return cachedFAQs;
    }

    try {
      const response = await this.get<ApiResponse<FAQItem[]>>(config.endpoints.faqs);
      
      if (response.success && Array.isArray(response.data)) {
        CacheManager.setWithTimestamp(config.cacheKeys.FAQS, response.data);
        return response.data;
      }
      
      throw new Error(response.error || 'Failed to fetch FAQs');
    } catch (error) {
      
      // Fallback to cached FAQs
      if (cachedFAQs) {
        return cachedFAQs;
      }
      
      throw error;
    }
  }

  async getFAQById(id: number): Promise<FAQItem> {
    const response = await this.get<ApiResponse<FAQItem>>(`${config.endpoints.faqs}/${id}`);
    
    if (response.success && response.data) {
      return response.data;
    }
    
    throw new Error(response.error || 'Failed to fetch FAQ');
  }

  // Poll methods
  async getPolls(): Promise<Poll[]> {
    try {
      const response = await this.get<{
        success: boolean;
        polls: ApiPoll[];
        error?: string;
      }>(config.endpoints.polls.base);
      
      if (response.success && Array.isArray(response.polls)) {
        const polls: Poll[] = response.polls
          .filter((apiPoll: ApiPoll) => !apiPoll.user_has_voted && apiPoll.is_active)
          .map((apiPoll: ApiPoll) => {
            // Store both text and ID for each option
            const options = apiPoll.options?.map(opt => opt.vote_text) || [];
            const optionVoteIds = apiPoll.options?.map(opt => opt.vote_id) || [];
            
            const voters: VoterData[] = [];
            if (apiPoll.total_votes > 0) {
              for (let i = 0; i < Math.min(3, apiPoll.total_votes); i++) {
                voters.push({
                  name: `Користувач ${i + 1}`,
                  imageUrl: null
                });
              }
            }

            return {
              id: apiPoll.poll_id,
              question: apiPoll.poll_question,
              options: options,
              optionVoteIds: optionVoteIds,
              selectedOption: null,
              hasVoted: apiPoll.user_has_voted,
              voteCount: apiPoll.total_votes || 0,
              voters: voters
            };
          });
        
        return polls;
      }
      
      throw new Error(response.error || 'Failed to fetch polls');
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Будь ласка, увійдіть в систему, щоб переглядати опитування');
      }
      throw error;
    }
  }

  async getPollDetails(pollId: number): Promise<ApiPoll> {
    try {
      const response = await this.get<{
        success: boolean;
        poll: ApiPoll;
        error?: string;
      }>(config.endpoints.polls.byId(pollId));
      
      if (response.success && response.poll) {
        return response.poll;
      }
      
      throw new Error(response.error || 'Failed to fetch poll details');
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error('Опитування не знайдено');
      }
      throw error;
    }
  }

  async submitVote(pollId: number, voteId: number): Promise<void> {
    try {
      const response = await this.post<{
        success: boolean;
        error?: string;
      }>(
        config.endpoints.polls.vote(pollId),
        { vote_id: voteId }
      );
      
      if (!response.success) {
        throw new Error(response.error || 'Не вдалося надіслати голос');
      }
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Будь ласка, увійдіть в систему, щоб проголосувати');
      }
      
      if (error.status === 400) {
        throw new Error('Невірний запит на голосування');
      }
      
      throw error;
    }
  }

  // Review methods
  async getReviewsByProductId(productId: number): Promise<Review[]> {
    try {
      const reviews = await this.get<Review[]>(`${config.endpoints.reviews}/product/${productId}`);
      return reviews;
    } catch (error: any) {
      // If no reviews exist, backend might return 404 or empty array
      if (error.status === 404) {
        return [];
      }
      throw error;
    }
  }

  async getUserReviews(userId: number): Promise<Review[]> {
    try {
      const reviews = await this.get<Review[]>(`${config.endpoints.reviews}/user/${userId}`);
      return reviews;
    } catch (error: any) {
      // Handle different error cases
      if (error.status === 404) {
        // User has no reviews
        return [];
      }
      
      // For other errors, re-throw
      throw error;
    }
  }

  async submitReview(productId: number, rating: number, comment: string): Promise<Review> {
    try {
      const review = await this.post<Review>(
        config.endpoints.reviews,
        { productId, rating, comment }
      );
      
      // Clear product cache when a new review is submitted
      this.clearProductsCache();
      
      return review;
    } catch (error: any) {
      // Check for conflict error (already reviewed)
      if (error.status === 409) {
        throw new Error('Ви вже залишили відгук на цей продукт');
      }
      throw error;
    }
  }

  async updateReview(reviewId: number, rating?: number, comment?: string): Promise<Review> {
    const updateData: any = {};
    if (rating !== undefined) updateData.rating = rating;
    if (comment !== undefined) updateData.comment = comment;
    
    const review = await this.put<Review>(
      `${config.endpoints.reviews}/${reviewId}`,
      updateData
    );
    
    // Clear product cache when a review is updated
    this.clearProductsCache();
    
    return review;
  }

  async deleteReview(reviewId: number): Promise<void> {
    await this.delete(`${config.endpoints.reviews}/${reviewId}`);
    
    // Clear product cache when a review is deleted
    this.clearProductsCache();
  }

  // Helper methods
  formatOrderDeadline(deadline: string | null): string {
    if (!deadline) return 'No deadline set';
    
    const date = new Date(deadline);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getOrderStatusColor(status: string): string {
    return config.orderStatusColors[status.toLowerCase()] || 'text-gray-600';
  }

  getOrderStatusText(status: string): string {
    return config.orderStatusText[status.toLowerCase()] || status;
  }

  // Clear methods
  clearUserData(): void {
    CacheManager.clearUserCache();
    this.setToken(null);
  }

  clearProductsCache(): void {
    CacheManager.removeItem(config.cacheKeys.PRODUCTS);
    CacheManager.removeItem(config.cacheKeys.PRODUCTS_TIMESTAMP);
  }

  clearAllCache(): void {
    CacheManager.clearUserCache();
  }
}

// Export singleton instance
export const apiService = new ApiService();