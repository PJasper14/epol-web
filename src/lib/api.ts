// API Configuration and Base Service
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

interface ApiResponse<T> {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  isAuthenticated() {
    this.loadToken();
    return !!this.token;
  }

  shouldRedirectToLogin() {
    if (typeof window === 'undefined') return false;
    return !this.isAuthenticated() && window.location.pathname.startsWith('/dashboard');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Reload token from localStorage in case it was updated
    this.loadToken();

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    } else {
      // If no token is available, just throw an error without redirecting
      // The contexts should handle this gracefully
      throw new Error('Authentication required. Please log in.');
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific authentication errors
        if (response.status === 401) {
          this.handleAuthenticationFailure();
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  private handleAuthenticationFailure() {
    // Clear tokens and admin data
    this.clearToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('epol_admin');
      // Only redirect if we're not already on the login page and we're on a protected route
      if (window.location.pathname !== '/' && window.location.pathname.startsWith('/dashboard')) {
        window.location.href = '/';
      }
    }
  }

  // Authentication
  async login(username: string, password: string) {
    // Use direct fetch for login (no auth token needed)
    const url = `${this.baseURL}/auth/login`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ username, password, app_type: 'web' }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.token) {
      this.setToken(data.token);
    }

    return { data };
  }

  async logout() {
    await this.request('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
  }


  async getCurrentUser() {
    // Check if user is authenticated before making the request
    if (!this.isAuthenticated()) {
      throw new Error('Authentication required. Please log in.');
    }
    return this.request<any>('/auth/user');
  }

  async createUser(userData: any) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Users
  async getUsers(params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/users${queryString}`);
  }

  async updateUser(id: string, userData: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  async activateUser(id: string) {
    return this.request<any>(`/users/${id}/activate`, {
      method: 'POST',
    });
  }

  async deactivateUser(id: string) {
    return this.request<any>(`/users/${id}/deactivate`, {
      method: 'POST',
    });
  }

  // Password Resets
  async getPasswordResets(params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/password-resets${queryString}`);
  }

  async approvePasswordReset(id: string, adminNotes?: string) {
    return this.request<any>(`/password-resets/${id}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ 
        admin_notes: adminNotes 
      }),
    });
  }

  async rejectPasswordReset(id: string, adminNotes: string) {
    return this.request<any>(`/password-resets/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ admin_notes: adminNotes }),
    });
  }

  async deletePasswordReset(id: string) {
    return this.request<any>(`/password-resets/${id}`, {
      method: 'DELETE',
    });
  }


  // Employee Assignments
  async getEmployeeAssignments(params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/employee-assignments${queryString}`);
  }

  async createEmployeeAssignment(assignmentData: any) {
    return this.request<any>('/employee-assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  }

  async updateEmployeeAssignment(id: string, assignmentData: any) {
    return this.request<any>(`/employee-assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  }

  async deleteEmployeeAssignment(id: string) {
    return this.request<any>(`/employee-assignments/${id}`, {
      method: 'DELETE',
    });
  }

  async transferEmployee(id: string, transferData: any) {
    return this.request<any>(`/employee-assignments/${id}/transfer`, {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
  }

  // Inventory Items
  async getInventoryItems(params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/inventory-items${queryString}`);
  }

  async createInventoryItem(itemData: any) {
    return this.request<any>('/inventory-items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
  }

  async updateInventoryItem(id: string, itemData: any) {
    return this.request<any>(`/inventory-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(itemData),
    });
  }

  async deleteInventoryItem(id: string) {
    return this.request<any>(`/inventory-items/${id}`, {
      method: 'DELETE',
    });
  }

  async adjustStock(id: string, adjustmentData: any) {
    return this.request<any>(`/inventory-items/${id}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify(adjustmentData),
    });
  }

  async getLowStockItems() {
    return this.request<any>('/inventory-items/low-stock/items');
  }

  async getInventoryItem(id: string) {
    return this.request<any>(`/inventory-items/${id}`);
  }

  async getInventoryTransactions(id: string, params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/inventory-items/${id}/transactions${queryString}`);
  }

  // Purchase Orders
  async getPurchaseOrders(params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/purchase-orders${queryString}`);
  }

  async createPurchaseOrder(orderData: any) {
    return this.request<any>('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async approvePurchaseOrder(id: string) {
    return this.request<any>(`/purchase-orders/${id}/approve`, {
      method: 'POST',
    });
  }

  async rejectPurchaseOrder(id: string, reason?: string) {
    return this.request<any>(`/purchase-orders/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // Incident Reports
  async getIncidentReports(params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/incident-reports${queryString}`);
  }

  async createIncidentReport(reportData: any) {
    return this.request<any>('/incident-reports', {
      method: 'POST',
      body: JSON.stringify(reportData),
    });
  }

  async updateIncidentReport(id: string, reportData: any) {
    return this.request<any>(`/incident-reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(reportData),
    });
  }

  async markIncidentOngoing(id: string) {
    return this.request<any>(`/incident-reports/${id}/mark-ongoing`, {
      method: 'PUT',
    });
  }

  async markIncidentResolved(id: string) {
    return this.request<any>(`/incident-reports/${id}/mark-resolved`, {
      method: 'PUT',
    });
  }

  async uploadIncidentMedia(id: string, formData: FormData) {
    const url = `${this.baseURL}/incident-reports/${id}/upload-media`;
    
    const headers: HeadersInit = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload media');
    }

    return response.json();
  }

  async deleteIncidentReport(id: string) {
    return this.request<any>(`/incident-reports/${id}`, {
      method: 'DELETE',
    });
  }

  // Attendance
  async getAttendanceRecords(params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/attendance/records${queryString}`);
  }

  async checkIn(checkInData: any) {
    return this.request<any>('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify(checkInData),
    });
  }

  async checkOut(checkOutData: any) {
    return this.request<any>('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify(checkOutData),
    });
  }

  async getAttendanceValidations(params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/attendance/validations${queryString}`);
  }

  async approveAttendanceValidation(id: string, notes?: string) {
    return this.request<any>(`/attendance/validations/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async rejectAttendanceValidation(id: string, notes?: string) {
    return this.request<any>(`/attendance/validations/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  async exportDTR(userId: string, dateFrom: string, dateTo: string) {
    return this.request<any>(`/attendance/export-dtr/${userId}?date_from=${dateFrom}&date_to=${dateTo}`);
  }

  // Activity Log API methods
  async getActivities(params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/activities${queryString}`);
  }

  async getActivity(id: string) {
    return this.request<any>(`/activities/${id}`);
  }

  // Workplace Location API methods
  async getWorkplaceLocations(params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return this.request<any>(`/workplace-locations${queryString}`);
  }

  async getWorkplaceLocation(id: string) {
    return this.request<any>(`/workplace-locations/${id}`);
  }

  async createWorkplaceLocation(locationData: any) {
    return this.request<any>('/workplace-locations', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  async updateWorkplaceLocation(id: string, locationData: any) {
    return this.request<any>(`/workplace-locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(locationData),
    });
  }

  async deleteWorkplaceLocation(id: string) {
    return this.request<any>(`/workplace-locations/${id}`, {
      method: 'DELETE',
    });
  }

  // Work Hours Settings
  async getWorkHours() {
    return this.request<any>('/work-hours');
  }

  async updateWorkHours(workHoursData: any) {
    return this.request<any>('/work-hours', {
      method: 'PUT',
      body: JSON.stringify(workHoursData),
    });
  }

}

export const apiService = new ApiService();
export default apiService;
