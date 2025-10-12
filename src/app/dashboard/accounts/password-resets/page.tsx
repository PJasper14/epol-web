"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Key, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Eye,
  Search,
  Filter,
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  TrendingUp,
  ArrowLeft,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { usePasswordReset, PasswordResetRequest } from '@/contexts/PasswordResetContext';


export default function PasswordResetRequestsPage() {
  const { 
    requests, 
    loading, 
    error, 
    updateRequest, 
    deleteRequest: removeRequest, 
    approveRequest, 
    rejectRequest,
    refreshRequests 
  } = usePasswordReset();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<PasswordResetRequest | null>(null);
  const [deleteRequest, setDeleteRequest] = useState<PasswordResetRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('requestedAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.user_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'userName':
        aValue = a.user_name.toLowerCase();
        bValue = b.user_name.toLowerCase();
        break;
      case 'requestedAt':
        aValue = new Date(a.requested_at).getTime();
        bValue = new Date(b.requested_at).getTime();
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      default:
        aValue = new Date(a.requested_at).getTime();
        bValue = new Date(b.requested_at).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const startIndex = filteredRequests.length > 0 ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = filteredRequests.length > 0 ? startIndex + itemsPerPage : 0;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveRequest(requestId, adminNotes || 'Request approved by administrator');
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error approving request:', error);
      // Handle error (show notification, etc.)
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest(requestId, adminNotes || 'Request rejected by administrator');
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error rejecting request:', error);
      // Handle error (show notification, etc.)
    }
  };


  const handleDelete = (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    if (request) {
      setDeleteRequest(request);
    }
  };

  const confirmDelete = () => {
    if (deleteRequest) {
      removeRequest(deleteRequest.id);
      setDeleteRequest(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-3">Password Reset Requests</h1>
              <p className="text-gray-600 text-lg">Manage and approve password reset requests from users</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/accounts">
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Accounts
              </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">Total Requests</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">{requests.length}</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                  <Key className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-yellow-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">Pending Requests</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {requests.filter(r => r.status === 'pending').length}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-md">
                  <Clock className="h-7 w-7 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">Approved Requests</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {requests.filter(r => r.status === 'approved').length}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                  <CheckCircle className="h-7 w-7 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium mb-1">Rejected Requests</p>
                  <p className="text-3xl font-bold text-gray-900 mb-2">
                    {requests.filter(r => r.status === 'rejected').length}
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                  <XCircle className="h-7 w-7 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 bg-white shadow-md border-gray-200">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="search"
                    placeholder="Search users..."
                    className="pl-10 pr-4 h-12 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 shadow-sm box-border"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button 
                  variant={showFilters ? "default" : "outline"}
                  size="icon" 
                  className={`h-12 w-12 relative transition-all duration-200 ${
                    showFilters 
                      ? "bg-red-600 text-white hover:bg-red-700 shadow-md" 
                      : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                  }`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className={`h-5 w-5 ${showFilters ? "text-white" : "text-gray-600"}`} />
                  {filterStatus !== 'all' && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                      1
                    </span>
                  )}
                </Button>
              </div>

              {showFilters && (
                <div className="pt-4 border-t border-gray-200">
                  <div>
                    <h3 className="text-sm font-semibold mb-3 text-gray-700">Status</h3>
                    <div className="flex flex-wrap gap-2">
                      {['pending', 'approved', 'rejected'].map((status) => (
                  <Button
                          key={status}
                          variant={filterStatus === status ? "default" : "outline"}
                    size="sm"
                          className={`${
                            status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                            'bg-red-100 text-red-800 border-red-200'
                          } ${filterStatus === status ? "ring-2 ring-offset-2 ring-red-500 border-red-500 shadow-md" : "border-gray-300 hover:bg-gray-50"}`}
                          onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                          {filterStatus === status && <X className="ml-1 h-3 w-3" />}
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
        <Card className="shadow-lg border-l-4 border-l-red-500">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-md">
                <Key className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-gray-900">Password Reset Requests</CardTitle>
                <CardDescription className="text-base text-gray-600">
                  {filteredRequests.length} requests • Manage all password reset requests
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-gray-50/50">
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">User</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">Requested</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentRequests.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Key className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
                        <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSearchTerm('');
                            setFilterStatus('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50/50 transition-colors duration-150 group">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900 group-hover:text-gray-700">{request.user_name}</div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {new Date(request.requested_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <Badge className={`${getStatusColor(request.status)} flex items-center gap-1 w-fit px-3 py-1`}>
                          {getStatusIcon(request.status)}
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => setSelectedRequest(request)}
                            className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View Details
                          </Button>
                              <Button
                            variant="destructive"
                                size="sm"
                            onClick={() => handleDelete(request.id)}
                            className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                          >
                            <Trash2 className="h-4 w-4" />
                              </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer */}
          {currentRequests.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div>
                  {filteredRequests.length > 0 
                    ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredRequests.length)} of ${filteredRequests.length} requests`
                    : `Showing 0 of 0 requests`
                  }
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || filteredRequests.length === 0}
                    className="h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.max(1, totalPages) }, (_, i) => i + 1).map((page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        disabled={totalPages === 1 || filteredRequests.length === 0}
                        className={`h-9 w-9 p-0 font-semibold ${
                          currentPage === page 
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-md" 
                            : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {page}
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || filteredRequests.length === 0}
                    className="h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

        {/* Request Details Modal */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="w-full max-w-2xl shadow-2xl bg-white">
              <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-200 border-b border-slate-300">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl text-gray-900">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <Key className="h-4 w-4 text-white" />
                    </div>
                    Password Reset Request Details
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedRequest(null)}
                    className="h-8 w-8 p-0 hover:bg-slate-300 rounded-md"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6 bg-white">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      User Name
                    </Label>
                      <p className="text-base text-slate-600">{selectedRequest.user_name}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Requested At
                  </Label>
                      <p className="text-base text-slate-600">{new Date(selectedRequest.requested_at).toLocaleString()}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Status
                  </Label>
                      <Badge className={`${getStatusColor(selectedRequest.status)} flex items-center gap-2 w-fit px-3 py-1 text-sm`}>
                    {getStatusIcon(selectedRequest.status)}
                    {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                  </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Contact Number
                      </Label>
                      <p className="text-base text-slate-600">{selectedRequest.user_phone}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600">Reason</Label>
                  <div className="bg-white border border-gray-300 rounded-md p-4 min-h-[80px]">
                    <p className="text-gray-900 text-sm leading-relaxed">{selectedRequest.reason}</p>
                  </div>
                </div>
                
                {selectedRequest.admin_notes && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600">Admin Notes</Label>
                    <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                      <p className="text-gray-900 text-sm">{selectedRequest.admin_notes}</p>
                    </div>
                  </div>
                )}
                
                {selectedRequest.status === 'pending' && (
                  <div className="space-y-4 pt-6 border-t border-gray-200">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600">Admin Notes (Optional)</Label>
                      <Textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        placeholder="Add notes about your decision..."
                        className="min-h-[80px] resize-none"
                      />
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => handleApprove(selectedRequest.id)}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md shadow-sm"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve Request
                      </Button>
                      <Button
                        onClick={() => handleReject(selectedRequest.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-md shadow-sm"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject Request
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    Delete Password Reset Request
                  </h3>
                  <button
                    onClick={() => setDeleteRequest(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-gray-700 text-sm leading-relaxed">
                    Are you sure you want to delete this password reset request? This action cannot be undone and will permanently remove the request from the system.
                  </p>
                </div>
                
                <div className="flex items-center justify-end gap-3">
                  <Button
                    onClick={() => setDeleteRequest(null)}
                    variant="outline"
                    className="px-4 py-2 text-sm font-medium border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition-colors"
                  >
                    Delete Request
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component for Label
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`block ${className || ''}`} {...props}>
      {children}
    </label>
  );
}
