"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertCircle, Download, Filter, Search, ShieldAlert, Clock, CheckCircle, AlertTriangle, X, Eye, Trash2, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useIncidentContext } from "./IncidentContext";
import { generateSafeguardingPDF } from "@/utils/safeguardingPdfExport";

// Official incident types by priority (matching mobile app)
const incidentTypes = {
  high: [
    'Serious Injury',
    'Medical Emergency',
    'Traffic Accident',
    'Security Threat',
    'Fire Emergency',
    'Wildlife Attack',
    'Chemical Exposure'
  ],
  medium: [
    'Minor Injury',
    'Tool Damage',
    'Road Obstruction',
    'Workplace Dispute',
    'Public Complaint',
    'Property Damage',
    'Illegal Dumping'
  ],
  low: [
    'Vandalism',
    'Cracked Pavements',
    'Damaged Public Utility',
    'Uniform Issue',
    'Area Access Issue',
    'System Performance Issue',
    'Weather-related Delays'
  ]
};

// Helper function to convert 24-hour time to 12-hour format
const formatTimeTo12Hour = (time24: string) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

// Function to get priority from incident type
const getPriorityFromIncidentType = (incidentType: string): string => {
  if (incidentTypes.high.includes(incidentType)) return 'High';
  if (incidentTypes.medium.includes(incidentType)) return 'Medium';
  if (incidentTypes.low.includes(incidentType)) return 'Low';
  return 'Medium'; // Default fallback
};

export default function SafeguardingRecordsPage() {
  const { incidents, loading, error, deleteIncident, refreshIncidents } = useIncidentContext();
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [incidentToDelete, setIncidentToDelete] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Check if any filters are active (but don't include search)
  const hasActiveFilters = selectedPriority !== null || selectedStatus !== null;
  
  // Check if any search or filters are active (for UI purposes)
  const hasAnyFiltering = hasActiveFilters || searchQuery !== "";

  // Filter incidents based on selected criteria
  const filteredReports = incidents.filter(report => {
    const matchesPriority = !selectedPriority || report.priority === selectedPriority;
    const matchesStatus = !selectedStatus || report.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPriority && matchesStatus && matchesSearch;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReports = filteredReports.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedPriority, selectedStatus, searchQuery]);

  // Function to handle PDF export
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Use all filtered incidents for export, not just current page
      const result = await generateSafeguardingPDF(filteredReports);
      if (!result) {
        console.error("Failed to generate PDF");
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Function to handle delete incident
  const handleDeleteIncident = (incidentId: string) => {
    setIncidentToDelete(incidentId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (incidentToDelete) {
      deleteIncident(incidentToDelete);
      setShowDeleteModal(false);
      setIncidentToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Ongoing":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-red-600 border-t-transparent mb-4"></div>
        <p className="text-gray-500">Loading incident reports...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-4">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Error Loading Reports</h2>
        <p className="text-gray-500 mb-6 text-center">{error}</p>
        <Button onClick={refreshIncidents} className="bg-red-600 hover:bg-red-700 text-white">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Safeguarding Records</h1>
            <p className="text-gray-500">Monitor and manage street sweeping incident reports</p>
          </div>
          <div className="flex gap-2">
            <Link href="/dashboard">
              <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Processing Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-red-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Total Reports</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {incidents.length}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                <ShieldAlert className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Pending Reports</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {incidents.filter(r => r.status === "Pending").length}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-md">
                <Clock className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Ongoing Reports</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {incidents.filter(r => r.status === "Ongoing").length}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <AlertCircle className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Resolved Reports</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {incidents.filter(r => r.status === "Resolved").length}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                <CheckCircle className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search incidents..."
                  className="pl-8 w-full"
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
                    {[selectedPriority, selectedStatus].filter(Boolean).length}
                  </span>
                )}
              </Button>
              
              {/* Export Button */}
              <Button 
                variant="default" 
                className="bg-black hover:bg-gray-800 text-white flex gap-2 items-center"
                onClick={handleExportPDF}
                disabled={isExporting || filteredReports.length === 0}
              >
                {isExporting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>Exporting...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Export
                  </>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium mb-2">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Pending", "Ongoing", "Resolved"].map((status) => (
                      <Button
                        key={status}
                        variant={selectedStatus === status ? "default" : "outline"}
                        size="sm"
                        className={`${
                          status === "Pending" 
                            ? selectedStatus === status 
                              ? "bg-yellow-600 text-white hover:bg-yellow-700 ring-2 ring-offset-2 ring-yellow-500 shadow-md" 
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
                            : status === "Ongoing"
                            ? selectedStatus === status 
                              ? "bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-offset-2 ring-blue-500 shadow-md" 
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                            : selectedStatus === status 
                              ? "bg-green-600 text-white hover:bg-green-700 ring-2 ring-offset-2 ring-green-500 shadow-md" 
                              : "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                        }`}
                        onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                      >
                        {status}
                        {selectedStatus === status && (
                          <X className="ml-1 h-3 w-3" />
                        )}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Priority Level</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Low", "Medium", "High"].map((priority) => (
                      <Button
                        key={priority}
                        variant={selectedPriority === priority ? "default" : "outline"}
                        size="sm"
                        className={`${
                          priority === "Low" 
                            ? selectedPriority === priority 
                              ? "bg-green-600 text-white hover:bg-green-700 ring-2 ring-offset-2 ring-green-500 shadow-md" 
                              : "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                            : priority === "Medium"
                            ? selectedPriority === priority 
                              ? "bg-yellow-600 text-white hover:bg-yellow-700 ring-2 ring-offset-2 ring-yellow-500 shadow-md" 
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
                            : selectedPriority === priority 
                              ? "bg-red-600 text-white hover:bg-red-700 ring-2 ring-offset-2 ring-red-500 shadow-md" 
                              : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                        }`}
                        onClick={() => setSelectedPriority(selectedPriority === priority ? null : priority)}
                      >
                        {priority}
                        {selectedPriority === priority && (
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

      {/* Incident Reports Table */}
      <Card className="border-l-4 border-l-red-500 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-md">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Incident Reports</CardTitle>
              <CardDescription className="text-base text-gray-600">
                {filteredReports.length} reports • Street sweeping incident reports submitted from mobile app
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
                    ID
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Incident
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Location
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Priority
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
                {currentReports.length > 0 ? currentReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{report.id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{report.title}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-medium text-gray-900">{report.location}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{report.date}</div>
                      <div className="text-sm text-gray-500">{formatTimeTo12Hour(report.time)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getPriorityColor(report.priority || getPriorityFromIncidentType(report.title))}`}
                      >
                        {report.priority || getPriorityFromIncidentType(report.title)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusColor(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          asChild
                        >
                          <Link href={`/dashboard/safeguarding/${report.id}`}>
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            View Details
                          </Link>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                          onClick={() => handleDeleteIncident(report.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <ShieldAlert className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">No incident reports found</h3>
                          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-600 font-medium">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredReports.length)} of {filteredReports.length} incidents
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="h-8 px-3 border-gray-300 hover:bg-gray-50"
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
                        ? "bg-red-600 hover:bg-red-700 text-white" 
                        : "border-gray-300 hover:bg-gray-50"
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
                className="h-8 px-3 border-gray-300 hover:bg-gray-50"
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[425px] bg-white border-gray-200 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Incident Report
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete this incident report? This action cannot be undone and will permanently remove the report from the system.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}