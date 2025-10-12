const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class WorkHoursApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      // Redirect to login if no token
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.href = '/';
      }
      throw new Error('Authentication required. Please log in.');
    }
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Clear tokens and redirect on authentication failure
        localStorage.removeItem('auth_token');
        localStorage.removeItem('epol_admin');
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.href = '/';
        }
        throw new Error('Session expired. Please log in again.');
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Get work hours settings
  async getWorkHours() {
    return this.request<any>('/work-hours');
  }

  // Update work hours settings
  async updateWorkHours(data: {
    clock_in_start: string;
    clock_in_end: string;
    work_start: string;
    work_end: string;
    clock_out_time: string;
    extended_clock_out_time: string;
  }) {
    return this.request<any>('/work-hours', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const workHoursApi = new WorkHoursApiService();

