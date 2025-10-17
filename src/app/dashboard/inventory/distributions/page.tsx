"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Package,
  Clock,
  CheckCircle,
  Eye,
  X,
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  FileText,
  TrendingUp
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { inventoryDistributionApi } from "../../../../services/inventoryDistributionApi";

interface InventoryDistribution {
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

interface DistributionItem {
  id: string;
  quantity_distributed: number;
  usage_notes?: string;
  inventory_item: {
    id: string;
    name: string;
    unit: string;
  };
}

export default function InventoryDistributionsPage() {
  const [distributions, setDistributions] = useState<InventoryDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDistribution, setSelectedDistribution] = useState<InventoryDistribution | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Statistics state
  const [stats, setStats] = useState({
    total_distributions: 0,
    pending_distributions: 0,
    completed_distributions: 0,
    total_items_distributed: 0
  });

  useEffect(() => {
    loadDistributions();
    loadStatistics();
  }, []);

  const loadDistributions = async () => {
    setLoading(true);
    try {
      const response = await inventoryDistributionApi.getDistributions({
        status: statusFilter !== 'all' ? statusFilter as 'pending' | 'distributed' | 'completed' : undefined,
        per_page: 50
      });
      
      setDistributions(response.data || []);
    } catch (error) {
      console.error("Error loading distributions:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const response = await inventoryDistributionApi.getStatistics();
      setStats(response.data || stats);
    } catch (error) {
      console.error("Error loading statistics:", error);
    }
  };

  const filteredDistributions = distributions.filter(distribution => {
    const matchesSearch = !searchQuery || 
      distribution.distribution_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      distribution.team_leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      distribution.workplace_location.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || distribution.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDistributions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDistributions = filteredDistributions.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, searchQuery]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'distributed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'distributed': return <Package className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const handleViewDetails = (distribution: InventoryDistribution) => {
    setSelectedDistribution(distribution);
    setShowDetailsModal(true);
  };

  const handleMarkCompleted = async (distributionId: string) => {
    setProcessing(true);
    try {
      await inventoryDistributionApi.markCompleted(distributionId);
      await loadDistributions();
      await loadStatistics();
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Error marking distribution as completed:", error);
    } finally {
      setProcessing(false);
    }
  };

  // Check if any filters are active
  const hasActiveFilters = statusFilter !== 'all';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Inventory Distributions</h1>
          <p className="text-gray-600">Track where inventory items are distributed</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Total Distributions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_distributions}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-gray-900">{stats.pending_distributions}</p>
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
                <p className="text-sm font-medium text-gray-600 mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed_distributions}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Items Distributed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_items_distributed}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center shadow-md">
                <TrendingUp className="h-6 w-6 text-purple-600" />
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
                  placeholder="Search distributions..."
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
                      { value: "distributed", label: "Distributed" },
                      { value: "completed", label: "Completed" }
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
                            : status.value === "distributed"
                            ? statusFilter === status.value 
                              ? "bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-offset-2 ring-blue-500 shadow-md" 
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                            : statusFilter === status.value 
                              ? "bg-green-600 text-white hover:bg-green-700 ring-2 ring-offset-2 ring-green-500 shadow-md" 
                              : "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
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

