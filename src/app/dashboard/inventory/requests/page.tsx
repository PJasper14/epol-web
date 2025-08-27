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
  Download,
  RefreshCw
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { generateInventoryRequestPDF } from "@/utils/pdfExport";

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
  const [downloading, setDownloading] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockRequests: InventoryRequest[] = [
        {
          id: "REQ-001",
          user: {
            id: "1",
            name: "John Smith",
            email: "john.smith@epol.gov.ph"
          },
          reason: "Emergency cleanup operation requires additional supplies. Current stock is insufficient for the scale of the operation.",
          request_date: "2024-01-15",
          status: "pending",
          items: [
            {
              id: "1",
              inventory_item: {
                id: "INV-001",
                name: "Sako",
                unit: "Bundles"
              },
              quantity: 500,
              current_stock: 2000,
              threshold: 500
            },
            {
              id: "2",
              inventory_item: {
                id: "INV-002",
                name: "Dust Pan",
                unit: "Pcs"
              },
              quantity: 200,
              current_stock: 1200,
              threshold: 300
            }
          ],
          created_at: "2024-01-15T08:30:00Z"
        },
        {
          id: "REQ-002",
          user: {
            id: "2",
            name: "Maria Garcia",
            email: "maria.garcia@epol.gov.ph"
          },
          reason: "Regular maintenance supplies needed for weekly operations.",
          request_date: "2024-01-14",
          status: "approved",
          admin_notes: "Approved for immediate procurement. Items are essential for operations.",
          processed_by: {
            id: "admin1",
            name: "Admin User"
          },
          processed_at: "2024-01-14T14:20:00Z",
          items: [
            {
              id: "3",
              inventory_item: {
                id: "INV-004",
                name: "Knitted Gloves",
                unit: "Pairs"
              },
              quantity: 100,
              current_stock: 4000,
              threshold: 1000
            }
          ],
          created_at: "2024-01-14T10:15:00Z"
        },
        {
          id: "REQ-003",
          user: {
            id: "3",
            name: "Carlos Rodriguez",
            email: "carlos.rodriguez@epol.gov.ph"
          },
          reason: "Replacement tools needed for damaged equipment.",
          request_date: "2024-01-13",
          status: "rejected",
          admin_notes: "Rejected due to budget constraints. Please prioritize essential items only.",
          processed_by: {
            id: "admin1",
            name: "Admin User"
          },
          processed_at: "2024-01-13T16:45:00Z",
          items: [
            {
              id: "4",
              inventory_item: {
                id: "INV-007",
                name: "Sickle (Karit) RS Brand",
                unit: "Pcs"
              },
              quantity: 10,
              current_stock: 0,
              threshold: 50
            }
          ],
          created_at: "2024-01-13T09:00:00Z"
        }
      ];

      setRequests(mockRequests);
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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update the request in the local state
      setRequests(prev => prev.map(req => 
        req.id === selectedRequest.id 
          ? {
              ...req,
              status: action === 'approve' ? 'approved' : 'rejected',
              admin_notes: adminNotes,
              processed_by: { id: "admin1", name: "Admin User" },
              processed_at: new Date().toISOString()
            }
          : req
      ));

      setShowActionModal(false);
      setSelectedRequest(null);
      setAdminNotes("");
    } catch (error) {
      console.error("Error processing request:", error);
    } finally {
      setProcessing(false);
    }
  };

  const downloadRequest = async (request: InventoryRequest) => {
    setDownloading(true);
    try {
      await generateInventoryRequestPDF(request);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setDownloading(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Inventory Requests</h1>
        <p className="text-gray-600">Manage requests from team leaders</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-yellow-200 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center shadow-sm">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Approved</p>
                <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center shadow-sm">
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
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                onClick={loadRequests}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <label className="text-sm font-semibold mb-3 text-gray-700">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="border-gray-300 bg-white focus:border-red-500 focus:ring-red-500 hover:border-red-400 transition-colors">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50 rounded-lg p-1">
                      <SelectItem 
                        value="all" 
                        className="cursor-pointer rounded-md px-3 py-2 hover:bg-red-50 hover:text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700 data-[state=checked]:bg-red-100 data-[state=checked]:text-red-700 [&_svg]:hidden"
                      >
                        All statuses
                      </SelectItem>
                      <SelectItem 
                        value="pending"
                        className="cursor-pointer rounded-md px-3 py-2 hover:bg-red-50 hover:text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700 data-[state=checked]:bg-red-100 data-[state=checked]:text-red-700 [&_svg]:hidden"
                      >
                        Pending
                      </SelectItem>
                      <SelectItem 
                        value="approved"
                        className="cursor-pointer rounded-md px-3 py-2 hover:bg-red-50 hover:text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700 data-[state=checked]:bg-red-100 data-[state=checked]:text-red-700 [&_svg]:hidden"
                      >
                        Approved
                      </SelectItem>
                      <SelectItem 
                        value="rejected"
                        className="cursor-pointer rounded-md px-3 py-2 hover:bg-red-50 hover:text-red-700 data-[highlighted]:bg-red-50 data-[highlighted]:text-red-700 data-[state=checked]:bg-red-100 data-[state=checked]:text-red-700 [&_svg]:hidden"
                      >
                        Rejected
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card className="bg-white shadow-md border-gray-200">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg border-b border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">Inventory Requests</CardTitle>
              <CardDescription className="text-gray-600">Manage team leader requests</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Request ID</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Team Leader</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Items</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Request Date</th>
                  <th className="text-left py-4 px-4 font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 font-medium text-gray-900">{request.id}</td>
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900">{request.user.name}</div>
                        <div className="text-sm text-gray-500">{request.user.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={`${getStatusColor(request.status)} flex items-center gap-1`}>
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {request.items.length} item{request.items.length !== 1 ? 's' : ''}
                    </td>
                    <td className="py-4 px-4 text-gray-700">
                      {new Date(request.request_date).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 font-semibold border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                          onClick={() => handleViewDetails(request)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 px-3 font-semibold border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                          onClick={() => downloadRequest(request)}
                          disabled={downloading}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          PDF
                        </Button>
                        {request.status === 'pending' && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              className="h-9 px-3 font-semibold bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => handleAction(request, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="h-9 px-3 font-semibold bg-red-600 hover:bg-red-700 text-white"
                              onClick={() => handleAction(request, 'reject')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600 font-medium">
              Showing {filteredRequests.length} of {requests.length} requests
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
                  <p className="text-sm text-gray-500">{selectedRequest.user.email}</p>
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
                ? 'Approve this inventory request and create a purchase order'
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
