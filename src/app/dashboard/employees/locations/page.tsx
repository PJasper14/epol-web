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
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Navigation,
  Users,
  Map,
  ArrowLeft,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useLocation } from "@/contexts/LocationContext";
import { apiService } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { WorkplaceLocation } from "@/types/location";

export default function LocationManagementPage() {
  const { workplaceLocations, addLocation, updateLocation, deleteLocation, loading, error } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [showEditLocationModal, setShowEditLocationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<WorkplaceLocation | null>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // New location form
  const [newLocation, setNewLocation] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius: "",
  });

  // Edit location form
  const [editLocation, setEditLocation] = useState({
    name: "",
    latitude: "",
    longitude: "",
    radius: "",
  });

  // Filter locations based on search
  const filteredLocations = workplaceLocations.filter(location => 
    location.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredLocations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedLocations = filteredLocations.slice(startIndex, endIndex);

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

  // Reset to first page when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };


  const handleAddLocation = async () => {
    if (newLocation.name && newLocation.latitude && newLocation.longitude && newLocation.radius) {
      try {
        const locationData = {
          name: newLocation.name,
          description: "",
          latitude: parseFloat(newLocation.latitude),
          longitude: parseFloat(newLocation.longitude),
          radius: parseInt(newLocation.radius),
        };
        
        const response = await apiService.createWorkplaceLocation(locationData);
        
        // Transform the API response to match our interface
        const responseData = response as any;
        if (responseData.location) {
          const transformedLocation = {
            id: responseData.location.id.toString(),
            name: responseData.location.name,
            latitude: parseFloat(responseData.location.latitude),
            longitude: parseFloat(responseData.location.longitude),
            radius: parseInt(responseData.location.radius),
            address: responseData.location.description || '',
            createdAt: responseData.location.created_at,
            updatedAt: responseData.location.updated_at,
          };
          addLocation(transformedLocation);
        } else {
          console.error('No location data in API response:', response);
        }
        setNewLocation({ name: "", latitude: "", longitude: "", radius: "" });
        setShowAddLocationModal(false);
      } catch (error) {
        console.error('Error creating location:', error);
      }
    }
  };

  const handleEditLocation = async () => {
    if (selectedLocation && editLocation.name && editLocation.latitude && editLocation.longitude && editLocation.radius) {
      try {
        const locationData = {
          name: editLocation.name,
          description: "",
          latitude: parseFloat(editLocation.latitude),
          longitude: parseFloat(editLocation.longitude),
          radius: parseInt(editLocation.radius),
          is_active: true,
        };
        
        const response = await apiService.updateWorkplaceLocation(selectedLocation.id, locationData);
        
        // Transform the API response to match our interface
        const responseData = response as any;
        if (responseData.location) {
          const transformedLocation = {
            id: responseData.location.id.toString(),
            name: responseData.location.name,
            latitude: parseFloat(responseData.location.latitude),
            longitude: parseFloat(responseData.location.longitude),
            radius: parseInt(responseData.location.radius),
            address: responseData.location.description || '',
            createdAt: responseData.location.created_at,
            updatedAt: responseData.location.updated_at,
          };
          updateLocation(transformedLocation);
        } else {
          console.error('No location data in API response:', response);
        }
        setShowEditLocationModal(false);
        setSelectedLocation(null);
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      await apiService.deleteWorkplaceLocation(locationId);
      deleteLocation(locationId);
      setShowDeleteModal(false);
      setSelectedLocation(null);
    } catch (error) {
      console.error('Error deleting location:', error);
    }
  };

  const openDeleteModal = (location: WorkplaceLocation) => {
    setSelectedLocation(location);
    setShowDeleteModal(true);
  };


  const openEditModal = (location: WorkplaceLocation) => {
    setSelectedLocation(location);
    setEditLocation({
      name: location.name,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius: location.radius.toString(),
    });
    setShowEditLocationModal(true);
  };


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mb-6">
      <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Location Assignments/Deployments</h1>
            <p className="text-gray-600">Manage workplace locations for employee assignments</p>
          </div>
          <Link href="/dashboard/employees">
            <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Employee Management
            </Button>
          </Link>
        </div>
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
                  placeholder="Search locations..."
                  className="pl-10 w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>
              <Button 
                onClick={() => setShowAddLocationModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Locations Table */}
      <Card className="border-l-4 border-l-red-500 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-md">
              <MapPin className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">Workplace Locations</CardTitle>
              <CardDescription className="text-base text-gray-600">
                Manage workplace locations for employee assignments
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
                    Name
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Coordinates
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Radius
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedLocations.length > 0 ? paginatedLocations.map((location) => (
                  <tr key={location.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{location.name}</div>
                    </td>
                    <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">
                        <div>Latitude: {location.latitude.toFixed(6)}</div>
                        <div>Longitude: {location.longitude.toFixed(6)}</div>
                    </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        {location.radius}m
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          onClick={() => openEditModal(location)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                          onClick={() => openDeleteModal(location)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <MapPin className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">No locations found</h3>
                          <p className="text-gray-500">Try adjusting your search criteria or add a new location</p>
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
              {filteredLocations.length > 0 
                ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredLocations.length)} of ${filteredLocations.length} records`
                : `Showing 0 of 0 records`
              }
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || filteredLocations.length === 0}
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
                    disabled={totalPages === 1 || filteredLocations.length === 0}
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
                disabled={currentPage === totalPages || filteredLocations.length === 0}
                className="h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Location Modal */}
      <Dialog open={showAddLocationModal} onOpenChange={setShowAddLocationModal}>
        <DialogContent className="max-w-md bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Create a new workplace location for employee assignments.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                value={newLocation.name}
                onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
                placeholder="Enter location name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  value={newLocation.latitude}
                  onChange={(e) => setNewLocation({ ...newLocation, latitude: e.target.value })}
                  placeholder="Enter latitude"
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  value={newLocation.longitude}
                  onChange={(e) => setNewLocation({ ...newLocation, longitude: e.target.value })}
                  placeholder="Enter longitude"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="radius">Radius (meters)</Label>
              <Input
                id="radius"
                type="number"
                value={newLocation.radius}
                onChange={(e) => setNewLocation({ ...newLocation, radius: e.target.value })}
                placeholder="Enter radius"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddLocationModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLocation} className="bg-green-600 hover:bg-green-700 text-white">
              Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Location Modal */}
      <Dialog open={showEditLocationModal} onOpenChange={setShowEditLocationModal}>
        <DialogContent className="max-w-md bg-white border-gray-200 shadow-xl">
          <DialogHeader>
            <DialogTitle>Edit Location</DialogTitle>
            <DialogDescription>
              Update the location details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Location Name</Label>
              <Input
                id="edit-name"
                value={editLocation.name}
                onChange={(e) => setEditLocation({ ...editLocation, name: e.target.value })}
                placeholder="Enter location name"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-latitude">Latitude</Label>
                <Input
                  id="edit-latitude"
                  type="number"
                  step="any"
                  value={editLocation.latitude}
                  onChange={(e) => setEditLocation({ ...editLocation, latitude: e.target.value })}
                  placeholder="14.2753056"
                />
              </div>
              <div>
                <Label htmlFor="edit-longitude">Longitude</Label>
                <Input
                  id="edit-longitude"
                  type="number"
                  step="any"
                  value={editLocation.longitude}
                  onChange={(e) => setEditLocation({ ...editLocation, longitude: e.target.value })}
                  placeholder="121.1297778"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="edit-radius">Radius (meters)</Label>
              <Input
                id="edit-radius"
                type="number"
                value={editLocation.radius}
                onChange={(e) => setEditLocation({ ...editLocation, radius: e.target.value })}
                placeholder="100"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditLocationModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditLocation} className="bg-blue-600 hover:bg-blue-700 text-white">
              Update Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md bg-white border-gray-200 shadow-xl">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Location
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Are you sure you want to delete "{selectedLocation?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">{selectedLocation?.name}</h4>
                  <p className="text-sm text-gray-600">
                    Latitude: {selectedLocation?.latitude.toFixed(6)}<br />
                    Longitude: {selectedLocation?.longitude.toFixed(6)}<br />
                    Radius: {selectedLocation?.radius}m
                  </p>
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
              onClick={() => selectedLocation && handleDeleteLocation(selectedLocation.id)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
