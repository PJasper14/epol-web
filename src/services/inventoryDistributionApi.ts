const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface DistributionFilters {
  status?: 'pending' | 'distributed' | 'completed';
  team_leader_id?: string;
  workplace_location_id?: string;
  start_date?: string;
  end_date?: string;
  per_page?: number;
}

export interface InventoryDistribution {
  id: string;
  distribution_number: string;
  status: 'pending' | 'distributed' | 'completed';
  distribution_date: string;
  distribution_notes?: string;
  received_at?: string;
  team_leader: {
    id: string;
    name: string;
  };
  workplace_location: {
    id: string;
    name: string;
  };
  distributed_by: {
    id: string;
    name: string;
  };
  received_by: {
    id: string;
    name: string;
  };
  items: DistributionItem[];
  created_at: string;
}

export interface DistributionItem {
  id: string;
  quantity_distributed: number;
  usage_notes?: string;
  inventory_item: {
    id: string;
    name: string;
    unit: string;
  };
}

export interface DistributionStatistics {
  total_distributions: number;
  pending_distributions: number;
  completed_distributions: number;
  total_items_distributed: number;
}

class InventoryDistributionApiService {
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

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          if (typeof window !== 'undefined') {
            window.location.href = '/';
          }
          throw new Error('Session expired. Please log in again.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  /**
   * Get all inventory distributions with optional filters
   */
  async getDistributions(filters: DistributionFilters = {}): Promise<{
    success: boolean;
    data: InventoryDistribution[];
    meta: {
      current_page: number;
      total: number;
      per_page: number;
      last_page: number;
    };
  }> {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.team_leader_id) params.append('team_leader_id', filters.team_leader_id);
    if (filters.workplace_location_id) params.append('workplace_location_id', filters.workplace_location_id);
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);
    if (filters.per_page) params.append('per_page', filters.per_page.toString());

    return await this.request(`/inventory-distributions?${params.toString()}`);
  }

  /**
   * Get a specific distribution by ID
   */
  async getDistribution(id: string): Promise<{
    success: boolean;
    data: InventoryDistribution;
  }> {
    return await this.request(`/inventory-distributions/${id}`);
  }

  /**
   * Create a new distribution
   */
  async createDistribution(data: {
    inventory_request_id: string;
    distribution_notes?: string;
  }): Promise<{
    success: boolean;
    data: InventoryDistribution;
    message: string;
  }> {
    return await this.request('/inventory-distributions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Update a distribution
   */
  async updateDistribution(id: string, data: {
    status?: 'pending' | 'distributed' | 'completed';
    distribution_notes?: string;
  }): Promise<{
    success: boolean;
    data: InventoryDistribution;
    message: string;
  }> {
    return await this.request(`/inventory-distributions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Mark a distribution as completed
   */
  async markCompleted(id: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return await this.request(`/inventory-distributions/${id}/mark-completed`, {
      method: 'PUT',
    });
  }

  /**
   * Get distribution statistics
   */
  async getStatistics(filters: {
    start_date?: string;
    end_date?: string;
  } = {}): Promise<{
    success: boolean;
    data: DistributionStatistics;
  }> {
    const params = new URLSearchParams();
    
    if (filters.start_date) params.append('start_date', filters.start_date);
    if (filters.end_date) params.append('end_date', filters.end_date);

    return await this.request(`/inventory-distributions/statistics/overview?${params.toString()}`);
  }
}

export const inventoryDistributionApi = new InventoryDistributionApiService();