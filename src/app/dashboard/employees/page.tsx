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
  UserCheck,
  Clock,
  Save,
  Check,
  AlertCircle,
  AlertTriangle
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
import { workHoursApi } from "@/services/workHoursApi";

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
  const [showWorkHoursModal, setShowWorkHoursModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  
  // Work hours settings
  const [workHours, setWorkHours] = useState({
    clockInStart: "",
    clockInEnd: "",
    workStart: "",
    workEnd: "",
    clockOutTime: "",
    extendedClockOutTime: ""
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load work hours from API on mount
  useEffect(() => {
    const loadWorkHours = async () => {
      try {
        const response = await workHoursApi.getWorkHours();
        if (response.success && response.data) {
          // Convert time format from "HH:MM:SS" to "HH:MM"
          setWorkHours({
            clockInStart: response.data.clock_in_start ? response.data.clock_in_start.substring(0, 5) : '',
            clockInEnd: response.data.clock_in_end ? response.data.clock_in_end.substring(0, 5) : '',
            workStart: response.data.work_start ? response.data.work_start.substring(0, 5) : '',
            workEnd: response.data.work_end ? response.data.work_end.substring(0, 5) : '',
            clockOutTime: response.data.clock_out_time ? response.data.clock_out_time.substring(0, 5) : '',
            extendedClockOutTime: response.data.extended_clock_out_time ? response.data.extended_clock_out_time.substring(0, 5) : '',
          });
        }
      } catch (error) {
        console.error('Error loading work hours:', error);
        // Keep empty values if API fails
      }
    };
    
    loadWorkHours();
  }, []);

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
                <Button 
                  onClick={() => setShowWorkHoursModal(true)}
                  className="gap-2 bg-green-600 text-white hover:bg-green-700 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Clock className="h-4 w-4" />
                  <span>Work Hours Settings</span>
                </Button>
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
        <DialogContent className="sm:max-w-[600px] bg-white border-gray-200 shadow-xl [&>button]:hidden">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">Assign Employee</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Assign {selectedEmployee?.name} to a workplace location
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Employee Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold text-blue-900">{selectedEmployee?.name}</p>
                  <p className="text-xs text-blue-700">{selectedEmployee?.position}</p>
                </div>
                {selectedEmployee?.currentLocationId ? (
                  <div className="text-right">
                    <p className="text-xs text-blue-600 font-medium">Currently At</p>
                    <p className="text-sm font-semibold text-blue-900">
                      {workplaceLocations.find(loc => loc.id === selectedEmployee.currentLocationId)?.name || 'Unassigned'}
                    </p>
                  </div>
                ) : (
                  <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                    Not Assigned
                  </Badge>
                )}
              </div>
            </div>

            {/* Location Selection */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin className="h-4 w-4 text-green-600" />
                Select Workplace Location <span className="text-red-500">*</span>
              </Label>
              <Select value={newAssignment.locationId} onValueChange={(value) => setNewAssignment({ ...newAssignment, locationId: value })}>
                <SelectTrigger className="border-gray-300 focus:border-green-500 focus:ring-green-500 h-12">
                  <SelectValue placeholder="Choose a location..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {workplaceLocations.map((location) => {
                    const employeesAtLocation = employees.filter(emp => emp.currentLocationId === location.id).length;
                    return (
                      <SelectItem key={location.id} value={location.id} className="py-3">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <span className="font-medium">{location.name}</span>
                          </div>
                          <Badge variant="outline" className="ml-2 text-xs">
                            {employeesAtLocation} {employeesAtLocation === 1 ? 'employee' : 'employees'}
                          </Badge>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Select the workplace location where this employee will be deployed
              </p>
            </div>

            {/* Selected Location Preview */}
            {newAssignment.locationId && (
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg p-4 animate-in slide-in-from-top">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-green-900 mb-2 flex items-center gap-2">
                      <span>Selected Location</span>
                    </p>
                    {(() => {
                      const selectedLoc = workplaceLocations.find(loc => loc.id === newAssignment.locationId);
                      return selectedLoc ? (
                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-green-900 text-base">{selectedLoc.name}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-white/60 rounded p-2 border border-green-200">
                              <p className="text-green-600 font-medium">Coordinates</p>
                              <p className="text-green-900 font-mono text-xs">
                                {selectedLoc.latitude.toFixed(4)}, {selectedLoc.longitude.toFixed(4)}
                              </p>
                            </div>
                            <div className="bg-white/60 rounded p-2 border border-green-200">
                              <p className="text-green-600 font-medium">Geofence</p>
                              <p className="text-green-900 font-semibold">{selectedLoc.radius}m radius</p>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-gray-200 pt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="text-red-500">*</span> Required field
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAssignmentModal(false);
                  setNewAssignment({ locationId: "" });
                }} 
                className="bg-red-600 hover:bg-red-700 text-white px-6 shadow-md"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleAssignEmployee} 
                disabled={!newAssignment.locationId}
                className="bg-green-600 hover:bg-green-700 text-white px-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm Assignment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reassignment Modal */}
      <Dialog open={showReassignmentModal} onOpenChange={setShowReassignmentModal}>
        <DialogContent className="sm:max-w-[650px] bg-white border-gray-200 shadow-xl [&>button]:hidden">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">Reassign Employee</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Move {selectedEmployee?.name} to a different workplace location
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Employee Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold text-blue-900">{selectedEmployee?.name}</p>
                  <p className="text-xs text-blue-700">{selectedEmployee?.position}</p>
                </div>
              </div>
            </div>

            {/* New Location Selection */}
            <div className="space-y-2">
              <Label htmlFor="new-location" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                <MapPin className="h-4 w-4 text-blue-600" />
                Select New Workplace Location <span className="text-red-500">*</span>
              </Label>
              <Select value={newAssignment.locationId} onValueChange={(value) => setNewAssignment({ ...newAssignment, locationId: value })}>
                <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12">
                  <SelectValue placeholder="Choose a new location..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200">
                  {workplaceLocations
                    .filter(loc => loc.id !== selectedEmployee?.currentLocationId)
                    .map((location) => {
                      const employeesAtLocation = employees.filter(emp => emp.currentLocationId === location.id).length;
                      return (
                        <SelectItem key={location.id} value={location.id} className="py-3">
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4 text-blue-600" />
                              <span className="font-medium">{location.name}</span>
                            </div>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {employeesAtLocation} {employeesAtLocation === 1 ? 'employee' : 'employees'}
                            </Badge>
                          </div>
                        </SelectItem>
                      );
                    })}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                Current location is excluded from the list
              </p>
            </div>

            {/* Visual FROM → TO Indicator */}
            {selectedEmployee?.currentLocationId && newAssignment.locationId && (
              <div className="flex items-center gap-3 px-4">
                <div className="flex-1 bg-gray-100 rounded-lg p-3 border border-gray-300">
                  <p className="text-xs text-gray-500 font-medium mb-1">FROM</p>
                  <p className="font-semibold text-gray-900">
                    {workplaceLocations.find(loc => loc.id === selectedEmployee.currentLocationId)?.name}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <ArrowLeft className="h-5 w-5 text-blue-600 transform rotate-180" />
                </div>
                <div className="flex-1 bg-blue-100 rounded-lg p-3 border-2 border-blue-300">
                  <p className="text-xs text-blue-600 font-medium mb-1">TO</p>
                  <p className="font-semibold text-blue-900">
                    {workplaceLocations.find(loc => loc.id === newAssignment.locationId)?.name}
                  </p>
                </div>
              </div>
            )}

            {/* Selected Location Preview */}
            {newAssignment.locationId && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-4 animate-in slide-in-from-top">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      <span>New Location Details</span>
                    </p>
                    {(() => {
                      const selectedLoc = workplaceLocations.find(loc => loc.id === newAssignment.locationId);
                      return selectedLoc ? (
                        <div className="space-y-1 text-xs">
                          <p className="font-bold text-blue-900 text-base">{selectedLoc.name}</p>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                            <div className="bg-white/60 rounded p-2 border border-blue-200">
                              <p className="text-blue-600 font-medium">Coordinates</p>
                              <p className="text-blue-900 font-mono text-xs">
                                {selectedLoc.latitude.toFixed(4)}, {selectedLoc.longitude.toFixed(4)}
                              </p>
                            </div>
                            <div className="bg-white/60 rounded p-2 border border-blue-200">
                              <p className="text-blue-600 font-medium">Geofence</p>
                              <p className="text-blue-900 font-semibold">{selectedLoc.radius}m radius</p>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="border-t border-gray-200 pt-4 flex items-center justify-between">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="text-red-500">*</span> Required field
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowReassignmentModal(false);
                  setNewAssignment({ locationId: "" });
                }} 
                className="bg-red-600 hover:bg-red-700 text-white px-6 shadow-md"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleReassignEmployee} 
                disabled={!newAssignment.locationId}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm Reassignment
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Assignment Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="sm:max-w-[600px] bg-white border-gray-200 shadow-xl [&>button]:hidden">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold text-gray-900">
                  Remove Assignment?
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-sm mt-1">
                  This will unassign the employee from their current location
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Employee Info Card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-bold text-blue-900">{selectedEmployee?.name}</p>
                  <p className="text-xs text-blue-700">{selectedEmployee?.position}</p>
                </div>
              </div>
            </div>

            {/* Visual REMOVE Indicator */}
            {selectedEmployee?.currentLocationId && (
              <div className="flex items-center gap-3 px-4">
                <div className="flex-1 bg-red-100 rounded-lg p-4 border-2 border-red-300">
                  <p className="text-xs text-red-600 font-medium mb-2">REMOVING FROM</p>
                  <div className="space-y-1">
                    <p className="font-semibold text-red-900 text-lg">
                      {workplaceLocations.find(loc => loc.id === selectedEmployee.currentLocationId)?.name}
                    </p>
                    {(() => {
                      const location = workplaceLocations.find(loc => loc.id === selectedEmployee.currentLocationId);
                      return location ? (
                        <div className="flex gap-2 text-xs text-red-700">
                          <span>{location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}</span>
                          <span>•</span>
                          <span>{location.radius}m radius</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-red-500 flex items-center justify-center shadow-md">
                    <ArrowLeft className="h-6 w-6 text-white transform rotate-180" />
                  </div>
                </div>
                <div className="flex-1 bg-gray-100 rounded-lg p-4 border-2 border-gray-300 border-dashed">
                  <p className="text-xs text-gray-500 font-medium mb-2">WILL BECOME</p>
                  <p className="font-semibold text-gray-600 text-lg">No Assignment</p>
                  <p className="text-xs text-gray-500 mt-1">Employee will not be assigned to any location</p>
                </div>
              </div>
            )}

            {/* Warning Box */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-yellow-800 mb-1">Important Notice</p>
                  <p className="text-sm text-yellow-700">
                    After removal, this employee will appear as "No assignment" in the system. They will not be able to clock in/out until assigned to a new location. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-gray-200 flex items-center justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteModal(false)} 
              className="bg-gray-900 hover:bg-gray-800 text-white border-gray-900 px-6"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteAssignment}
              className="bg-red-600 hover:bg-red-700 text-white px-6 shadow-lg"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Yes, Remove Assignment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Work Hours Settings Modal */}
      <Dialog open={showWorkHoursModal} onOpenChange={setShowWorkHoursModal}>
        <DialogContent className="sm:max-w-[550px] bg-white border-2 border-green-200 shadow-xl">
          <DialogHeader className="pb-3 border-b border-green-100">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
                <Clock className="h-4 w-4 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-gray-900">
                  Work Hours Settings
                </DialogTitle>
                <DialogDescription className="text-gray-500 text-xs">
                  Set working hours and clock-in/out windows
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="grid gap-3 py-3">
            {/* Clock-In Times */}
            <div className="bg-green-50 rounded-md p-2.5 border border-green-200">
              <h3 className="text-xs font-bold text-green-800 mb-1.5 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Clock-In Window
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-0.5">
                  <Label htmlFor="clockInStart" className="text-xs font-semibold text-gray-700">
                    Start <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clockInStart"
                    type="time"
                    value={workHours.clockInStart}
                    onChange={(e) => setWorkHours({ ...workHours, clockInStart: e.target.value })}
                    className="border border-green-300 focus:border-green-500 focus:ring-green-500 h-8"
                  />
                  <p className="text-[9px] text-gray-500">Earliest time</p>
                </div>
                
                <div className="space-y-0.5">
                  <Label htmlFor="clockInEnd" className="text-xs font-semibold text-gray-700">
                    End <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clockInEnd"
                    type="time"
                    value={workHours.clockInEnd}
                    onChange={(e) => setWorkHours({ ...workHours, clockInEnd: e.target.value })}
                    className="border border-green-300 focus:border-green-500 focus:ring-green-500 h-8"
                  />
                  <p className="text-[9px] text-gray-500">Latest time</p>
                </div>
              </div>
            </div>

            {/* Work Hours */}
            <div className="bg-green-50 rounded-md p-2.5 border border-green-200">
              <h3 className="text-xs font-bold text-green-800 mb-1.5 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Official Work Hours
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-0.5">
                  <Label htmlFor="workStart" className="text-xs font-semibold text-gray-700">
                    Start <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="workStart"
                    type="time"
                    value={workHours.workStart}
                    onChange={(e) => setWorkHours({ ...workHours, workStart: e.target.value })}
                    className="border border-green-300 focus:border-green-500 focus:ring-green-500 h-8"
                  />
                  <p className="text-[9px] text-gray-500">For late marking</p>
                </div>
                
                <div className="space-y-0.5">
                  <Label htmlFor="workEnd" className="text-xs font-semibold text-gray-700">
                    End <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="workEnd"
                    type="time"
                    value={workHours.workEnd}
                    onChange={(e) => setWorkHours({ ...workHours, workEnd: e.target.value })}
                    className="border border-green-300 focus:border-green-500 focus:ring-green-500 h-8"
                  />
                  <p className="text-[9px] text-gray-500">Official end</p>
                </div>
              </div>
            </div>

            {/* Clock-Out Times */}
            <div className="bg-green-50 rounded-md p-2.5 border border-green-200">
              <h3 className="text-xs font-bold text-green-800 mb-1.5 flex items-center gap-1">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Clock-Out Window
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="space-y-0.5">
                  <Label htmlFor="clockOutTime" className="text-xs font-semibold text-gray-700">
                    Start <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="clockOutTime"
                    type="time"
                    value={workHours.clockOutTime}
                    onChange={(e) => setWorkHours({ ...workHours, clockOutTime: e.target.value })}
                    className="border border-green-300 focus:border-green-500 focus:ring-green-500 h-8"
                  />
                  <p className="text-[9px] text-gray-500">Earliest time</p>
                </div>
                
                <div className="space-y-0.5">
                  <Label htmlFor="extendedClockOutTime" className="text-xs font-semibold text-gray-700">
                    End <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="extendedClockOutTime"
                    type="time"
                    value={workHours.extendedClockOutTime}
                    onChange={(e) => setWorkHours({ ...workHours, extendedClockOutTime: e.target.value })}
                    className="border border-green-300 focus:border-green-500 focus:ring-green-500 h-8"
                  />
                  <p className="text-[9px] text-gray-500">Latest time</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter className="pt-2 border-t border-green-100 flex justify-between items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowWorkHoursModal(false)} 
              className="border border-red-400 text-red-600 hover:bg-red-50 font-semibold px-3 h-8 text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Cancel
            </Button>
            <Button 
              onClick={async () => {
                // Validate all fields are filled
                if (!workHours.clockInStart || !workHours.clockInEnd || !workHours.workStart || 
                    !workHours.workEnd || !workHours.clockOutTime || !workHours.extendedClockOutTime) {
                  setModalMessage('Please fill in all time fields before saving!');
                  setShowErrorModal(true);
                  return;
                }
                
                try {
                  // Save to API
                  const response = await workHoursApi.updateWorkHours({
                    clock_in_start: workHours.clockInStart,
                    clock_in_end: workHours.clockInEnd,
                    work_start: workHours.workStart,
                    work_end: workHours.workEnd,
                    clock_out_time: workHours.clockOutTime,
                    extended_clock_out_time: workHours.extendedClockOutTime,
                  });
                  
                  if (response.success) {
                    console.log('Work hours saved:', response.data);
                    setShowWorkHoursModal(false);
                    setModalMessage('Work hours settings saved successfully!');
                    setShowSuccessModal(true);
                  } else {
                    throw new Error(response.message || 'Failed to save');
                  }
                } catch (error: any) {
                  console.error('Error saving work hours:', error);
                  setModalMessage('Failed to save work hours settings. Please try again.\n\nError: ' + (error?.message || 'Unknown error'));
                  setShowErrorModal(true);
                }
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 h-8 text-xs shadow-md"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-center w-full">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold text-gray-900">
              Success
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 px-2">
            <p className="text-center text-gray-700 text-base">{modalMessage}</p>
          </div>
          <DialogFooter className="flex justify-center sm:justify-center">
            <Button 
              onClick={() => setShowSuccessModal(false)}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 font-semibold"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader className="space-y-3">
            <div className="flex items-center justify-center w-full">
              <div className="rounded-full bg-red-100 p-3">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <DialogTitle className="text-center text-xl font-bold text-gray-900">
              Error
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 px-2">
            <p className="text-center text-gray-700 text-base whitespace-pre-line">{modalMessage}</p>
          </div>
          <DialogFooter className="flex justify-center sm:justify-center">
            <Button 
              onClick={() => setShowErrorModal(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 font-semibold"
            >
              OK
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}