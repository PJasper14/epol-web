const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ReassignmentRequest {
  id: string;
  user_id: string;
  current_location_id: string;
  requested_location_id: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  admin_notes?: string;
  processed_by_id?: string;
  processed_at?: string;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
  };
  current_location?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    description?: string;
    is_active: boolean;
  };
  requested_location?: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
    description?: string;
    is_active: boolean;
  };
  processed_by?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}

class ReassignmentApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const token = localStorage.getItem('auth_token');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  /**
   * Get all reassignment requests
   */
  async getReassignmentRequests(): Promise<ReassignmentRequest[]> {
    try {
      const response = await this.request<ReassignmentRequest[]>('/reassignment-requests');
      console.log('API Service - Raw response:', response); // Debug log
      console.log('API Service - Response data:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching reassignment requests:', error);
      throw error;
    }
  }

  /**
   * Get a specific reassignment request
   */
  async getReassignmentRequest(id: string): Promise<ReassignmentRequest> {
    try {
      const response = await this.request<ReassignmentRequest>(`/reassignment-requests/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reassignment request:', error);
      throw error;
    }
  }

  /**
   * Approve a reassignment request
   */
  async approveReassignmentRequest(id: string, adminNotes?: string): Promise<ReassignmentRequest> {
    try {
      const response = await this.request<ReassignmentRequest>(`/reassignment-requests/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ admin_notes: adminNotes }),
      });
      return response.data;
    } catch (error) {
      console.error('Error approving reassignment request:', error);
      throw error;
    }
  }

  /**
   * Reject a reassignment request
   */
  async rejectReassignmentRequest(id: string, adminNotes: string): Promise<ReassignmentRequest> {
    try {
      const response = await this.request<ReassignmentRequest>(`/reassignment-requests/${id}/reject`, {
        method: 'PUT',
        body: JSON.stringify({ admin_notes: adminNotes }),
      });
      return response.data;
    } catch (error) {
      console.error('Error rejecting reassignment request:', error);
      throw error;
    }
  }
}

export const reassignmentApiService = new ReassignmentApiService();
