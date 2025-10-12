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
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Info,
  Copy,
  ExternalLink,
  Target,
  SquarePen,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useLocation } from "@/contexts/LocationContext";
import { apiService } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import { WorkplaceLocation } from "@/types/location";
import { LocationMapView } from "@/components/ui/LocationMapView";
import { LocationMapPicker } from "@/components/ui/LocationMapPicker";

export default function LocationManagementPage() {
  const { workplaceLocations, addLocation, updateLocation, deleteLocation, loading, error } = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddLocationModal, setShowAddLocationModal] = useState(false);
  const [showEditLocationModal, setShowEditLocationModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<WorkplaceLocation | null>(null);
  const [formErrors, setFormErrors] = useState<{name?: string; radius?: string; coordinates?: string}>({});
  
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
    // Validation
    const errors: typeof formErrors = {};
    
    if (!newLocation.name.trim()) {
      errors.name = "Location name is required";
    }
    
    if (!newLocation.radius || parseInt(newLocation.radius) <= 0) {
      errors.radius = "Please enter a valid radius";
    }
    
    if (!newLocation.latitude || !newLocation.longitude) {
      errors.coordinates = "Please select a location on the map";
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
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
        setFormErrors({});
        setShowAddLocationModal(false);
      } catch (error) {
        console.error('Error creating location:', error);
        alert('Failed to create location. Please try again.');
    }
  };

  const handleEditLocation = async () => {
    // Validation
    const errors: typeof formErrors = {};
    
    if (!editLocation.name.trim()) {
      errors.name = "Location name is required";
    }
    
    if (!editLocation.radius || parseInt(editLocation.radius) <= 0) {
      errors.radius = "Please enter a valid radius";
    }
    
    if (!editLocation.latitude || !editLocation.longitude) {
      errors.coordinates = "Please select a location on the map";
    }
    
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }
    
    if (!selectedLocation) return;
    
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
        setFormErrors({});
        alert('✅ Location updated successfully!');
      } catch (error) {
        console.error('Error updating location:', error);
        alert('❌ Failed to update location. Please try again.');
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
    setFormErrors({});
    setShowEditLocationModal(true);
  };


  const openMapModal = (location: WorkplaceLocation) => {
    setSelectedLocation(location);
    setShowMapModal(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`✅ ${label} copied to clipboard!`);
  };

  const openInGoogleMaps = (lat: number, lng: number) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, '_blank');
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
                          className="h-8 w-8 p-0 bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm"
                          onClick={() => openMapModal(location)}
                          title="View on Map"
                        >
                          <Map className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 w-8 p-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                          onClick={() => openEditModal(location)}
                          title="Edit Location"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                          onClick={() => openDeleteModal(location)}
                          title="Delete Location"
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
      <Dialog open={showAddLocationModal} onOpenChange={(open) => {
        setShowAddLocationModal(open);
        if (!open) {
          setNewLocation({ name: "", latitude: "", longitude: "", radius: "" });
          setFormErrors({});
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-white border-gray-200 shadow-xl overflow-hidden flex flex-col [&>button]:hidden">
          <DialogHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-lg">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">Add New Location</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Create a workplace location with geofence settings
            </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="space-y-6 py-4 overflow-y-auto flex-1 pr-2">
            {/* Step 1: Basic Information */}
          <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">1</div>
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="pl-9 space-y-4">
                {/* Location Name */}
            <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Location Name <span className="text-red-500">*</span>
                  </Label>
              <Input
                id="name"
                value={newLocation.name}
                    onChange={(e) => {
                      setNewLocation({ ...newLocation, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                    }}
                    placeholder="enter location name"
                    className={`mt-1.5 ${formErrors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {formErrors.name}
                    </p>
                  )}
            </div>

                {/* Radius with Presets */}
              <div>
                  <Label htmlFor="radius" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    Geofence Radius <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-gray-500 mt-0.5 mb-2">Quick presets or enter custom value</p>
                  
                  {/* Radius Preset Buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[50, 100, 200, 500].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setNewLocation({ ...newLocation, radius: preset.toString() });
                          if (formErrors.radius) setFormErrors({ ...formErrors, radius: undefined });
                        }}
                        className={`
                          py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200
                          ${newLocation.radius === preset.toString()
                            ? "bg-green-600 text-white shadow-md ring-2 ring-green-300"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                          }
                        `}
                      >
                        {preset}m
                      </button>
                    ))}
                  </div>
                  
                  {/* Custom Radius Input */}
                  <div className="relative">
                <Input
                      id="radius"
                  type="number"
                      min="1"
                      value={newLocation.radius}
                      onChange={(e) => {
                        setNewLocation({ ...newLocation, radius: e.target.value });
                        if (formErrors.radius) setFormErrors({ ...formErrors, radius: undefined });
                      }}
                      placeholder="Or enter custom radius"
                      className={`pr-12 ${formErrors.radius ? "border-red-500 focus:ring-red-500" : ""}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                      meters
                    </span>
                  </div>
                  
                  {formErrors.radius && (
                    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      {formErrors.radius}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Step 2: Location Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-sm font-bold">2</div>
                <h3 className="text-lg font-semibold text-gray-900">Select Location on Map</h3>
              </div>
              
              <div className="pl-9 space-y-3">
                {formErrors.coordinates && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {formErrors.coordinates}
                    </p>
                  </div>
                )}
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900 flex items-start gap-2">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>Click anywhere on the map or drag the marker to set your location. The coordinates will appear below after selection.</span>
                  </p>
                </div>

                <LocationMapPicker
                  latitude={newLocation.latitude ? parseFloat(newLocation.latitude) : undefined}
                  longitude={newLocation.longitude ? parseFloat(newLocation.longitude) : undefined}
                  showRadius={false}
                  onLocationSelect={(lat, lng) => {
                    setNewLocation({
                      ...newLocation,
                      latitude: lat.toFixed(6),
                      longitude: lng.toFixed(6)
                    });
                    if (formErrors.coordinates) setFormErrors({ ...formErrors, coordinates: undefined });
                  }}
                />

                {/* Coordinates Display - Only show after selection */}
                {newLocation.latitude && newLocation.longitude && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2 text-green-800">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-semibold text-sm">Location Selected</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-md p-3 border border-green-200">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Latitude</p>
                        <p className="text-sm font-mono font-semibold text-gray-900">{newLocation.latitude}</p>
                      </div>
                      <div className="bg-white rounded-md p-3 border border-green-200">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Longitude</p>
                        <p className="text-sm font-mono font-semibold text-gray-900">{newLocation.longitude}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-green-700">
                      💡 You can click on the map again to adjust the location
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-200 pt-4 flex items-center justify-between flex-shrink-0 mt-auto">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="text-red-500">*</span> Required fields
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  setShowAddLocationModal(false);
                  setNewLocation({ name: "", latitude: "", longitude: "", radius: "" });
                  setFormErrors({});
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-6 shadow-md hover:shadow-lg transition-all"
              >
              Cancel
            </Button>
              <Button 
                onClick={handleAddLocation} 
                className="bg-green-600 hover:bg-green-700 text-white px-6 shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Location Modal */}
      <Dialog open={showEditLocationModal} onOpenChange={(open) => {
        setShowEditLocationModal(open);
        if (!open) {
          setFormErrors({});
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] bg-white border-gray-200 shadow-xl overflow-hidden flex flex-col [&>button]:hidden">
          <DialogHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Edit className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">Edit Location</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Update location details and adjust the geofence settings
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4 px-1 overflow-y-auto flex-1">
            {/* Original vs New Values Comparison */}
            {selectedLocation && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Current Location Details
                </h3>
                <div className="grid grid-cols-3 gap-3 text-xs">
                   <div>
                      <p className="text-blue-600 font-medium">Location Name:</p>
                      <p className="text-blue-900 font-semibold">{selectedLocation.name}</p>
                    </div>
                    <div>
                      <p className="text-blue-600 font-medium">Coordinates:</p>
                      <p className="text-blue-900 font-mono">{selectedLocation.latitude.toFixed(6)}, {selectedLocation.longitude.toFixed(6)}</p>
                    </div>
                    <div>
                      <p className="text-blue-600 font-medium">Radius:</p>
                      <p className="text-blue-900 font-semibold">{selectedLocation.radius}m</p>
                    </div>
                </div>
              </div>
            )}

            {/* Edit Form */}
            <div className="space-y-5">
              {/* Location Name */}
              <div>
                <Label htmlFor="edit-name" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Location Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={editLocation.name}
                  onChange={(e) => {
                    setEditLocation({ ...editLocation, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  placeholder="e.g., Main Office, Branch 1"
                  className={`mt-1.5 ${formErrors.name ? "border-red-500 focus:ring-red-500" : ""}`}
                />
                {formErrors.name && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {formErrors.name}
                  </p>
                )}
              </div>

              {/* Radius with Presets */}
              <div>
                <Label htmlFor="edit-radius" className="text-sm font-medium text-gray-700 flex items-center gap-1">
                  Geofence Radius <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">Quick presets or enter custom value</p>
                
                {/* Radius Preset Buttons */}
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[50, 100, 200, 500].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => {
                        setEditLocation({ ...editLocation, radius: preset.toString() });
                        if (formErrors.radius) setFormErrors({ ...formErrors, radius: undefined });
                      }}
                      className={`
                        py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200
                        ${editLocation.radius === preset.toString()
                          ? "bg-blue-600 text-white shadow-md ring-2 ring-blue-300"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                        }
                      `}
                    >
                      {preset}m
                    </button>
                  ))}
                </div>
                
                {/* Custom Radius Input */}
                <div className="relative">
                  <Input
                    id="edit-radius"
                    type="number"
                    min="1"
                    value={editLocation.radius}
                    onChange={(e) => {
                      setEditLocation({ ...editLocation, radius: e.target.value });
                      if (formErrors.radius) setFormErrors({ ...formErrors, radius: undefined });
                    }}
                    placeholder="Or enter custom radius"
                    className={`pr-12 ${formErrors.radius ? "border-red-500 focus:ring-red-500" : ""}`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium">
                    meters
                  </span>
                </div>
                
                {formErrors.radius && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    {formErrors.radius}
                  </p>
                )}
              </div>

              {/* Interactive Map Picker with Live Radius */}
              <div>
                <Label className="text-sm font-medium text-gray-700">Adjust Location on Map</Label>
                <p className="text-xs text-gray-500 mt-0.5 mb-2">The red circle shows your current radius setting</p>
                
                {formErrors.coordinates && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <p className="text-sm text-red-800 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 flex-shrink-0" />
                      {formErrors.coordinates}
                    </p>
                  </div>
                )}

                <LocationMapPicker
                  latitude={editLocation.latitude ? parseFloat(editLocation.latitude) : undefined}
                  longitude={editLocation.longitude ? parseFloat(editLocation.longitude) : undefined}
                  radius={editLocation.radius ? parseInt(editLocation.radius) : 100}
                  showRadius={true}
                  onLocationSelect={(lat, lng) => {
                    setEditLocation({
                      ...editLocation,
                      latitude: lat.toFixed(6),
                      longitude: lng.toFixed(6)
                    });
                    if (formErrors.coordinates) setFormErrors({ ...formErrors, coordinates: undefined });
                  }}
                />

                {/* Current Coordinates Display */}
                {editLocation.latitude && editLocation.longitude && (
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                      <p className="text-xs font-medium text-green-700 uppercase mb-1">Latitude</p>
                      <p className="text-sm font-mono font-semibold text-green-900">{editLocation.latitude}</p>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                      <p className="text-xs font-medium text-yellow-700 uppercase mb-1">Longitude</p>
                      <p className="text-sm font-mono font-semibold text-yellow-900">{editLocation.longitude}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-200 pt-4 flex items-center justify-end gap-2 flex-shrink-0 mt-auto">
            <Button 
              onClick={() => {
                setShowEditLocationModal(false);
                setFormErrors({});
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 shadow-md hover:shadow-lg transition-all"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleEditLocation}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 shadow-lg hover:shadow-xl transition-all"
            >
              <SquarePen className="h-4 w-4 mr-2" />
              Update Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md bg-white border-gray-200 shadow-xl [&>button]:hidden">
          <DialogHeader className="border-b border-gray-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">Delete Location?</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  This action cannot be undone
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            {/* Location Info Card */}
            <div className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-md">
                  <MapPin className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-red-900 text-lg mb-2">{selectedLocation?.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/60 rounded p-2 border border-red-200">
                      <p className="text-red-600 font-medium">Latitude</p>
                      <p className="text-red-900 font-mono font-semibold">{selectedLocation?.latitude.toFixed(6)}</p>
                    </div>
                    <div className="bg-white/60 rounded p-2 border border-red-200">
                      <p className="text-red-600 font-medium">Longitude</p>
                      <p className="text-red-900 font-mono font-semibold">{selectedLocation?.longitude.toFixed(6)}</p>
                    </div>
                  </div>
                  <div className="mt-2 bg-white/60 rounded p-2 border border-red-200">
                    <p className="text-red-600 font-medium text-xs">Geofence Radius</p>
                    <p className="text-red-900 font-bold">{selectedLocation?.radius}m</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-yellow-900 text-sm mb-1">Warning</h5>
                  <p className="text-xs text-yellow-800">
                    Employees assigned to this location may no longer be able to clock in/out. Consider reassigning them before deletion.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-gray-200 pt-4 flex items-center justify-end gap-2">
            <Button 
              onClick={() => setShowDeleteModal(false)} 
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 shadow-md"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => selectedLocation && handleDeleteLocation(selectedLocation.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 shadow-lg"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Yes, Delete Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Map Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="max-w-4xl bg-white border-gray-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh] [&>button]:hidden">
          <DialogHeader className="border-b border-gray-200 pb-4 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg">
                <Map className="h-6 w-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900">{selectedLocation?.name}</DialogTitle>
                <DialogDescription className="text-gray-600 mt-1">
                  Location details and geofence visualization
            </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedLocation && (
            <div className="space-y-4 overflow-y-auto flex-1 py-4">
              {/* Enhanced Coordinate Cards with Copy Buttons */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-semibold text-green-700 uppercase tracking-wide">Latitude</p>
                    <button
                      onClick={() => copyToClipboard(selectedLocation.latitude.toString(), "Latitude")}
                      className="text-green-600 hover:text-green-800 transition-colors"
                      title="Copy latitude"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-green-900 font-mono">{selectedLocation.latitude.toFixed(6)}</p>
                </div>
                
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4 border border-yellow-200 shadow-sm">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wide">Longitude</p>
                    <button
                      onClick={() => copyToClipboard(selectedLocation.longitude.toString(), "Longitude")}
                      className="text-yellow-600 hover:text-yellow-800 transition-colors"
                      title="Copy longitude"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-lg font-bold text-yellow-900 font-mono">{selectedLocation.longitude.toFixed(6)}</p>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Geofence</p>
                    <Target className="h-4 w-4 text-red-600" />
                  </div>
                  <p className="text-lg font-bold text-red-900">{selectedLocation.radius}m radius</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                  onClick={() => {
                    const coords = `${selectedLocation.latitude},${selectedLocation.longitude}`;
                    copyToClipboard(coords, "Coordinates");
                  }}
                >
                  <Copy className="h-4 w-4" />
                  Copy Coordinates
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 gap-2 border-green-300 text-green-700 hover:bg-green-50"
                  onClick={() => openInGoogleMaps(selectedLocation.latitude, selectedLocation.longitude)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in Google Maps
                </Button>
              </div>

              {/* Map with Radius Circle */}
              <div className="rounded-lg overflow-hidden border-2 border-green-200 shadow-md">
              <LocationMapView
                latitude={selectedLocation.latitude}
                longitude={selectedLocation.longitude}
                radius={selectedLocation.radius}
                locationName={selectedLocation.name}
              />
              </div>

              {/* Info Cards */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0 shadow-md">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-900 mb-1">Geofence Area</h4>
                      <p className="text-xs text-red-700">
                        {selectedLocation.radius}m radius circular zone. Employees must be within this area to clock in/out.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-md">
                      <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                      <h4 className="font-semibold text-blue-900 mb-1">Center Point</h4>
                      <p className="text-xs text-blue-700">
                        Blue marker shows the exact center of the geofence location on the map.
                    </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="border-t border-gray-200 pt-4 flex items-center justify-between flex-shrink-0">
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <Navigation className="h-4 w-4 text-green-600" />
              <span>OpenStreetMap visualization</span>
            </div>
            <Button 
              onClick={() => setShowMapModal(false)} 
              className="bg-red-600 hover:bg-red-700 text-white px-6 shadow-lg"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
