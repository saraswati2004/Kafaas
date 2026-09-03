import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/auth.api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { LoginCredentials, RegisterCredentials } from '../types/auth.types';
import { useUIStore } from '../stores/uiStore';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const { user, role, token, isAuthenticated, login, logout, setRole, updateUser, addAddress, updateAddress, setDefaultAddress, deleteAddress } = useAuthStore();
  const { addToast } = useUIStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => authApi.login(credentials),
    onSuccess: (data) => {
      login(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      addToast({
        type: 'success',
        title: 'Welcome Back!',
        message: `Logged in successfully as ${data.user.fullName} (${data.user.role.toUpperCase()})`,
      });

      // Role-based post-login redirection
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'vendor') {
        navigate('/vendor');
      } else {
        navigate('/farmer');
      }
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Login Failed',
        message: err.message || 'Please check your credentials and try again.',
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: (credentials: RegisterCredentials) => authApi.register(credentials),
    onSuccess: (data) => {
      login(data.user, data.token);
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      addToast({
        type: 'success',
        title: 'Registration Successful',
        message: `Welcome to KaFaaS, ${data.user.fullName}! Your account is ready.`,
      });
      navigate('/farmer');
    },
    onError: (err: Error) => {
      addToast({
        type: 'error',
        title: 'Registration Failed',
        message: err.message || 'Unable to create account. Please try again.',
      });
    },
  });

  const handleLogout = () => {
    logout();
    queryClient.clear();
    addToast({
      type: 'info',
      title: 'Logged Out',
      message: 'You have been safely signed out.',
    });
    navigate('/');
  };

  return {
    user,
    role,
    token,
    isAuthenticated,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: handleLogout,
    setRole,
    updateUser,
    addAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
  };
};
