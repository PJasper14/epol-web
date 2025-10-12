"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  UserCog, 
  Shield,
  Key, 
  Eye,
  Search,
  Filter,
  MoreHorizontal,
  UserCheck,
  UserX,
  Clock,
  TrendingUp,
  AlertTriangle,
  X,
  ChevronLeft,
  ChevronRight,
  UserRound,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { usePasswordReset } from '@/contexts/PasswordResetContext';
import { useUser } from '@/contexts/UserContext';


export default function AccountManagementPage() {
  const { users } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { getPendingCount } = usePasswordReset();
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstName} ${user.lastName}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    
    return matchesSearch && matchesRole;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));
  const startIndex = filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage : 0;
  const endIndex = filteredUsers.length > 0 ? startIndex + itemsPerPage : 0;
  const currentUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRole]);



  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'Team Leader': return 'bg-green-100 text-green-800 border-green-200';
      case 'EPOL': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  const hasActiveFilters = selectedRole;

  const roles = ['Admin', 'Team Leader', 'EPOL'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Account Management</h1>
            <p className="text-gray-600 text-lg">Manage user accounts and roles across the organization</p>
          </div>
          <Link href="/dashboard">
            <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Total User Accounts</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">{users.length}</p>
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
                <p className="text-sm text-gray-600 font-medium mb-1">Admin Accounts</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {users.filter(u => u.role === 'Admin').length}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                <UserRound className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">Team Leader Accounts</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {users.filter(u => u.role === 'Team Leader').length}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                <UserRound className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-yellow-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-gray-600 font-medium mb-1">EPOL Accounts</p>
                <p className="text-3xl font-bold text-gray-900 mb-2">
                  {users.filter(u => u.role === 'EPOL').length}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center shadow-md">
                <UserRound className="h-7 w-7 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
      </div>


      {/* Search, Filters, and Actions */}
      <Card className="mb-6 bg-white shadow-md border-gray-200">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            {/* Search, Filter, and Action Controls */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
              {/* Search and Filter Controls */}
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    type="search"
                    placeholder="Search users..."
                    className="pl-10 w-full border-gray-300 focus:border-red-500 focus:ring-red-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                  {hasActiveFilters && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md">
                      {selectedRole ? 1 : 0}
                    </span>
                  )}
                </Button>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-shrink-0">
                <Link href="/dashboard/accounts/create">
                  <Button className="bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Employee
                  </Button>
                </Link>
                <Link href="/dashboard/accounts/password-resets">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                    <Key className="h-4 w-4 mr-2" />
                    Password Reset Requests
                    <span className="ml-2 px-2 py-1 bg-orange-100 text-orange-600 text-xs font-semibold rounded-full">
                      {getPendingCount()}
                    </span>
                  </Button>
                </Link>
              </div>
            </div>

            {showFilters && (
              <div className="pt-4 border-t border-gray-200">
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-gray-700">Role</h3>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                      <Button
                        key={role}
                        variant={selectedRole === role ? "default" : "outline"}
                        size="sm"
                        className={`${
                          role === "Admin" 
                            ? selectedRole === role 
                              ? "bg-red-600 text-white hover:bg-red-700 ring-2 ring-offset-2 ring-red-500 shadow-md" 
                              : "bg-red-100 text-red-700 hover:bg-red-200 border-red-200"
                            : role === "Team Leader"
                            ? selectedRole === role 
                              ? "bg-green-600 text-white hover:bg-green-700 ring-2 ring-offset-2 ring-green-500 shadow-md" 
                              : "bg-green-100 text-green-700 hover:bg-green-200 border-green-200"
                            : selectedRole === role 
                              ? "bg-yellow-600 text-white hover:bg-yellow-700 ring-2 ring-offset-2 ring-yellow-500 shadow-md" 
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-200"
                        }`}
                        onClick={() => setSelectedRole(selectedRole === role ? null : role)}
                      >
                        {role}
                        {selectedRole === role && <X className="ml-1 h-3 w-3" />}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="border-l-4 border-l-red-500 bg-white shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 rounded-t-lg border-b border-red-200">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center shadow-md">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-gray-900">User Accounts</CardTitle>
              <CardDescription className="text-base text-gray-600">
                {filteredUsers.length} users • Manage all user accounts in the system
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
                    User
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Role
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Last Updated
                  </th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-900 text-sm uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">No users found</h3>
                          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{user.firstName} {user.lastName}</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${getRoleColor(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">{user.createdAt}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-900">
                          {user.lastUpdated}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/accounts/${user.id}`}>
                            <Button 
                              variant="default" 
                              size="sm" 
                              className="h-8 px-3 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" />
                              View Details
                            </Button>
                          </Link>
                          <Link href={`/dashboard/accounts/${user.id}/delete`}>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-8 w-8 p-0 bg-red-600 hover:bg-red-700 text-white shadow-sm"
                            >
                              <UserX className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="text-sm text-gray-600 font-medium">
              {filteredUsers.length > 0 
                ? `Showing ${startIndex + 1}-${Math.min(endIndex, filteredUsers.length)} of ${filteredUsers.length} users`
                : `Showing 0 of 0 users`
              }
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || filteredUsers.length === 0}
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
                    disabled={totalPages === 1 || filteredUsers.length === 0}
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
                disabled={currentPage === totalPages || filteredUsers.length === 0}
                className="h-9 px-4 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
