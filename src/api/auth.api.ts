import { apiClient, API_BASE_URL, mockDelay } from './client';
import { User, LoginCredentials, RegisterCredentials, AuthResponse } from '../types/auth.types';
import { MOCK_USERS } from './mockData';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    if (API_BASE_URL) {
      const payload = credentials.phone
        ? { phone: credentials.phone, password: credentials.password }
        : { email: credentials.email, password: credentials.password };
      const res = await apiClient.post<any>('/auth/login', payload);
      const rawUser = res.data.user;
      const user: User = {
        id: rawUser.id,
        fullName: rawUser.full_name || rawUser.name || 'KaFaaS User',
        email: rawUser.email,
        phone: rawUser.phone || '',
        role: (rawUser.role || 'farmer').toLowerCase() as any,
        avatarUrl: rawUser.avatar_url,
        kisanId: rawUser.kisan_id,
        addresses: rawUser.addresses || [],
        createdAt: rawUser.created_at || new Date().toISOString(),
      };
      const token = res.data.access_token || res.data.token;
      return { user, token };
    }
    await mockDelay(400);
    // Find matching mock user or default to requested role / email
    const email = credentials.email?.toLowerCase().trim() || '';
    let user = MOCK_USERS.find((u) => u.email.toLowerCase() === email);

    if (!user) {
      if (email.includes('admin')) {
        user = MOCK_USERS[2]; // Admin
      } else if (email.includes('vendor')) {
        user = MOCK_USERS[1]; // Vendor
      } else {
        user = MOCK_USERS[0]; // Farmer default
      }
    }

    const token = `fake-jwt-token-${user.id}-${Date.now()}`;
    return { user, token };
  },

  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    if (API_BASE_URL) {
      const payload = {
        email: data.email,
        password: data.password,
        full_name: data.fullName,
        phone: data.phone || undefined,
        kisan_id: data.kisanId || undefined,
      };
      const res = await apiClient.post<any>('/auth/register', payload);
      const rawUser = res.data.user;
      const user: User = {
        id: rawUser.id,
        fullName: rawUser.full_name || rawUser.name || data.fullName,
        email: rawUser.email,
        phone: rawUser.phone || data.phone,
        role: (rawUser.role || 'farmer').toLowerCase() as any,
        avatarUrl: rawUser.avatar_url,
        kisanId: rawUser.kisan_id,
        addresses: rawUser.addresses || [],
        createdAt: rawUser.created_at || new Date().toISOString(),
      };
      const token = res.data.access_token || res.data.token;
      return { user, token };
    }
    await mockDelay(500);
    const newUser: User = {
      id: `usr-${Date.now()}`,
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      role: data.role || 'farmer',
      kisanId: data.role === 'farmer' ? `KISAN-REG-${Math.floor(1000 + Math.random() * 9000)}` : data.kisanId,
      addresses: [],
      createdAt: new Date().toISOString(),
    };

    const token = `fake-jwt-token-${newUser.id}-${Date.now()}`;
    return { user: newUser, token };
  },

  getCurrentUser: async (): Promise<User> => {
    if (API_BASE_URL) {
      const res = await apiClient.get<any>('/users/me');
      const rawUser = res.data;
      return {
        id: rawUser.id,
        fullName: rawUser.fullName || rawUser.name || 'KaFaaS User',
        email: rawUser.email,
        phone: rawUser.phone || '',
        role: (rawUser.role || 'farmer').toLowerCase() as any,
        avatarUrl: rawUser.avatarUrl,
        kisanId: rawUser.kisanId,
        addresses: rawUser.addresses || [],
        createdAt: rawUser.createdAt || new Date().toISOString(),
      };
    }
    await mockDelay(200);
    return MOCK_USERS[0]; // Default farmer
  },

  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    if (API_BASE_URL) {
      const res = await apiClient.post('/auth/forgot-password', { email });
      return res.data;
    }
    await mockDelay(400);
    return { success: true, message: `Password reset link has been sent to ${email}` };
  },

  resetPassword: async (password: string, token: string): Promise<{ success: boolean; message: string }> => {
    if (API_BASE_URL) {
      const res = await apiClient.post('/auth/reset-password', { password, token });
      return res.data;
    }
    await mockDelay(400);
    return { success: true, message: 'Your password has been successfully updated.' };
  },

  updateProfile: async (user: Partial<User>): Promise<User> => {
    if (API_BASE_URL) {
      const res = await apiClient.put<User>('/users/me', user);
      return res.data;
    }
    await mockDelay(300);
    return { ...MOCK_USERS[0], ...user };
  }
};
