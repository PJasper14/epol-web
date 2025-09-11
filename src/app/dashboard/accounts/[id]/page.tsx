"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Calendar, 
  Clock, 
  MapPin,
  Edit,
  Trash2,
  Key,
  Activity,
  AlertCircle,
  CheckCircle,
  MoreHorizontal,
  Settings,
  Download,
  RefreshCw,
  TrendingUp,
  UserCheck,
  UserX,
  Lock,
  Eye,
  Copy,
  ExternalLink,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'Admin' | 'Team Leader' | 'EPOL';
  department: string;
  status: 'Active' | 'Inactive' | 'Pending';
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  loginCount: number;
  lastActivity: string;
  permissions: string[];
  notes: string;
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  description: string;
  ipAddress: string;
}

const mockUserDetails: UserDetails = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@epol.com',
  phone: '+1 (555) 123-4567',
  role: 'Admin',
  department: 'Operations',
  status: 'Active',
  lastLogin: '2024-01-15 10:30:00',
  createdAt: '2024-01-01 09:00:00',
  updatedAt: '2024-01-15 10:30:00',
  loginCount: 45,
  lastActivity: '2024-01-15 10:30:00',
  permissions: [
    'View Dashboard',
    'Manage Users',
    'Manage Inventory',
    'View Reports',
    'System Settings'
  ],
  notes: 'Senior administrator with full system access. Handles critical operations and user management.'
};

const mockActivityLog: ActivityLog[] = [
  {
    id: '1',
    action: 'Login',
    timestamp: '2024-01-15 10:30:00',
    description: 'User logged in successfully',
    ipAddress: '192.168.1.100'
  },
  {
    id: '2',
    action: 'Update Profile',
    timestamp: '2024-01-15 09:15:00',
    description: 'Updated personal information',
    ipAddress: '192.168.1.100'
  },
  {
    id: '3',
    action: 'Create User',
    timestamp: '2024-01-14 16:45:00',
    description: 'Created new user account for Jane Smith',
    ipAddress: '192.168.1.100'
  },
  {
    id: '4',
    action: 'Login',
    timestamp: '2024-01-14 08:30:00',
    description: 'User logged in successfully',
    ipAddress: '192.168.1.100'
  }
];

export default function ViewAccountDetailsPage() {
  const params = useParams();
  const userId = params?.id as string;
  
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Here you would make the actual API call to fetch user details
        setUserDetails(mockUserDetails);
        setActivityLog(mockActivityLog);
      } catch (err) {
        setError('Failed to fetch user details');
        console.error('Error fetching user details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Inactive': return 'bg-gray-100 text-gray-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800';
      case 'Team Leader': return 'bg-blue-100 text-blue-800';
      case 'EPOL': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'Login': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Update Profile': return <Edit className="h-4 w-4 text-blue-600" />;
      case 'Create User': return <User className="h-4 w-4 text-purple-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (error || !userDetails) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">{error || 'User not found'}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/accounts">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100 transition-colors">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Accounts
                </Button>
              </Link>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-white">
                    {userDetails.firstName[0]}{userDetails.lastName[0]}
                  </span>
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {userDetails.firstName} {userDetails.lastName}
                  </h1>
                  <p className="text-gray-600 text-lg">{userDetails.email}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="hover:bg-gray-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" className="hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Link href={`/dashboard/accounts/${userId}/edit`}>
                <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Account
                </Button>
              </Link>
              <Button variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>

        {/* User Status and Role */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2">
            <Badge className={`${getStatusColor(userDetails.status)} text-sm px-4 py-2 font-medium flex items-center gap-2`}>
              {userDetails.status === 'Active' ? <UserCheck className="h-4 w-4" /> : 
               userDetails.status === 'Inactive' ? <UserX className="h-4 w-4" /> : 
               <Clock className="h-4 w-4" />}
              {userDetails.status}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={`${getRoleColor(userDetails.role)} text-sm px-4 py-2 font-medium flex items-center gap-2`}>
              <Shield className="h-4 w-4" />
              {userDetails.role}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Building className="h-4 w-4" />
            <span className="font-medium">{userDetails.department}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Activity className="h-4 w-4" />
            <span>ID: {userDetails.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main User Information */}
          <div className="lg:col-span-2 space-y-8">
            {/* Personal Information */}
            <Card className="shadow-lg border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      First Name
                    </Label>
                    <p className="text-lg font-semibold text-gray-900">{userDetails.firstName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Last Name
                    </Label>
                    <p className="text-lg font-semibold text-gray-900">{userDetails.lastName}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address
                    </Label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-medium text-gray-900">{userDetails.email}</p>
                      <Button variant="ghost" size="sm" className="p-1">
                        <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number
                    </Label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-medium text-gray-900">{userDetails.phone}</p>
                      <Button variant="ghost" size="sm" className="p-1">
                        <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="shadow-lg border-l-4 border-l-green-500">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      User ID
                    </Label>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-mono font-semibold text-gray-900">{userDetails.id}</p>
                      <Button variant="ghost" size="sm" className="p-1">
                        <Copy className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Login Count
                    </Label>
                    <p className="text-2xl font-bold text-gray-900">{userDetails.loginCount}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Created Date
                    </Label>
                    <p className="text-lg font-semibold text-gray-900">{new Date(userDetails.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Last Updated
                    </Label>
                    <p className="text-lg font-semibold text-gray-900">{new Date(userDetails.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Last Login
                  </Label>
                  <p className="text-lg font-semibold text-gray-900">{new Date(userDetails.lastLogin).toLocaleString()}</p>
                </div>
              </CardContent>
            </Card>

            {/* Permissions */}
            <Card className="shadow-lg border-l-4 border-l-purple-500">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  Permissions
                </CardTitle>
                <CardDescription className="text-base">
                  System permissions assigned to this user
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userDetails.permissions.map((permission, index) => (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm font-medium text-gray-900">{permission}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {userDetails.notes && (
              <Card className="shadow-lg border-l-4 border-l-orange-500">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <p className="text-gray-700 leading-relaxed">{userDetails.notes}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-gray-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <Button variant="outline" className="w-full justify-start h-12 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors">
                  <Key className="h-4 w-4 mr-3" />
                  Reset Password
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors">
                  <Shield className="h-4 w-4 mr-3" />
                  Manage Roles
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 hover:bg-green-50 hover:text-green-600 hover:border-green-200 transition-colors">
                  <Activity className="h-4 w-4 mr-3" />
                  View Full Activity
                </Button>
                <Button variant="outline" className="w-full justify-start h-12 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-colors">
                  <Download className="h-4 w-4 mr-3" />
                  Export Data
                </Button>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100">
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-gray-600" />
                  Recent Activity
                </CardTitle>
                <CardDescription>
                  Last 4 activities
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {activityLog.slice(0, 4).map((activity, index) => (
                    <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors border-l-4 border-l-gray-200">
                      <div className="flex-shrink-0 mt-1">
                        {getActionIcon(activity.action)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(activity.timestamp).toLocaleString()}</span>
                          <span>•</span>
                          <span>{activity.ipAddress}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <Button variant="outline" className="w-full text-sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View All Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper component for Label
function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={`block ${className || ''}`} {...props}>
      {children}
    </label>
  );
}
