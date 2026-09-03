export type UserRole = 'guest' | 'farmer' | 'vendor' | 'admin';

export interface Address {
  id: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  addressLine1: string;
  addressLine2?: string;
  landmark?: string;
  villageOrCity: string;
  district: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  addressType: 'farm' | 'home' | 'warehouse';
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl?: string;
  kisanId?: string; // For farmers
  vendorBusinessName?: string; // For vendors
  vendorGstin?: string;
  vendorLicenseNo?: string;
  vendorApprovalStatus?: 'approved' | 'pending' | 'suspended';
  addresses: Address[];
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password?: string;
  otp?: string;
}

export interface RegisterCredentials {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword?: string;
  role?: UserRole;
  kisanId?: string;
}
