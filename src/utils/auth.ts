/**
 * Authentication utility functions
 */

export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('auth_token');
  const admin = localStorage.getItem('epol_admin');
  
  return !!(token && admin);
};

export const clearAuth = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('epol_admin');
};

export const redirectToLogin = (): void => {
  if (typeof window === 'undefined') return;
  
  if (window.location.pathname !== '/') {
    window.location.href = '/';
  }
};
