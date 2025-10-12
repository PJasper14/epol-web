"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User as UserIcon, 
  Phone, 
  Shield, 
  Calendar, 
  Clock, 
  Edit,
  Activity,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  UserCheck,
  UserX,
  Copy,
  Building
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUser, User } from '@/contexts/UserContext';





export default function ViewAccountDetailsPage() {
  const params = useParams();
  const userId = params?.id as string;
  const { getUserById } = useUser();
  
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find user by ID
        const user = getUserById(userId);
        if (user) {
          setUserDetails(user);
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError('Failed to fetch user details');
        console.error('Error fetching user details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId, getUserById]);

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
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">
        {/* Enhanced Header with Hero Section */}
        <div className="mb-12">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Account Details</h1>
                <div className="mt-4">
                  <Link href={`/dashboard/accounts/${userId}/edit`}>
                    <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-2 text-white">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Details
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/accounts">
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Accounts
                </Button>
              </Link>
            </div>
          </div>
        </div>


        <div className="max-w-6xl mx-auto">
          {/* Main User Information */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-indigo-500/10 p-8">
                <CardTitle className="flex items-center gap-4 text-2xl">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <UserIcon className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                    Personal Information
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <UserIcon className="h-3 w-3" />
                      First Name
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-lg font-bold text-gray-900">{userDetails.firstName}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <UserIcon className="h-3 w-3" />
                      Last Name
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-lg font-bold text-gray-900">{userDetails.lastName}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Phone className="h-3 w-3" />
                      Phone Number
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-between group">
                      <p className="text-sm font-semibold text-gray-900">{userDetails.phone}</p>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100">
                        <Copy className="h-3 w-3 text-gray-600" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <UserIcon className="h-3 w-3" />
                      Gender
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-lg font-bold text-gray-900">{userDetails.gender}</p>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Birthday
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-between group">
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(userDetails.birthday).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100">
                        <Copy className="h-3 w-3 text-gray-600" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Age
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-lg font-bold text-gray-900">{userDetails.age} years old</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <UserIcon className="h-3 w-3" />
                      Username
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-between group">
                      <p className="text-sm font-semibold text-gray-900">{userDetails.username}</p>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100">
                        <Copy className="h-3 w-3 text-gray-600" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Building className="h-3 w-3" />
                      Home Address
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-sm font-semibold text-gray-900 truncate">{userDetails.homeAddress}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Information */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-teal-500/10 p-8">
                <CardTitle className="flex items-center gap-4 text-2xl">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent font-bold">
                    Account Information
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Activity className="h-3 w-3" />
                      User ID
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm flex items-center justify-between group">
                      <p className="text-sm font-mono font-bold text-gray-900">{userDetails.id}</p>
                      <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-100">
                        <Copy className="h-3 w-3 text-gray-600" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Shield className="h-3 w-3" />
                      User Role
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-900">{userDetails.role}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Calendar className="h-3 w-3" />
                      Created Date
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-900">{new Date(userDetails.createdAt).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      Last Updated
                    </Label>
                    <div className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-sm font-bold text-gray-900">{new Date(userDetails.lastUpdated).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                      })}</p>
                    </div>
                  </div>
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