      {/* Distributions Table */}
      <Card className="border-l-4 border-l-red-500 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-md">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Inventory Distributions</CardTitle>
              <CardDescription className="text-base text-gray-600">
                {filteredDistributions.length} distributions • Track item distribution transparency
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
                    Distribution #
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Team Leader
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Items
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Date
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentDistributions.length > 0 ? currentDistributions.map((distribution) => (
                  <tr key={distribution.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{distribution.distribution_number}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{distribution.team_leader.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{distribution.workplace_location.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusColor(distribution.status)}`}>
                        {getStatusIcon(distribution.status)}
                        <span className="ml-1">{distribution.status.charAt(0).toUpperCase() + distribution.status.slice(1)}</span>
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">
                        {distribution.items.length} item{distribution.items.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">
                        {new Date(distribution.distribution_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                        onClick={() => handleViewDetails(distribution)}
                      >
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">No distributions found</h3>
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
                Showing {startIndex + 1}-{Math.min(endIndex, filteredDistributions.length)} of {filteredDistributions.length} distributions
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
        <DialogContent className="sm:max-w-[700px] bg-white border-gray-200 shadow-xl [&>button]:hidden max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-3 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ${
                selectedDistribution?.status === 'completed' 
                  ? 'bg-gradient-to-br from-green-500 to-green-600'
                  : selectedDistribution?.status === 'distributed'
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                  : 'bg-gradient-to-br from-yellow-500 to-yellow-600'
              }`}>
                {selectedDistribution?.status === 'completed' ? (
                  <CheckCircle className="h-5 w-5 text-white" />
                ) : selectedDistribution?.status === 'distributed' ? (
                  <Package className="h-5 w-5 text-white" />
                ) : (
                  <Clock className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold text-gray-900">
                    Distribution Details
                  </DialogTitle>
                  {selectedDistribution && (
                    <Badge className={`${getStatusColor(selectedDistribution.status)} border flex items-center gap-1 text-xs`}>
                      {getStatusIcon(selectedDistribution.status)}
                      {selectedDistribution.status.charAt(0).toUpperCase() + selectedDistribution.status.slice(1)}
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-gray-600 text-xs mt-0.5">
                  View complete distribution information
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {selectedDistribution && (
            <div className="space-y-3 py-3">
              {/* Distribution Information Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-blue-900 mb-1">Distribution Information</p>
                    <div className="space-y-1.5 text-sm">
                      <div className="flex items-start gap-2">
                        <Package className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-700 text-xs">Distribution Number</p>
                          <p className="font-medium text-blue-900 text-sm">{selectedDistribution.distribution_number}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Calendar className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-700 text-xs">Distribution Date</p>
                          <p className="font-semibold text-blue-900 text-sm">
                            {new Date(selectedDistribution.distribution_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      {selectedDistribution.distribution_notes && (
                        <div className="flex items-start gap-2">
                          <FileText className="h-3 w-3 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-blue-700 text-xs">Notes</p>
                            <p className="font-medium text-blue-900 text-sm mt-0.5">{selectedDistribution.distribution_notes}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Leader Information Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-green-900 mb-1">Team Leader</p>
                    <p className="font-bold text-green-900 text-base">{selectedDistribution.team_leader.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3 text-green-600" />
                      <p className="text-green-700 text-sm">{selectedDistribution.workplace_location.name}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distributed Items Card */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Package className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xs font-semibold text-purple-900 mb-2">
                      Distributed Items ({selectedDistribution.items.length})
                    </h3>
                    <div className="space-y-2">
                      {selectedDistribution.items.map((item) => (
                        <div 
                          key={item.id} 
                          className="p-3 rounded-lg border-2 bg-white border-purple-200"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold text-sm text-purple-900">
                                {item.inventory_item.name}
                              </p>
                              {item.usage_notes && (
                                <p className="text-xs text-purple-700 mt-1">{item.usage_notes}</p>
                              )}
                            </div>
                            <div className="text-right ml-4">
                              <p className="text-xs text-gray-500 mb-0.5">Distributed</p>
                              <p className="font-bold text-lg text-purple-900">
                                {item.quantity_distributed}
                              </p>
                              <p className="text-xs text-gray-500">{item.inventory_item.unit}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter className="pt-3 border-t border-gray-200 flex items-center justify-end gap-2 flex-shrink-0">
            {selectedDistribution?.status !== 'completed' ? (
              <>
                <Button 
                  onClick={() => setShowDetailsModal(false)}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-6"
                >
                  Close
                </Button>
                <Button 
                  onClick={() => selectedDistribution && handleMarkCompleted(selectedDistribution.id)}
                  disabled={processing}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 shadow-lg disabled:opacity-50"
                >
                  {processing ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Mark as Completed
                </Button>
              </>
            ) : (
              <Button 
                onClick={() => setShowDetailsModal(false)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 shadow-lg"
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
