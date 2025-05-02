"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, Filter, Search, ShieldAlert, Clock, CheckCircle, AlertTriangle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";
import { useIncidentContext } from "./IncidentContext";

export default function SafeguardingRecordsPage() {
  const { incidents } = useIncidentContext();
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Safeguarding Records</h1>
        <p className="text-gray-500">Monitor and manage environmental incident reports</p>
      </div>

      {/* Processing Status Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Processing Status Overview</CardTitle>
          <CardDescription>Current status of all incident reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Pending Reports</span>
                <span className="text-2xl font-bold text-yellow-600">
                  {incidents.filter(r => r.status === "Pending").length}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Awaiting initial assessment
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">In Progress</span>
                <span className="text-2xl font-bold text-blue-600">
                  {incidents.filter(r => r.status === "In Progress").length}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Currently being processed
              </div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Resolved</span>
                <span className="text-2xl font-bold text-green-600">
                  {incidents.filter(r => r.status === "Resolved").length}
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Successfully resolved cases
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
                className={`h-10 w-10 relative transition-all duration-200 ${
                  showFilters 
                    ? "bg-red-600 text-white hover:bg-red-700 shadow-md" 
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className={`h-4 w-4 ${showFilters ? "text-white" : "text-gray-500"}`} />
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-red-600 text-xs font-semibold flex items-center justify-center shadow-sm">
                    {[selectedPriority, selectedStatus].filter(Boolean).length}
                  </span>
                )}
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium mb-2">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Pending", "In Progress", "Resolved"].map((status) => (
                      <Button
                        key={status}
                        variant={selectedStatus === status ? "default" : "outline"}
                        size="sm"
                        className={`${getStatusColor(status)} ${selectedStatus === status ? "ring-2 ring-offset-2" : ""}`}
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
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Incident Reports Table */}
      <Card className="border-gray-200">
        <CardHeader className="bg-red-50 rounded-t-lg border-b border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Incident Reports</CardTitle>
              <CardDescription>Environmental safeguarding reports submitted from mobile app</CardDescription>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Incident</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Reported By</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Last Updated</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-medium">{report.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{report.title}</div>
                      <div className="text-xs text-gray-500 mt-1 max-w-60 truncate" title={report.description}>{report.description}</div>
                    </td>
                    <td className="py-3 px-4">{report.location}</td>
                    <td className="py-3 px-4">
                      <div>{report.date}</div>
                      <div className="text-xs text-gray-500">{report.time}</div>
                    </td>
                    <td className="py-3 px-4">{report.reportedBy}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(report.status)}`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {report.lastUpdated ? (
                        <>
                          <div className="text-sm">{new Date(report.lastUpdated).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(report.lastUpdated).toLocaleTimeString()}</div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">Not updated</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="default"
                        size="sm"
                        className="h-8 px-3 font-semibold bg-blue-600 hover:bg-blue-700 text-white"
                        asChild
                      >
                        <Link href={`/dashboard/safeguarding/${report.id}`}>View Details</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}