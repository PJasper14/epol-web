const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

class InventoryApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Inventory Items
  async getInventoryItems(params?: {
    search?: string;
    stock_status?: 'in_stock' | 'low_stock' | 'out_of_stock';
    per_page?: number;
    page?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.search) queryParams.append('search', params.search);
    if (params?.stock_status) queryParams.append('stock_status', params.stock_status);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const queryString = queryParams.toString();
    return this.request<any>(`/inventory-items${queryString ? `?${queryString}` : ''}`);
  }

  async getInventoryItem(id: string) {
    return this.request<any>(`/inventory-items/${id}`);
  }

  async createInventoryItem(data: {
    name: string;
    unit: string;
    quantity: number;
    threshold: number;
  }) {
    return this.request<any>('/inventory-items', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateInventoryItem(id: string, data: {
    name: string;
    unit: string;
    threshold: number;
  }) {
    return this.request<any>(`/inventory-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteInventoryItem(id: string) {
    return this.request<any>(`/inventory-items/${id}`, {
      method: 'DELETE',
    });
  }

  async adjustStock(id: string, data: {
    type: 'in' | 'out' | 'adjustment';
    quantity: number;
    reason: string;
  }) {
    return this.request<any>(`/inventory-items/${id}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getInventoryTransactions(id: string, params?: {
    type?: 'in' | 'out' | 'adjustment';
    start_date?: string;
    end_date?: string;
    per_page?: number;
    page?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.per_page) queryParams.append('per_page', params.per_page.toString());
    if (params?.page) queryParams.append('page', params.page.toString());

    const queryString = queryParams.toString();
    return this.request<any>(`/inventory-items/${id}/transactions${queryString ? `?${queryString}` : ''}`);
  }

  async getLowStockItems() {
    return this.request<any>('/inventory-items/low-stock/items');
  }

  // Inventory Requests
  async getInventoryRequests(params?: {
    status?: 'pending' | 'approved' | 'rejected';
    start_date?: string;
    end_date?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    return this.request<any>(`/inventory-requests${queryString ? `?${queryString}` : ''}`);
  }

  async getInventoryRequest(id: string) {
    return this.request<any>(`/inventory-requests/${id}`);
  }

  async updateInventoryRequestStatus(id: string, status: 'approved' | 'rejected', admin_notes?: string) {
    return this.request<any>(`/inventory-requests/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, admin_notes }),
    });
  }

  async deleteInventoryRequest(id: string) {
    return this.request<any>(`/inventory-requests/${id}`, {
      method: 'DELETE',
    });
  }

  // Purchase Orders
  async getPurchaseOrders(params?: {
    status?: 'pending' | 'approved' | 'rejected';
    start_date?: string;
    end_date?: string;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const queryString = queryParams.toString();
    return this.request<any>(`/purchase-orders${queryString ? `?${queryString}` : ''}`);
  }

  async getPurchaseOrder(id: string) {
    return this.request<any>(`/purchase-orders/${id}`);
  }

  async createPurchaseOrder(data: {
    items: Array<{
      inventory_item_id: number;
      quantity: number;
      unit_price: number;
    }>;
    notes?: string;
  }) {
    return this.request<any>('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePurchaseOrder(id: string, data: {
    items: Array<{
      inventory_item_id: number;
      quantity: number;
      unit_price: number;
    }>;
    notes?: string;
  }) {
    return this.request<any>(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async approvePurchaseOrder(id: string) {
    return this.request<any>(`/purchase-orders/${id}/approve`, {
      method: 'PUT',
    });
  }

  async rejectPurchaseOrder(id: string) {
    return this.request<any>(`/purchase-orders/${id}/reject`, {
      method: 'PUT',
    });
  }

  async deletePurchaseOrder(id: string) {
    return this.request<any>(`/purchase-orders/${id}`, {
      method: 'DELETE',
    });
  }
}

export const inventoryApi = new InventoryApiService();
