import { create } from 'zustand';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

interface UIState {
  toasts: ToastMessage[];
  isMobileMenuOpen: boolean;
  isQuickSearchOpen: boolean;
  activeCropModalId: string | null;
  activeDiseaseModalId: string | null;

  // Actions
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;
  setQuickSearchOpen: (open: boolean) => void;
  setActiveCropModalId: (id: string | null) => void;
  setActiveDiseaseModalId: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  isMobileMenuOpen: false,
  isQuickSearchOpen: false,
  activeCropModalId: null,
  activeDiseaseModalId: null,

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newToast: ToastMessage = { ...toast, id };
    set({ toasts: [...get().toasts, newToast] });

    const duration = toast.duration || 4000;
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
  toggleMobileMenu: () => set({ isMobileMenuOpen: !get().isMobileMenuOpen }),
  setQuickSearchOpen: (open) => set({ isQuickSearchOpen: open }),
  setActiveCropModalId: (id) => set({ activeCropModalId: id }),
  setActiveDiseaseModalId: (id) => set({ activeDiseaseModalId: id }),
}));
