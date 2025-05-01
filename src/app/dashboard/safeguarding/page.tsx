"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, Filter, Search, ShieldAlert, Clock, CheckCircle, AlertTriangle, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useState } from "react";

export default function SafeguardingRecordsPage() {
  const [selectedPriority, setSelectedPriority] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for demonstration
  const incidentReports = [
    { 
      id: "INC-2023-001", 
      title: "Illegal Waste Dumping", 
      location: "Riverside Park", 
      date: "2023-04-19", 
      time: "14:30", 
      reportedBy: "John Doe", 
      status: "Open", 
      priority: "High",
      description: "Large quantities of construction waste dumped near the river bank. Potential contamination risk.",
      resolution: {
        status: "Pending",
        assignedTo: "Sarah Johnson",
        lastUpdated: "2023-04-19T15:30:00",
        notes: "Initial assessment completed. Waiting for cleanup team deployment.",
        actions: [
          {
            date: "2023-04-19T14:45:00",
            action: "Report received and logged",
            by: "System"
          },
          {
            date: "2023-04-19T15:00:00",
            action: "Assigned to cleanup team",
            by: "Sarah Johnson"
          }
        ]
      }
    },
    { 
      id: "INC-2023-002", 
      title: "Air Pollution from Factory", 
      location: "Industrial Zone B", 
      date: "2023-04-18", 
      time: "10:15", 
      reportedBy: "Jane Smith", 
      status: "In Progress", 
      priority: "Medium",
      description: "Excessive smoke emissions observed from factory chimney. Residents complained about strong odor.",
      resolution: {
        status: "In Progress",
        assignedTo: "Michael Chen",
        lastUpdated: "2023-04-18T16:45:00",
        notes: "Factory inspection scheduled for tomorrow. Preliminary air quality tests show elevated levels.",
        actions: [
          {
            date: "2023-04-18T10:30:00",
            action: "Report received and logged",
            by: "System"
          },
          {
            date: "2023-04-18T11:00:00",
            action: "Air quality test conducted",
            by: "Michael Chen"
          },
          {
            date: "2023-04-18T16:45:00",
            action: "Factory inspection scheduled",
            by: "Michael Chen"
          }
        ]
      }
    },
    { 
      id: "INC-2023-003", 
      title: "Wildlife Poaching", 
      location: "Northern Forest Reserve", 
      date: "2023-04-17", 
      time: "07:45", 
      reportedBy: "Alex Johnson", 
      status: "Closed", 
      priority: "High",
      description: "Evidence of illegal hunting and trapping of protected species found during routine patrol.",
      resolution: {
        status: "Resolved",
        assignedTo: "David Wilson",
        lastUpdated: "2023-04-17T18:30:00",
        notes: "Suspects apprehended and evidence collected. Case handed over to wildlife protection unit.",
        actions: [
          {
            date: "2023-04-17T08:00:00",
            action: "Report received and logged",
            by: "System"
          },
          {
            date: "2023-04-17T09:15:00",
            action: "Investigation team dispatched",
            by: "David Wilson"
          },
          {
            date: "2023-04-17T14:30:00",
            action: "Suspects apprehended",
            by: "David Wilson"
          },
          {
            date: "2023-04-17T18:30:00",
            action: "Case resolved and closed",
            by: "David Wilson"
          }
        ]
      }
    },
    { 
      id: "INC-2023-004", 
      title: "Chemical Spill", 
      location: "Highway Junction 45", 
      date: "2023-04-15", 
      time: "16:20", 
      reportedBy: "Sam Williams", 
      status: "Open", 
      priority: "Critical",
      description: "Tanker truck accident resulting in chemical spill. Emergency response team dispatched."
    },
    { 
      id: "INC-2023-005", 
      title: "Illegal Fishing", 
      location: "East Bay Conservation Area", 
      date: "2023-04-14", 
      time: "09:30", 
      reportedBy: "Taylor Brown", 
      status: "In Progress", 
      priority: "Medium",
      description: "Multiple individuals observed using prohibited fishing methods in protected waters."
    },
  ];

  // Filter incidents based on selected criteria
  const filteredReports = incidentReports.filter(report => {
    const matchesPriority = !selectedPriority || report.priority === selectedPriority;
    const matchesStatus = !selectedStatus || report.status === selectedStatus;
    const matchesSearch = !searchQuery || 
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesPriority && matchesStatus && matchesSearch;
  });

  // Group incidents by priority for monitoring
  const priorityGroups = {
    Critical: filteredReports.filter(r => r.priority === "Critical"),
    High: filteredReports.filter(r => r.priority === "High"),
    Medium: filteredReports.filter(r => r.priority === "Medium"),
    Low: filteredReports.filter(r => r.priority === "Low")
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "High":
        return "bg-orange-100 text-orange-800 hover:bg-orange-200";
      case "Medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      case "Low":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "In Progress":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200";
      case "Closed":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200";
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Safeguarding Records</h1>
        <p className="text-gray-500">View and manage environmental incident reports</p>
      </div>

      {/* Priority Monitoring Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-red-200 hover:border-red-300 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Critical Priority</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{priorityGroups.Critical.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active incidents</p>
          </CardContent>
        </Card>
        <Card className="border-orange-200 hover:border-orange-300 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <AlertCircle className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{priorityGroups.High.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active incidents</p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 hover:border-yellow-300 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Medium Priority</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{priorityGroups.Medium.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active incidents</p>
          </CardContent>
        </Card>
        <Card className="border-green-200 hover:border-green-300 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Low Priority</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{priorityGroups.Low.length}</div>
            <p className="text-xs text-gray-500 mt-1">Active incidents</p>
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
                variant="outline" 
                size="icon" 
                className="h-10 w-10"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
              </Button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <h3 className="text-sm font-medium mb-2">Priority</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Critical", "High", "Medium", "Low"].map((priority) => (
                      <Button
                        key={priority}
                        variant={selectedPriority === priority ? "default" : "outline"}
                        size="sm"
                        className={`${getPriorityColor(priority)} ${selectedPriority === priority ? "ring-2 ring-offset-2" : ""}`}
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
                <div>
                  <h3 className="text-sm font-medium mb-2">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Open", "In Progress", "Closed"].map((status) => (
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
      <Card className="border-red-100">
        <CardHeader className="bg-red-50 rounded-t-lg border-b border-red-100">
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
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Assigned To</th>
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
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(report.priority)}`}
                      >
                        {report.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(report.status)}`}
                        >
                          {report.status}
                        </span>
                        {report.resolution && (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              report.resolution.status === "Pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : report.resolution.status === "In Progress"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {report.resolution.status}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">{report.resolution?.assignedTo || "Unassigned"}</td>
                    <td className="py-3 px-4">
                      {report.resolution ? (
                        <>
                          <div className="text-sm">{new Date(report.resolution.lastUpdated).toLocaleDateString()}</div>
                          <div className="text-xs text-gray-500">{new Date(report.resolution.lastUpdated).toLocaleTimeString()}</div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500">Not updated</div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-red-600 hover:text-red-800 hover:bg-red-50 p-0 px-2"
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
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">Showing {filteredReports.length} of {incidentReports.length} reports</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 