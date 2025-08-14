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
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  UserPlus,
  MapPinOff,
  Building2,
  Calendar
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// Types for employee management
interface Employee {
  id: string;
  name: string;
  position: string;
  contactNumber: string;
  email: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  currentAssignment?: Assignment;
}

interface Assignment {
  id: string;
  employeeId: string;
  location: string;
  position: string;
  startDate: string;
  endDate?: string;
  status: 'Active' | 'Completed' | 'Reassigned';
  notes?: string;
}

interface Location {
  id: string;
  name: string;
  address: string;
  type: 'Barangay' | 'District' | 'City Hall' | 'Field Office';
  capacity: number;
  currentStaff: number;
}

export default function EmployeeManagementPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showReassignmentModal, setShowReassignmentModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Mock data for employees
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "EMP-001",
      name: "John Smith",
      position: "Environmental Officer",
      contactNumber: "+63 912 345 6789",
      email: "john.smith@epol.gov.ph",
      status: "Active",
      currentAssignment: {
        id: "ASS-001",
        employeeId: "EMP-001",
        location: "Barangay Pulo",
        position: "Environmental Officer",
        startDate: "2024-01-15",
        status: "Active",
        notes: "Primary environmental monitoring and enforcement"
      }
    },
    {
      id: "EMP-002",
      name: "Maria Santos",
      position: "Senior Environmental Officer",
      contactNumber: "+63 923 456 7890",
      email: "maria.santos@epol.gov.ph",
      status: "Active",
      currentAssignment: {
        id: "ASS-002",
        employeeId: "EMP-002",
        location: "Barangay Mamatid",
        position: "Senior Environmental Officer",
        startDate: "2024-02-01",
        status: "Active",
        notes: "Lead officer for waste management initiatives"
      }
    },
    {
      id: "EMP-003",
      name: "Carlos Rodriguez",
      position: "Environmental Inspector",
      contactNumber: "+63 934 567 8901",
      email: "carlos.rodriguez@epol.gov.ph",
      status: "On Leave",
      currentAssignment: {
        id: "ASS-003",
        employeeId: "EMP-003",
        location: "Barangay Banay-banay",
        position: "Environmental Inspector",
        startDate: "2024-01-20",
        endDate: "2024-03-15",
        status: "Completed",
        notes: "Temporary assignment completed"
      }
    }
  ]);

  // Mock data for locations
  const [locations] = useState<Location[]>([
    {
      id: "LOC-001",
      name: "Barangay Pulo",
      address: "Pulo, Cabuyao, Laguna",
      type: "Barangay",
      capacity: 5,
      currentStaff: 2
    },
    {
      id: "LOC-002",
      name: "Barangay Mamatid",
      address: "Mamatid, Cabuyao, Laguna",
      type: "Barangay",
      capacity: 3,
      currentStaff: 1
    },
    {
      id: "LOC-003",
      name: "Barangay Banay-banay",
      address: "Banay-banay, Cabuyao, Laguna",
      type: "Barangay",
      capacity: 4,
      currentStaff: 0
    },
    {
      id: "LOC-004",
      name: "EPOL Main Office",
      address: "City Hall Complex, Cabuyao, Laguna",
      type: "City Hall",
      capacity: 10,
      currentStaff: 5
    }
  ]);

  // Form states
  const [newEmployee, setNewEmployee] = useState({
    name: "",
    position: "",
    contactNumber: "",
    email: ""
  });

  const [newAssignment, setNewAssignment] = useState({
    locationId: "",
    position: "",
    startDate: "",
    endDate: "",
    notes: ""
  });

  // Filter employees based on search and status
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = !searchQuery || 
      employee.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = !selectedStatus || employee.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  // Summary data
  const employeeSummary = {
    totalEmployees: employees.length,
    activeEmployees: employees.filter(emp => emp.status === 'Active').length,
    onLeaveEmployees: employees.filter(emp => emp.status === 'On Leave').length,
    assignedEmployees: employees.filter(emp => emp.currentAssignment?.status === 'Active').length,
  };

  const handleAddEmployee = () => {
    if (newEmployee.name && newEmployee.position && newEmployee.contactNumber && newEmployee.email) {
      const employee: Employee = {
        id: `EMP-${employees.length + 1}`,
        name: newEmployee.name,
        position: newEmployee.position,
        contactNumber: newEmployee.contactNumber,
        email: newEmployee.email,
        status: 'Active'
      };
      setEmployees([...employees, employee]);
      setNewEmployee({ name: "", position: "", contactNumber: "", email: "" });
      setShowAddEmployeeModal(false);
    }
  };

  const handleAssignEmployee = () => {
    if (selectedEmployee && newAssignment.locationId && newAssignment.position && newAssignment.startDate) {
      const location = locations.find(loc => loc.id === newAssignment.locationId);
      if (location) {
        const assignment: Assignment = {
          id: `ASS-${Date.now()}`,
          employeeId: selectedEmployee.id,
          location: location.name,
          position: newAssignment.position,
          startDate: newAssignment.startDate,
          endDate: newAssignment.endDate || undefined,
          status: 'Active',
          notes: newAssignment.notes
        };

        // Update employee with new assignment
        setEmployees(employees.map(emp => 
          emp.id === selectedEmployee.id 
            ? { ...emp, currentAssignment: assignment }
            : emp
        ));

        setNewAssignment({ locationId: "", position: "", startDate: "", endDate: "", notes: "" });
        setShowAssignmentModal(false);
        setSelectedEmployee(null);
      }
    }
  };

  const handleReassignEmployee = () => {
    if (selectedEmployee && newAssignment.locationId && newAssignment.position && newAssignment.startDate) {
      const location = locations.find(loc => loc.id === newAssignment.locationId);
      if (location) {
        // Mark current assignment as completed
        const updatedEmployees = employees.map(emp => {
          if (emp.id === selectedEmployee.id && emp.currentAssignment) {
            return {
              ...emp,
              currentAssignment: {
                ...emp.currentAssignment,
                endDate: new Date().toISOString().split('T')[0],
                status: 'Reassigned' as const
              }
            };
          }
          return emp;
        });

        // Add new assignment
        const assignment: Assignment = {
          id: `ASS-${Date.now()}`,
          employeeId: selectedEmployee.id,
          location: location.name,
          position: newAssignment.position,
          startDate: newAssignment.startDate,
          endDate: newAssignment.endDate || undefined,
          status: 'Active',
          notes: newAssignment.notes
        };

        setEmployees(updatedEmployees.map(emp => 
          emp.id === selectedEmployee.id 
            ? { ...emp, currentAssignment: assignment }
            : emp
        ));

        setNewAssignment({ locationId: "", position: "", startDate: "", endDate: "", notes: "" });
        setShowReassignmentModal(false);
        setSelectedEmployee(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800 border-green-200";
      case "Inactive":
        return "bg-red-100 text-red-800 border-red-200";
      case "On Leave":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Employee Management</h1>
        <p className="text-gray-600">Manage EPOL personnel assignments and deployments</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="border-blue-200 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employeeSummary.totalEmployees}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Active Employees</p>
                <p className="text-2xl font-bold text-gray-900">{employeeSummary.activeEmployees}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
                <UserPlus className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">On Leave</p>
                <p className="text-2xl font-bold text-gray-900">{employeeSummary.onLeaveEmployees}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-yellow-100 flex items-center justify-center shadow-sm">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-white shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Assigned</p>
                <p className="text-2xl font-bold text-gray-900">{employeeSummary.assignedEmployees}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center shadow-sm">
                <MapPin className="h-6 w-6 text-purple-600" />
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
              <div className="flex gap-3">
                <Dialog open={showAddEmployeeModal} onOpenChange={setShowAddEmployeeModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400">
                      <Plus className="h-4 w-4" />
                      <span>Add Employee</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] bg-white border-gray-200 shadow-xl">
                    <DialogHeader className="pb-4">
                      <DialogTitle className="text-xl font-semibold text-gray-900">Add New Employee</DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Add a new EPOL employee to the system.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name *</Label>
                          <Input
                            id="name"
                            value={newEmployee.name}
                            onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                            placeholder="Enter full name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="position" className="text-sm font-medium text-gray-700">Position *</Label>
                          <Select value={newEmployee.position} onValueChange={(value) => setNewEmployee({ ...newEmployee, position: value })}>
                            <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                              <SelectValue placeholder="Select position" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-200">
                              <SelectItem value="Environmental Officer">Environmental Officer</SelectItem>
                              <SelectItem value="Senior Environmental Officer">Senior Environmental Officer</SelectItem>
                              <SelectItem value="Environmental Inspector">Environmental Inspector</SelectItem>
                              <SelectItem value="Environmental Specialist">Environmental Specialist</SelectItem>
                              <SelectItem value="Team Leader">Team Leader</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact" className="text-sm font-medium text-gray-700">Contact Number *</Label>
                          <Input
                            id="contact"
                            value={newEmployee.contactNumber}
                            onChange={(e) => setNewEmployee({ ...newEmployee, contactNumber: e.target.value })}
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                            placeholder="+63 XXX XXX XXXX"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newEmployee.email}
                            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                            className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                            placeholder="email@epol.gov.ph"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter className="pt-4 border-t border-gray-200">
                      <Button variant="outline" onClick={() => setShowAddEmployeeModal(false)} className="border-gray-300 hover:bg-gray-50">
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleAddEmployee} 
                        disabled={!newEmployee.name || !newEmployee.position || !newEmployee.contactNumber || !newEmployee.email}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Add Employee
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Status</h3>
                  <div className="flex flex-wrap gap-2">
                    {["Active", "Inactive", "On Leave"].map((status) => (
                      <Button
                        key={status}
                        variant={selectedStatus === status ? "default" : "outline"}
                        size="sm"
                        className={`${getStatusColor(status)} ${selectedStatus === status ? "ring-2 ring-offset-2 ring-red-500 shadow-md" : "border-gray-300 hover:bg-gray-50"}`}
                        onClick={() => setSelectedStatus(selectedStatus === status ? null : status)}
                      >
                        {status}
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
      <Card className="bg-white shadow-md border-gray-200">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-t-lg border-b border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold text-gray-900">EPOL Employees</CardTitle>
              <CardDescription className="text-gray-600">Manage employee assignments and deployments</CardDescription>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center shadow-sm">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold text-gray-700">Employee ID</TableHead>
                  <TableHead className="font-semibold text-gray-700">Name</TableHead>
                  <TableHead className="font-semibold text-gray-700">Position</TableHead>
                  <TableHead className="font-semibold text-gray-700">Contact</TableHead>
                  <TableHead className="font-semibold text-gray-700">Status</TableHead>
                  <TableHead className="font-semibold text-gray-700">Current Assignment</TableHead>
                  <TableHead className="font-semibold text-gray-700">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell className="font-medium text-gray-900">{employee.id}</TableCell>
                    <TableCell className="font-medium text-gray-900">{employee.name}</TableCell>
                    <TableCell className="text-gray-700">{employee.position}</TableCell>
                    <TableCell className="text-gray-700">{employee.contactNumber}</TableCell>
                    <TableCell>
                      <Badge className={`px-3 py-1 text-sm font-medium border ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-700">
                      {employee.currentAssignment ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-gray-500" />
                            <span className="text-sm">{employee.currentAssignment.location}</span>
                          </div>
                          <Badge className={`px-2 py-0.5 text-xs font-medium border ${
                            employee.currentAssignment.status === 'Active' 
                              ? "bg-green-100 text-green-800 border-green-200" 
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }`}>
                            {employee.currentAssignment.status}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No assignment</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {!employee.currentAssignment || employee.currentAssignment.status !== 'Active' ? (
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 px-3 font-semibold bg-green-600 hover:bg-green-700 text-white shadow-sm"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowAssignmentModal(true);
                            }}
                          >
                            <MapPin className="h-3 w-3 mr-1" />
                            Assign
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 font-semibold border-blue-300 text-blue-700 hover:bg-blue-50 shadow-sm"
                            onClick={() => {
                              setSelectedEmployee(employee);
                              setShowReassignmentModal(true);
                            }}
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Reassign
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
              Assign {selectedEmployee?.name} to a new location and position.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">Location *</Label>
                <Select value={newAssignment.locationId} onValueChange={(value) => setNewAssignment({ ...newAssignment, locationId: value })}>
                  <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.currentStaff}/{location.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium text-gray-700">Position *</Label>
                <Input
                  id="position"
                  value={newAssignment.position}
                  onChange={(e) => setNewAssignment({ ...newAssignment, position: e.target.value })}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  placeholder="Enter position"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newAssignment.startDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, startDate: e.target.value })}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newAssignment.endDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, endDate: e.target.value })}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
              <Textarea
                id="notes"
                value={newAssignment.notes}
                onChange={(e) => setNewAssignment({ ...newAssignment, notes: e.target.value })}
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                placeholder="Additional notes about this assignment"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowAssignmentModal(false)} className="border-gray-300 hover:bg-gray-50">
              Cancel
            </Button>
            <Button 
              onClick={handleAssignEmployee} 
              disabled={!newAssignment.locationId || !newAssignment.position || !newAssignment.startDate}
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
              Reassign {selectedEmployee?.name} to a new location and position.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium text-gray-700">New Location *</Label>
                <Select value={newAssignment.locationId} onValueChange={(value) => setNewAssignment({ ...newAssignment, locationId: value })}>
                  <SelectTrigger className="border-gray-300 focus:border-red-500 focus:ring-red-500">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200">
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name} ({location.currentStaff}/{location.capacity})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium text-gray-700">New Position *</Label>
                <Input
                  id="position"
                  value={newAssignment.position}
                  onChange={(e) => setNewAssignment({ ...newAssignment, position: e.target.value })}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                  placeholder="Enter position"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newAssignment.startDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, startDate: e.target.value })}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={newAssignment.endDate}
                  onChange={(e) => setNewAssignment({ ...newAssignment, endDate: e.target.value })}
                  className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-gray-700">Notes</Label>
              <Textarea
                id="notes"
                value={newAssignment.notes}
                onChange={(e) => setNewAssignment({ ...newAssignment, notes: e.target.value })}
                className="border-gray-300 focus:border-red-500 focus:ring-red-500"
                placeholder="Reason for reassignment"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter className="pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setShowReassignmentModal(false)} className="border-gray-300 hover:bg-gray-50">
              Cancel
            </Button>
            <Button 
              onClick={handleReassignEmployee} 
              disabled={!newAssignment.locationId || !newAssignment.position || !newAssignment.startDate}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Reassign Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
