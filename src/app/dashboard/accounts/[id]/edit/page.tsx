"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, AlertCircle, CheckCircle, User, Phone, Shield, Building, Calendar, Settings, Eye, EyeOff, Loader2, Sparkles, Edit3 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthday: string;
  homeAddress: string;
  role: string;
}

interface FieldError {
  field: string;
  message: string;
}


export default function EditUserAccountPage() {
  const params = useParams();
  const userId = params?.id as string;
  const { getUserById, updateUser } = useUser();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    birthday: '',
    homeAddress: '',
    role: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([]);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState<FormData | null>(null);

  const calculateAgeFromBirthday = (birthday: string) => {
    if (!birthday) return null;
    const today = new Date();
    const birthDate = new Date(birthday);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find user by ID
        const user = getUserById(userId);
        if (user) {
          // Convert birthday to YYYY-MM-DD format for date input
          const birthdayDate = user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '';
          
          const userData = {
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            gender: user.gender,
            birthday: birthdayDate,
            homeAddress: user.homeAddress,
            role: user.role
          };
          setFormData(userData);
          setInitialData(userData);
          
          // Calculate age from birthday
          const age = calculateAgeFromBirthday(birthdayDate);
          setCalculatedAge(age);
        } else {
          setMessage({ type: 'error', text: 'User not found' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to fetch user details' });
        console.error('Error fetching user details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, getUserById]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    // Clear field errors when user starts typing
    setFieldErrors(prev => prev.filter(error => error.field !== field));
    setMessage(null);

    // Input validation for specific fields
    if (field === 'phone' && value && !/^\d+$/.test(value.replace(/\D/g, ''))) {
      return; // Only allow digits for phone
    }
    if (field === 'homeAddress' && value && !/^[a-zA-Z0-9\s,.-]+$/.test(value)) {
      return; // Only allow alphanumeric, spaces, commas, periods, and hyphens for home address
    }
    
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Check if there are changes
      if (initialData) {
        const hasFormChanges = Object.keys(newData).some(key => 
          newData[key as keyof FormData] !== initialData[key as keyof FormData]
        );
        setHasChanges(hasFormChanges);
      }
      
      return newData;
    });
    
    // Calculate age when birthday changes
    if (field === 'birthday') {
      const age = calculateAgeFromBirthday(value);
      setCalculatedAge(age);
    }
  };

  const validateForm = () => {
    const errors: FieldError[] = [];
    const requiredFields = ['firstName', 'lastName', 'gender', 'birthday', 'homeAddress', 'role'];
    
    // Check required fields
    requiredFields.forEach(field => {
      if (!formData[field as keyof FormData]) {
        errors.push({ field, message: `${field.charAt(0).toUpperCase() + field.slice(1)} is required` });
      }
    });


    // Validate birthday and calculate age
    if (formData.birthday) {
      const birthday = new Date(formData.birthday);
      const today = new Date();
      if (birthday >= today) {
        errors.push({ field: 'birthday', message: 'Birthday cannot be in the future' });
      } else {
        const age = calculateAgeFromBirthday(formData.birthday);
        if (age !== null && (age < 18 || age > 100)) {
          errors.push({ field: 'birthday', message: 'Age must be between 18 and 100 years old' });
        }
      }
    }

    // Validate home address length
    if (formData.homeAddress && formData.homeAddress.length < 5) {
      errors.push({ field: 'homeAddress', message: 'Home address must be at least 5 characters long' });
    }

    // Validate phone format
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      errors.push({ field: 'phone', message: 'Please enter a valid phone number' });
    }

    setFieldErrors(errors);
    
    if (errors.length > 0) {
      setMessage({ type: 'error', text: 'Please fix the errors below' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setFieldErrors([]);
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update the user in the context
      updateUser(userId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        age: calculatedAge || 0,
        gender: formData.gender as 'Male' | 'Female',
        birthday: formData.birthday,
        homeAddress: formData.homeAddress,
        role: formData.role as 'Admin' | 'Team Leader' | 'EPOL'
      });
      
      setMessage({ type: 'success', text: 'User account updated successfully!' });
      setHasChanges(false);
      
    } catch (error) {
      console.error('Error updating user account:', error);
      setMessage({ type: 'error', text: 'Failed to update user account' });
    } finally {
      setSaving(false);
    }
  };

  const getFieldError = (field: string) => {
    return fieldErrors.find(error => error.field === field);
  };

  const renderFormField = (
    field: keyof FormData,
    label: string,
    icon: React.ReactNode,
    type: string = 'text',
    placeholder: string = '',
    required: boolean = false,
    options?: { value: string; label: string }[]
  ) => {
    const error = getFieldError(field);
    const isError = !!error;

    return (
      <div className="space-y-2">
        <Label htmlFor={field} className={`text-sm font-medium flex items-center gap-2 ${isError ? 'text-red-700' : 'text-gray-700'}`}>
          {icon}
          {label}
        </Label>
        {type === 'select' && options ? (
          <Select value={formData[field]} onValueChange={(value) => handleInputChange(field, value)}>
            <SelectTrigger className={`h-12 focus:ring-2 transition-all duration-200 ${isError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500'}`}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent className="bg-white shadow-lg">
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value} className="hover:bg-gray-50">
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={field}
            type={type}
            value={formData[field]}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={placeholder}
            className={`h-12 focus:ring-2 transition-all duration-200 ${isError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500'}`}
            required={required}
            min={type === 'number' ? '18' : type === 'date' ? undefined : undefined}
            max={type === 'number' ? '100' : type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
          />
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-4 w-4" />
            <span>{error.message}</span>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-red-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-red-600 animate-pulse" />
            </div>
          </div>
          <h3 className="mt-6 text-lg font-medium text-gray-900">Loading user details...</h3>
          <p className="mt-2 text-sm text-gray-500">Please wait while we fetch the information</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <Edit3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Edit User Account</h1>
                <p className="text-gray-600 text-lg">Update user information and account settings</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {hasChanges && (
                <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                  <Edit3 className="h-4 w-4 text-amber-600" />
                  <span className="text-sm font-medium text-amber-800">Unsaved changes</span>
                </div>
              )}
              <Link href={`/dashboard/accounts/${userId}`}>
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-3 group">
                  <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                  Back to Account Details
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <Card className={`mb-6 shadow-lg border-l-4 ${message.type === 'success' ? 'border-l-green-500 border-green-200 bg-green-50' : 'border-l-red-500 border-red-200 bg-red-50'} animate-in slide-in-from-top-2 duration-300`}>
            <CardContent className="pt-6">
              <div className={`flex items-center gap-3 ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                </div>
                <div>
                  <span className="font-medium text-base">{message.text}</span>
                  {message.type === 'success' && (
                    <p className="text-sm text-green-600 mt-1">Your changes have been saved successfully.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="shadow-xl border-l-4 border-l-blue-500 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                Personal Information
              </CardTitle>
              <CardDescription className="text-base text-blue-700">
                Basic information about the user
              </CardDescription>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField('firstName', 'First Name', <User className="h-4 w-4" />, 'text', 'Enter first name', true)}
                {renderFormField('lastName', 'Last Name', <User className="h-4 w-4" />, 'text', 'Enter last name', true)}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField('phone', 'Phone Number', <Phone className="h-4 w-4" />, 'tel', '+63 123 456 7890', true)}
                {renderFormField('gender', 'Gender', <User className="h-4 w-4" />, 'select', 'Select gender', true, [
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' }
                ])}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderFormField('birthday', 'Birthday', <Calendar className="h-4 w-4" />, 'date', '', true)}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Age
                  </Label>
                  <div className="h-12 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                    <span className="text-gray-900 font-medium">
                      {calculatedAge !== null ? `${calculatedAge} years old` : 'Enter birthday'}
                    </span>
                  </div>
                  {calculatedAge !== null && (calculatedAge < 18 || calculatedAge > 100) && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>Age must be between 18 and 100 years old</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {renderFormField('homeAddress', 'Home Address', <Building className="h-4 w-4" />, 'text', '123 Main Street, City, State 12345', true)}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center shadow-lg">
                    <Settings className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Account Settings</h3>
                </div>
                <div className="max-w-md">
                  {renderFormField('role', 'User Role', <Shield className="h-4 w-4" />, 'select', 'Select a role', true, [
                    { value: 'Admin', label: 'Admin' },
                    { value: 'Team Leader', label: 'Team Leader' },
                    { value: 'EPOL', label: 'EPOL' }
                  ])}
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Form Actions */}
          <Card className="shadow-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-white">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    <span>Last updated: {new Date().toLocaleDateString()}</span>
                  </div>
                  {hasChanges && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse"></div>
                      <span className="font-medium">Unsaved changes</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Link href={`/dashboard/accounts/${userId}`}>
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="hover:bg-gray-50 transition-all duration-200 border-gray-300 hover:border-gray-400"
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                  </Link>
                  <Button 
                    type="submit" 
                    disabled={saving || !hasChanges}
                    className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
