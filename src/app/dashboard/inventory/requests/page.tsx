"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  CheckCircle,
  XCircle,
  Clock, 
  AlertTriangle,
  Eye,
  X,
  ArrowLeft,
  Box
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";

import { inventoryApi } from "@/services/inventoryApi";

interface InventoryRequest {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  reason: string;
  request_date: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_notes?: string;
  processed_by?: {
    id: string;
    name: string;
  };
  processed_at?: string;
  items: InventoryRequestItem[];
  created_at: string;
}

interface InventoryRequestItem {
  id: string;
  inventory_item: {
    id: string;
    name: string;
    unit: string;
  };
  quantity: number;
  current_stock: number;
  threshold: number;
}

export default function InventoryRequestsPage() {
  const [requests, setRequests] = useState<InventoryRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<InventoryRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [adminNotes, setAdminNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Mock data for demonstration
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.getInventoryRequests({
        status: statusFilter !== 'all' ? statusFilter as 'pending' | 'approved' | 'rejected' : undefined,
        limit: 50
      });
      
      setRequests(response.data || []);
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = !searchQuery || 
      request.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (request: InventoryRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const handleAction = (request: InventoryRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setAction(action);
    setAdminNotes("");
    setShowActionModal(true);
  };

  const processRequest = async () => {
    if (!selectedRequest) return;

    setProcessing(true);
    try {
      await inventoryApi.updateInventoryRequestStatus(
        selectedRequest.id,
        action === 'approve' ? 'approved' : 'rejected',
        adminNotes
      );

      // Refresh the requests list
      await loadRequests();

      setShowActionModal(false);
      setSelectedRequest(null);
      setAdminNotes("");
    } catch (error) {
      console.error("Error processing request:", error);
    } finally {
      setProcessing(false);
    }
  };


  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;
  const totalCount = requests.length;

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Inventory Requests</h1>
          <p className="text-gray-600">Manage requests from team leaders</p>
        </div>
        <Link
          href="/dashboard/inventory" 
          className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 rounded-md flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Inventory
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900">{totalCount}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <Box className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending Requests</p>
                <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-md">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Approved Requests</p>
                <p className="text-3xl font-bold text-gray-900">{approvedCount}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Rejected Requests</p>
                <p className="text-3xl font-bold text-gray-900">{rejectedCount}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 bg-white shadow-md border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <Input
                  type="search"
                  placeholder="Search requests..."
                  className="pl-10 w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant={showFilters ? "default" : "outline"}
                size="icon" 
                className={`h-11 w-11 relative transition-all duration-200 ${
                  showFilters 
                    ? "bg-red-600 text-white hover:bg-red-700 shadow-md" 
                    : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className={`h-5 w-5 ${showFilters ? "text-white" : "text-gray-600"}`} />
                {hasActiveFilters && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    {[statusFilter].filter(filter => filter !== 'all').length}
                  </span>
                )}
              </Button>

            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: "pending", label: "Pending" },
                      { value: "approved", label: "Approved" },
                      { value: "rejected", label: "Rejected" }
                    ].map((status) => (
                      <Button
                        key={status.value}
                        variant={statusFilter === status.value ? "default" : "outline"}
                        size="sm"
                        className={`${
                          status.value === "pending" 
                            ? statusFilter === status.value 
                              ? "bg-yellow-600 text-white hover:bg-yellow-700 ring-2 ring-offset-2 ring-yellow-500 shadow-md" 
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
                            : status.value === "approved"
                            ? statusFilter === status.value 
                              ? "bg-green-600 text-white hover:bg-green-700 ring-2 ring-offset-2 ring-green-500 shadow-md" 
                              : "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                            : statusFilter === status.value 
                              ? "bg-red-600 text-white hover:bg-red-700 ring-2 ring-offset-2 ring-red-500 shadow-md" 
                              : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                        }`}
                        onClick={() => setStatusFilter(statusFilter === status.value ? "all" : status.value)}
                      >
                        {status.label}
                        {statusFilter === status.value && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="border-l-4 border-l-red-500 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-md">
              <Box className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Inventory Requests</CardTitle>
              <CardDescription className="text-base text-gray-600">
                {filteredRequests.length} requests • Manage team leader requests
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Request ID
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Team Leader
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Items
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Request Date
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRequests.length > 0 ? currentRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{request.id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{request.user.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusColor(request.status)}`}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">
                      {request.items.length} item{request.items.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">
                      {new Date(request.request_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View Details
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                              onClick={() => handleAction(request, 'approve')}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                              onClick={() => handleAction(request, 'reject')}
                            >
                              <XCircle className="h-3.5 w-3.5 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Box className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">No requests found</h3>
                          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600 font-medium">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredRequests.length)} of {filteredRequests.length} requests
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-3 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      disabled={totalPages === 1}
                      className={`h-8 w-8 p-0 ${
                        currentPage === page 
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-md" 
                          : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-3 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="sm:max-w-[600px] bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Request Details - {selectedRequest?.id}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              View complete request information
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Team Leader</label>
                  <p className="text-gray-900">{selectedRequest.user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Request Date</label>
                  <p className="text-gray-900">
                    {new Date(selectedRequest.request_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Badge className={`mt-1 ${getStatusColor(selectedRequest.status)} flex items-center gap-1`}>
                  {getStatusIcon(selectedRequest.status)}
                  {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                </Badge>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Reason</label>
                <p className="text-gray-900 mt-1">{selectedRequest.reason}</p>
              </div>
              
              {selectedRequest.admin_notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Admin Notes</label>
                  <p className="text-gray-900 mt-1">{selectedRequest.admin_notes}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-gray-700">Requested Items</label>
                <div className="mt-2 space-y-2">
                  {selectedRequest.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{item.inventory_item.name}</p>
                        <p className="text-sm text-gray-500">
                          Current: {item.current_stock} {item.inventory_item.unit} 
                          (Threshold: {item.threshold})
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {item.quantity} {item.inventory_item.unit}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Modal */}
      <Dialog open={showActionModal} onOpenChange={setShowActionModal}>
        <DialogContent className="sm:max-w-[500px] bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold text-gray-900">
              {action === 'approve' ? 'Approve' : 'Reject'} Request
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {action === 'approve' 
                ? 'Approve this inventory request'
                : 'Reject this inventory request with a reason'
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Admin Notes</label>
              <Textarea
                placeholder={action === 'approve' 
                  ? "Add any notes about the approval..."
                  : "Provide a reason for rejection..."
                }
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="mt-1 border-gray-300 focus:border-red-500 focus:ring-red-500"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionModal(false)}>
              Cancel
            </Button>
            <Button
              variant={action === 'approve' ? 'default' : 'destructive'}
              onClick={processRequest}
              disabled={processing}
              className={action === 'approve' 
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
              }
            >
              {processing ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                action === 'approve' ? 'Approve Request' : 'Reject Request'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
