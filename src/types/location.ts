// Location management types for EPOL web admin

export interface WorkplaceLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in meters
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeLocationAssignment {
  id: string;
  employeeId: string;
  locationId: string;
  assignedAt: string;
  assignedBy: string;
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  position: string;
  contactNumber: string;
  email: string;
  status: 'Active' | 'Inactive' | 'On Leave';
  currentLocationAssignment?: EmployeeLocationAssignment;
}

// Mock data for locations (this will come from API)
export const MOCK_WORKPLACE_LOCATIONS: WorkplaceLocation[] = [
  {
    id: 'location-1',
    name: 'Workplace Location 1',
    latitude: 14.2753056,
    longitude: 121.1297778,
    radius: 100,
    address: 'Location 1 Address, Cabuyao, Laguna',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'location-2',
    name: 'Workplace Location 2',
    latitude: 14.2595278,
    longitude: 121.1337500,
    radius: 100,
    address: 'Location 2 Address, Cabuyao, Laguna',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'location-3',
    name: 'Workplace Location 3',
    latitude: 14.2773056,
    longitude: 121.1234722,
    radius: 100,
    address: 'Location 3 Address, Cabuyao, Laguna',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
];

// Mock employee location assignments
export const MOCK_EMPLOYEE_LOCATION_ASSIGNMENTS: EmployeeLocationAssignment[] = [
  { id: '1', employeeId: '1', locationId: 'location-1', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '2', employeeId: '2', locationId: 'location-2', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '3', employeeId: '3', locationId: 'location-1', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '4', employeeId: '4', locationId: 'location-3', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '5', employeeId: '5', locationId: 'location-2', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '6', employeeId: '6', locationId: 'location-1', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '7', employeeId: '7', locationId: 'location-2', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '8', employeeId: '8', locationId: 'location-3', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '9', employeeId: '9', locationId: 'location-1', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '10', employeeId: '10', locationId: 'location-2', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '11', employeeId: '11', locationId: 'location-3', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '12', employeeId: '12', locationId: 'location-1', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '13', employeeId: '13', locationId: 'location-2', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '14', employeeId: '14', locationId: 'location-3', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '15', employeeId: '15', locationId: 'location-1', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '16', employeeId: '16', locationId: 'location-2', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '17', employeeId: '17', locationId: 'location-3', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
  { id: '18', employeeId: '18', locationId: 'location-1', assignedAt: '2024-01-01T00:00:00Z', assignedBy: 'admin' },
];
