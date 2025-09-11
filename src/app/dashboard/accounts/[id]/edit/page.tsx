"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, AlertCircle, CheckCircle, User, Mail, Phone, Shield, Building, Calendar, Settings, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  status: string;
  notes: string;
}

const mockUserDetails = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@epol.com',
  phone: '+1 (555) 123-4567',
  role: 'Admin',
  department: 'Operations',
  status: 'Active',
  notes: 'Senior administrator with full system access.'
};

export default function EditUserAccountPage() {
  const params = useParams();
  const userId = params?.id as string;
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: '',
    notes: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Here you would make the actual API call to fetch user details
        setFormData({
          firstName: mockUserDetails.firstName,
          lastName: mockUserDetails.lastName,
          email: mockUserDetails.email,
          phone: mockUserDetails.phone,
          role: mockUserDetails.role,
          department: mockUserDetails.department,
          status: mockUserDetails.status,
          notes: mockUserDetails.notes
        });
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to fetch user details' });
        console.error('Error fetching user details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make the actual API call to update the user
      console.log('Updating user account:', userId, formData);
      
      setMessage({ type: 'success', text: 'User account updated successfully!' });
      
    } catch (error) {
      console.error('Error updating user account:', error);
      setMessage({ type: 'error', text: 'Failed to update user account' });
    } finally {
      setSaving(false);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href={`/dashboard/accounts/${userId}`}>
              <Button variant="ghost" size="sm" className="hover:bg-gray-100 transition-colors">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Account Details
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Edit User Account</h1>
            <p className="text-gray-600 text-lg">Update user information and account settings</p>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <Card className={`mb-6 shadow-md ${message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <CardContent className="pt-6">
              <div className={`flex items-center gap-2 ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                <span className="font-medium">{message.text}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="shadow-lg border-l-4 border-l-blue-500">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="h-5 w-5 text-white" />
                </div>
                Personal Information
              </CardTitle>
              <CardDescription className="text-base">
                Basic information about the user
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    className="h-12 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    className="h-12 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="user@epol.com"
                    className="h-12 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="h-12 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-green-500">
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                Account Settings
              </CardTitle>
              <CardDescription className="text-base">
                Configure role, department, and account status
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Role *
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className="h-12 focus:ring-green-500">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Team Leader">Team Leader</SelectItem>
                      <SelectItem value="EPOL">EPOL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Department
                  </Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    placeholder="Enter department"
                    className="h-12 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Account Status *
                  </Label>
                  <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                    <SelectTrigger className="h-12 focus:ring-green-500">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-l-4 border-l-orange-500">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 rounded-full bg-orange-600 flex items-center justify-center">
                  <Settings className="h-5 w-5 text-white" />
                </div>
                Additional Information
              </CardTitle>
              <CardDescription className="text-base">
                Optional notes or additional information about the user
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
                  Notes
                </Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes about this user account..."
                  rows={4}
                  className="focus:ring-orange-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-between pt-8">
            <div className="text-sm text-gray-500">
              Last updated: {new Date().toLocaleDateString()}
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/accounts/${userId}`}>
                <Button type="button" variant="outline" className="hover:bg-gray-50 transition-colors">
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={saving}
                className="bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating Account...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
