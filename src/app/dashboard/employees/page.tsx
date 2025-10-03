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
import { useState } from "react";
import { 
  Users, 
  MapPin, 
  Edit, 
  Search, 
  Filter,
  UserPlus,
  Calendar,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  User,
  X,
  UserCheck
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MOCK_WORKPLACE_LOCATIONS, WorkplaceLocation } from "@/types/location";
import { useLocation } from "@/contexts/LocationContext";
import { useReassignmentRequest } from "@/contexts/ReassignmentRequestContext";
import { useUser } from "@/contexts/UserContext";
import { useAssignment } from "@/contexts/AssignmentContext";
import Link from "next/link";

// Types for employee management
interface Employee {
  id: string;
  name: string;
  position: string;
  currentLocationId?: string;
}


export default function EmployeeManagementPage() {
  const { workplaceLocations } = useLocation();
  const { getPendingCount } = useReassignmentRequest();
  const { users } = useUser();
  const { getAssignmentByUserId, createAssignment, updateAssignment, deleteAssignment, loading: assignmentLoading } = useAssignment();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showReassignmentModal, setShowReassignmentModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Convert users to employees and filter out Admin accounts
  const employees: Employee[] = users
    .filter(user => user.role !== 'Admin') // Only show EPOL and Team Leader
    .map(user => {
      const assignment = getAssignmentByUserId(user.id);
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        position: user.role,
        currentLocationId: assignment?.workplace_location_id?.toString() || undefined
      };
    });



  const [newAssignment, setNewAssignment] = useState({
    locationId: ""
  });


  // Filter employees based on search, position, and location
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchQuery || 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPosition = !selectedPosition || employee.position === selectedPosition;
    const matchesLocation = !selectedLocation || 
      (employee.currentLocationId && workplaceLocations.find(loc => loc.id === employee.currentLocationId)?.name.includes(selectedLocation));
    return matchesSearch && matchesPosition && matchesLocation;
  });

  // Count active filters
  const activeFiltersCount = [searchQuery, selectedPosition, selectedLocation].filter(Boolean).length;

  // Pagination calculations
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = filteredEmployees.slice(startIndex, endIndex);

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

  // Reset to first page when search or filters change
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handlePositionChange = (position: string | null) => {
    setSelectedPosition(position);
    setCurrentPage(1);
  };

  const handleLocationChange = (location: string | null) => {
    setSelectedLocation(location);
    setCurrentPage(1);
  };




  // Helper function to get location name by ID
  const getLocationName = (locationId: string): string => {
    const location = workplaceLocations.find(loc => loc.id === locationId);
    return location ? location.name : 'Unknown Location';
  };

  // Helper function to get coordinates from assigned location
  const getLocationCoordinates = (employeeId: string): string => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee || !employee.currentLocationId) return 'No assignment';
    
    const location = workplaceLocations.find(loc => loc.id === employee.currentLocationId);
    if (!location) return 'Unknown location';
    
    return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
  };

  // Summary data
  const employeeSummary = {
    totalEmployees: employees.length,
    teamLeaders: employees.filter(emp => emp.position === 'Team Leader').length,
    epolEmployees: employees.filter(emp => emp.position === 'EPOL').length,
    totalLocations: workplaceLocations.length,
  };


  const handleAssignEmployee = async () => {
    if (selectedEmployee && newAssignment.locationId) {
      try {
        await createAssignment({
          user_id: selectedEmployee.id,
          workplace_location_id: newAssignment.locationId
        });
        
        setNewAssignment({ locationId: "" });
        setShowAssignmentModal(false);
        setSelectedEmployee(null);
      } catch (error) {
        console.error('Error assigning employee:', error);
        // You might want to show a toast notification here
      }
    }
  };

  const handleReassignEmployee = async () => {
    if (selectedEmployee && newAssignment.locationId) {
      try {
        const assignment = getAssignmentByUserId(selectedEmployee.id);
        if (assignment) {
          await updateAssignment(assignment.id, {
            workplace_location_id: newAssignment.locationId
          });
        }
        
        setNewAssignment({ locationId: "" });
        setShowReassignmentModal(false);
        setSelectedEmployee(null);
      } catch (error) {
        console.error('Error reassigning employee:', error);
        // You might want to show a toast notification here
      }
    }
  };

  const handleDeleteAssignment = async () => {
    if (selectedEmployee) {
      try {
        const assignment = getAssignmentByUserId(selectedEmployee.id);
        if (assignment) {
          await deleteAssignment(assignment.id);
        }
        
        setShowDeleteModal(false);
        setSelectedEmployee(null);
      } catch (error) {
        console.error('Error removing assignment:', error);
        // You might want to show a toast notification here
      }
    }
  };

  const handleReviewRequest = (action: 'approve' | 'reject') => {
    if (selectedEmployee) {
      // Here you would typically send the review action to your backend
      console.log(`Review ${action} for employee:`, selectedEmployee.name);
      
      // For now, just close the modal
      setShowReassignmentModal(false);
      setSelectedEmployee(null);
    }
  };




  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Employee Management</h1>
            <p className="text-gray-600">Manage EPOL personnel cleaning operation locations</p>
          </div>
          <Link href="/dashboard">
            <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Total Employees</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{employeeSummary.totalEmployees}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <Users className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Team Leaders</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{employeeSummary.teamLeaders}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                <User className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">EPOL</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{employeeSummary.epolEmployees}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                <User className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Total Locations</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{employeeSummary.totalLocations}</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-md">
                <MapPin className="h-7 w-7 text-yellow-600" />
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
                  placeholder="Search employees..."
                  className="pl-10 w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
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
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
              <div className="flex gap-3">
                <Link href="/dashboard/employees/locations">
                  <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700 shadow-md">
                    <MapPin className="h-4 w-4" />
                    <span>Workplace Locations</span>
                  </Button>
                </Link>
                <Link href="/dashboard/employees/review-requests">
                  <Button className="gap-2 bg-orange-600 text-white hover:bg-orange-700 shadow-md">
                    <UserCheck className="h-4 w-4" />
                    <span>Reassignment/Redeployment Requests</span>
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                      {getPendingCount()}
                    </span>
                  </Button>
                </Link>
              </div>
            </div>

            {showFilters && (
              <div className="space-y-6 pt-4 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Position</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Team Leader", "EPOL"].map((position) => (
                      <Button
                        key={position}
                        variant={selectedPosition === position ? "default" : "outline"}
                        size="sm"
                        className={`${
                          position === "Team Leader" 
                            ? selectedPosition === position 
                              ? "bg-red-600 text-white hover:bg-red-700 ring-2 ring-offset-2 ring-red-500 shadow-md" 
                              : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                            : selectedPosition === position 
                              ? "bg-green-600 text-white hover:bg-green-700 ring-2 ring-offset-2 ring-green-500 shadow-md" 
                              : "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                        }`}
                        onClick={() => handlePositionChange(selectedPosition === position ? null : position)}
                      >
                        {position}
                        {selectedPosition === position && <X className="ml-1 h-3 w-3" />}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Location</h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Baclaran (Proper)",
                      "Baclaran (Mabuhay)",
                      "Banay Banay (Proper)",
                      "Banay Banay (NIA)",
                      "Banlic",
                      "Bigaa",
                      "Butong",
                      "Casile",
                      "Diezmo",
                      "Gulod",
                      "Mamatid (Mabuhay)",
                      "Mamatid (Proper)",
                      "Marinig (Proper)",
                      "Marinig - SV",
                      "Niugan (Proper)",
                      "Niugan - SV",
                      "Pittland",
                      "POB 1",
                      "POB 2",
                      "POB 3",
                      "Pulo",
                      "Sala",
                      "San Isidro"
                    ].map((location) => (
                      <Button
                        key={location}
                        variant={selectedLocation === location ? "default" : "outline"}
                        size="sm"
                        className={`whitespace-nowrap ${
                          selectedLocation === location 
                            ? "bg-blue-600 text-white hover:bg-blue-700 ring-2 ring-offset-2 ring-blue-500 shadow-md" 
                            : "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200"
                        }`}
                        onClick={() => handleLocationChange(selectedLocation === location ? null : location)}
                      >
                        {location}
                        {selectedLocation === location && <X className="ml-1 h-3 w-3" />}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </CardContent>
      </Card>

      {/* Employees Table */}
      <Card className="border-l-4 border-l-red-500 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">EPOL Employees</CardTitle>
              <CardDescription className="text-base text-gray-600">
                {employeeSummary.totalEmployees} employees • Manage employee assignments and deployments
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
                    Position
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Current Assignment/Deployment
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Coordinates
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEmployees.length > 0 ? paginatedEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <div className="font-semibold text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">ID: {employee.id}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                        employee.position === "Team Leader" 
                          ? "bg-red-100 text-red-800 border border-red-200" 
                          : "bg-green-100 text-green-800 border border-green-200"
                      }`}>
                        {employee.position}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {employee.currentLocationId ? (
                        <div className="text-sm font-medium text-gray-900">
                          {(() => {
                            const location = workplaceLocations.find(loc => loc.id === employee.currentLocationId);
                            console.log('Looking for location ID:', employee.currentLocationId, 'Available locations:', workplaceLocations.map(l => ({ id: l.id, name: l.name })), 'Found:', location);
                            return location?.name || "Unknown Location";
                          })()}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No assignment</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {(() => {
                        // If no assignment, no coordinates
                        if (!employee.currentLocationId) {
                          return <span className="text-gray-500 text-sm">No assignment</span>;

                        }
                        
                        // If has assignment, show coordinates from workplace location
                        const coordinates = getLocationCoordinates(employee.id);
                        return coordinates === 'No assignment' || coordinates === 'Unknown location' ? (
                          <span className="text-gray-500 text-sm">{coordinates}</span>
                        ) : (
                          <div className="text-xs text-gray-600 font-mono">
                            {coordinates}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        {!employee.currentLocationId ? (
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white shadow-sm"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowAssignmentModal(true);
                            }}
                          >
                            <MapPin className="h-3.5 w-3.5 mr-1" />
                            Assign
                          </Button>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              variant="default"
                              size="sm"
                              className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setShowReassignmentModal(true);
                              }}
                            >
                              <Edit className="h-3.5 w-3.5 mr-1" />
                              Reassign
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="h-8 px-3 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                              onClick={() => {
                                setSelectedEmployee(employee);
                                setShowDeleteModal(true);
                              }}
                            >
                              <X className="h-3.5 w-3.5 mr-1" />
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">No employees found</h3>
                          <p className="text-gray-500">Try adjusting your search criteria or filters</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="text-sm text-gray-600 font-medium">
              {filteredEmployees.length > 0 
                ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredEmployees.length)} of ${filteredEmployees.length} records`
                : `Showing 0 of 0 records`
              }
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || filteredEmployees.length === 0}
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
                    disabled={totalPages === 1 || filteredEmployees.length === 0}
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
                disabled={currentPage === totalPages || filteredEmployees.length === 0}
                className="h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      <Dialog open={showAssignmentModal} onOpenChange={setShowAssignmentModal}>
        <DialogContent className="sm:max-w-[500px] bg-white border-gray-200 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-600" />
              Assign Employee
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Assign {selectedEmployee?.name} to a new location.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location *</Label>
              <Select value={newAssignment.locationId} onValueChange={(value) => setNewAssignment({ ...newAssignment, locationId: value })}>
                <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {workplaceLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowAssignmentModal(false)} className="border-gray-300 hover:bg-gray-50">
              Cancel
            </Button>
            <Button 
              onClick={handleAssignEmployee} 
              disabled={!newAssignment.locationId}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              Assign Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassignment Modal */}
      <Dialog open={showReassignmentModal} onOpenChange={setShowReassignmentModal}>
        <DialogContent className="sm:max-w-[500px] bg-white border-gray-200 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Reassign Employee
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Reassign {selectedEmployee?.name} to a new location.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700">New Location *</Label>
              <Select value={newAssignment.locationId} onValueChange={(value) => setNewAssignment({ ...newAssignment, locationId: value })}>
                <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {workplaceLocations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowReassignmentModal(false)} className="border-gray-300 hover:bg-gray-50">
              Cancel
            </Button>
            <Button 
              onClick={handleReassignEmployee} 
              disabled={!newAssignment.locationId}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Reassign Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Assignment Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[500px] bg-white border-gray-200 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <X className="h-5 w-5 text-red-600" />
              Remove Location Assignment
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to remove the location assignment for {selectedEmployee?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Warning
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>This will remove the employee's current location assignment. They will appear as "No assignment" in the system.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-gray-200">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)} 
              className="border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteAssignment}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Remove Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}

