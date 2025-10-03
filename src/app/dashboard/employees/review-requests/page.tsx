"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState, useEffect } from "react";
import { 
  ArrowLeft,
  Search, 
  Filter,
  UserCheck,
  X,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  User,
  Calendar,
  MessageSquare,
  FileText,
  Users,
  Eye,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useReassignmentRequest, ReassignmentRequest } from "@/contexts/ReassignmentRequestContext";

interface ReviewRequest {
  id: string;
  employeeName: string;
  employeePosition: string;
  currentLocation: string;
  requestedLocation: string;
  reason: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
}

export default function ReviewRequestsPage() {
  const { requests, loading, error, fetchRequests, approveRequest, rejectRequest } = useReassignmentRequest();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ReassignmentRequest | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Convert ReassignmentRequest to ReviewRequest format for compatibility
  const sampleRequests: ReviewRequest[] = requests.map(req => ({
    id: req.id,
    employeeName: req.employeeName,
    employeePosition: req.employeePosition,
    currentLocation: req.currentLocation,
    requestedLocation: req.requestedLocation,
    reason: req.reason,
    requestDate: req.requestDate,
    status: req.status,
    reviewNotes: req.reviewNotes
  }));

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };


  // Filter requests
  const filteredRequests = sampleRequests.filter(request => {
    const matchesSearch = !searchQuery || 
      request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.currentLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestedLocation.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !selectedStatus || request.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(filteredRequests.length / itemsPerPage));
  const startIndex = filteredRequests.length > 0 ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = filteredRequests.length > 0 ? startIndex + itemsPerPage : 0;
  const paginatedRequests = filteredRequests.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatus]);

  // Pagination functions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleReview = (request: ReviewRequest) => {
    // Find the corresponding ReassignmentRequest from context
    const contextRequest = requests.find(req => req.id === request.id);
    setSelectedRequest(contextRequest || null);
    setReviewNotes("");
    setShowReviewModal(true);
  };

  const handleApprove = async () => {
    if (selectedRequest) {
      try {
        setIsProcessing(true);
        await approveRequest(selectedRequest.id, reviewNotes || 'Approved by admin');
        setShowReviewModal(false);
        setSelectedRequest(null);
        setReviewNotes("");
      } catch (error) {
        console.error('Error approving request:', error);
        // You could add a toast notification here
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleReject = async () => {
    if (selectedRequest) {
      if (!reviewNotes.trim()) {
        alert('Please provide a reason for rejection.');
        return;
      }
      
      try {
        setIsProcessing(true);
        await rejectRequest(selectedRequest.id, reviewNotes);
        setShowReviewModal(false);
        setSelectedRequest(null);
        setReviewNotes("");
      } catch (error) {
        console.error('Error rejecting request:', error);
        // You could add a toast notification here
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const pendingCount = sampleRequests.filter(req => req.status === 'pending').length;
  const approvedCount = sampleRequests.filter(req => req.status === 'approved').length;
  const rejectedCount = sampleRequests.filter(req => req.status === 'rejected').length;

  // Show loading state
  if (loading && requests.length === 0) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading reassignment requests...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-600 mb-4">
              <XCircle className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Requests</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchRequests} className="bg-red-600 hover:bg-red-700">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Review Requests</h1>
          <p className="text-gray-600 mt-1">Manage reassignment/redeployment requests from team members</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/employees">
            <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Employees
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Total Requests</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{sampleRequests.length}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <FileText className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Pending</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{pendingCount}</p>
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
                <p className="text-sm text-gray-600 font-medium mb-1">Approved</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{approvedCount}</p>
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
                <p className="text-sm text-gray-600 font-medium mb-1">Rejected</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{rejectedCount}</p>
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
                {(selectedStatus) && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    1
                  </span>
                )}
              </Button>
            </div>
            {showFilters && (
              <div className="space-y-6 pt-4 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'approved', 'rejected'].map((status) => (
                      <Button
                        key={status}
                        variant={selectedStatus === status ? "default" : "outline"}
                        size="sm"
                        className={
                          status === 'pending'
                            ? selectedStatus === status
                              ? "bg-yellow-600 text-white hover:bg-yellow-700 ring-2 ring-offset-2 ring-yellow-500 shadow-md"
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
                            : status === 'approved'
                            ? selectedStatus === status
                              ? "bg-green-600 text-white hover:bg-green-700 ring-2 ring-offset-2 ring-green-500 shadow-md"
                              : "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                            : status === 'rejected'
                            ? selectedStatus === status
                              ? "bg-red-600 text-white hover:bg-red-700 ring-2 ring-offset-2 ring-red-500 shadow-md"
                              : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200"
                        }
                        onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        {selectedStatus === status && (
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
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Request List</CardTitle>
              <CardDescription className="text-base text-gray-600">
                {filteredRequests.length} request(s) found • Manage reassignment and redeployment requests
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
                    Employee
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Location Change
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">{request.employeeName}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm">
                        <div className="flex items-center gap-2 text-gray-600 mb-1">
                          <MapPin className="h-3 w-3" />
                          <span className="font-medium">From:</span>
                          <span>{request.currentLocation}</span>
                        </div>
                        <div className="flex items-center gap-2 text-blue-600">
                          <MapPin className="h-3 w-3" />
                          <span className="font-medium">To:</span>
                          <span>{request.requestedLocation}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <Badge className={`${getStatusColor(request.status)} border flex items-center gap-1 w-fit`}>
                        {getStatusIcon(request.status)}
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {request.status === 'pending' ? (
                          <Button
                            size="sm"
                            onClick={() => handleReview(request)}
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Review
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleReview(request)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View Details
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination - Integrated as table footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="text-sm text-gray-600 font-medium">
                {filteredRequests.length > 0 
                  ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredRequests.length)} of ${filteredRequests.length} records`
                  : `Showing 0 of 0 records`
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
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={showReviewModal} onOpenChange={setShowReviewModal}>
        <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto bg-white border-gray-200 shadow-xl">
          <DialogHeader className="pb-3">
            <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-orange-600" />
              Reassignment/Redeployment Request
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Review and make a decision on this reassignment/redeployment request.
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="py-3 space-y-3">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Employee Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium">{selectedRequest.employeeName}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Position:</span>
                    <p className="font-medium">{selectedRequest.employeePosition}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Request ID:</span>
                    <p className="font-medium">{selectedRequest.id}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Location Details</h3>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-500">Current Location:</span>
                    <span className="font-medium">{selectedRequest.currentLocation}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    <span className="text-gray-500">Requested Location:</span>
                    <span className="font-medium text-blue-600">{selectedRequest.requestedLocation}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Request Details</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-gray-500">Request Date:</span>
                    <p className="font-medium">{selectedRequest.requestDate}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Reason:</span>
                    <p className="font-medium mt-1">{selectedRequest.reason}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review-notes" className="text-sm font-medium text-gray-700">
                  {selectedRequest.status === 'pending' ? 'Review Notes (Optional)' : 'Review Notes'}
                </Label>
                {selectedRequest.status === 'pending' ? (
                  <Textarea
                    id="review-notes"
                    placeholder="Add your review notes here..."
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                    rows={2}
                  />
                ) : (
                  <div className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-sm text-gray-600 min-h-[60px]">
                    {selectedRequest.reviewNotes || 'No review notes provided'}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="pt-3 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => setShowReviewModal(false)} 
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            {selectedRequest?.status === 'pending' && (
              <>
                <Button 
                  onClick={handleReject}
                  disabled={isProcessing}
                  className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <X className="h-4 w-4 mr-2" />
                  )}
                  {isProcessing ? 'Processing...' : 'Reject'}
                </Button>
                <Button 
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
                >
                  {isProcessing ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <UserCheck className="h-4 w-4 mr-2" />
                  )}
                  {isProcessing ? 'Processing...' : 'Approve'}
                </Button>
              </>
            )}
            {selectedRequest?.status !== 'pending' && (
              <Button 
                onClick={() => setShowReviewModal(false)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
