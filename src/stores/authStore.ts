import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, Address } from '../types/auth.types';
import { MOCK_USERS } from '../api/mockData';

interface AuthState {
  user: User | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (user: User, token: string) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
  updateUser: (user: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => void;
  updateAddress: (id: string, address: Partial<Address>) => void;
  setDefaultAddress: (id: string) => void;
  deleteAddress: (id: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: MOCK_USERS[0], // Start logged in as Farmer for smooth out-of-the-box experience
      role: 'farmer',
      token: 'mock-jwt-farmer-token-2026',
      isAuthenticated: true,
      isLoading: false,

      login: (user: User, token: string) => {
        localStorage.setItem('kafaas_auth_token', token);
        set({
          user,
          role: user.role,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('kafaas_auth_token');
        set({
          user: null,
          role: 'guest',
          token: null,
          isAuthenticated: false,
        });
      },

      setRole: (role: UserRole) => {
        if (role === 'guest') {
          get().logout();
          return;
        }

        let demoUser: User;
        if (role === 'vendor') {
          demoUser = MOCK_USERS[1];
        } else if (role === 'admin') {
          demoUser = MOCK_USERS[2];
        } else {
          demoUser = MOCK_USERS[0];
        }

        const token = `mock-jwt-${role}-token-2026`;
        localStorage.setItem('kafaas_auth_token', token);
        set({
          user: demoUser,
          role,
          token,
          isAuthenticated: true,
        });
      },

      updateUser: (updates: Partial<User>) => {
        const current = get().user;
        if (!current) return;
        set({
          user: { ...current, ...updates },
        });
      },

      addAddress: (addressData: Omit<Address, 'id'>) => {
        const current = get().user;
        if (!current) return;
        const newAddress: Address = {
          ...addressData,
          id: `addr-${Date.now()}`,
          isDefault: current.addresses.length === 0 ? true : addressData.isDefault,
        };

        let updatedAddresses = [...current.addresses];
        if (newAddress.isDefault) {
          updatedAddresses = updatedAddresses.map((a) => ({ ...a, isDefault: false }));
        }
        updatedAddresses.push(newAddress);

        set({
          user: {
            ...current,
            addresses: updatedAddresses,
          },
        });
      },

      updateAddress: (id: string, updates: Partial<Address>) => {
        const current = get().user;
        if (!current) return;
        let updatedAddresses = current.addresses.map((a) => {
          if (a.id === id) {
            return { ...a, ...updates };
          }
          if (updates.isDefault) {
            return { ...a, isDefault: false };
          }
          return a;
        });

        set({
          user: {
            ...current,
            addresses: updatedAddresses,
          },
        });
      },

      setDefaultAddress: (id: string) => {
        const current = get().user;
        if (!current) return;
        const updatedAddresses = current.addresses.map((a) => ({
          ...a,
          isDefault: a.id === id,
        }));

        set({
          user: {
            ...current,
            addresses: updatedAddresses,
          },
        });
      },

      deleteAddress: (id: string) => {
        const current = get().user;
        if (!current) return;
        const updatedAddresses = current.addresses.filter((a) => a.id !== id);
        if (updatedAddresses.length > 0 && !updatedAddresses.some((a) => a.isDefault)) {
          updatedAddresses[0].isDefault = true;
        }

        set({
          user: {
            ...current,
            addresses: updatedAddresses,
          },
        });
      },
    }),
    {
      name: 'kafaas_auth_session',
    }
  )
);
