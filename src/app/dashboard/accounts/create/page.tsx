"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, UserPlus, Save, AlertCircle, CheckCircle, Shield, Key, Eye, EyeOff, Lock, Mail, Phone, User, Building, Calendar } from 'lucide-react';
import Link from 'next/link';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  password: string;
  confirmPassword: string;
  sendWelcomeEmail: boolean;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CreateUserAccountPage() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    password: '',
    confirmPassword: '',
    sendWelcomeEmail: true,
    notes: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    // Special handling for phone number to allow only digits
    if (field === 'phone' && typeof value === 'string') {
      // Remove any non-digit characters
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [field]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear submit status when user starts typing
    if (submitStatus === 'error') {
      setSubmitStatus('idle');
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.password) newErrors.password = 'Password is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Strong password validation
    if (formData.password) {
      const password = formData.password;
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
      const isLongEnough = password.length >= 8;
      
      if (!isLongEnough) {
        newErrors.password = 'Password must be at least 8 characters long';
      } else if (!hasUpperCase) {
        newErrors.password = 'Password must contain at least one uppercase letter';
      } else if (!hasLowerCase) {
        newErrors.password = 'Password must contain at least one lowercase letter';
      } else if (!hasNumbers) {
        newErrors.password = 'Password must contain at least one number';
      } else if (!hasSpecialChar) {
        newErrors.password = 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
      }
    }

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Phone validation - exactly 11 digits
    const phoneDigits = formData.phone.replace(/[\s\-\(\)]/g, '');
    if (formData.phone && (!/^\d{11}$/.test(phoneDigits) || phoneDigits.length !== 11)) {
      newErrors.phone = 'Phone number must be exactly 11 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCurrentStep = (): boolean => {
    const newErrors: FormErrors = {};

    if (currentStep === 1) {
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.email.trim()) newErrors.email = 'Email is required';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
      
      // Phone validation - exactly 11 digits
      const phoneDigits = formData.phone.replace(/[\s\-\(\)]/g, '');
      if (formData.phone && (!/^\d{11}$/.test(phoneDigits) || phoneDigits.length !== 11)) {
        newErrors.phone = 'Phone number must be exactly 11 digits';
      }
    } else if (currentStep === 2) {
      if (!formData.role) newErrors.role = 'Role is required';
      if (!formData.department) newErrors.department = 'Department is required';
    } else if (currentStep === 3) {
      if (!formData.password) newErrors.password = 'Password is required';
      
      // Strong password validation
      if (formData.password) {
        const password = formData.password;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
        const isLongEnough = password.length >= 8;
        
        if (!isLongEnough) {
          newErrors.password = 'Password must be at least 8 characters long';
        } else if (!hasUpperCase) {
          newErrors.password = 'Password must contain at least one uppercase letter';
        } else if (!hasLowerCase) {
          newErrors.password = 'Password must contain at least one lowercase letter';
        } else if (!hasNumbers) {
          newErrors.password = 'Password must contain at least one number';
        } else if (!hasSpecialChar) {
          newErrors.password = 'Password must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
        }
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep(currentStep + 1);
    } else {
      setSubmitStatus('error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Here you would make the actual API call to create the user
      console.log('Creating user account:', formData);
      
      setSubmitStatus('success');
      
      // Redirect to accounts page after successful submission
      setTimeout(() => {
        window.location.href = '/dashboard/accounts';
      }, 2000);
      
    } catch (error) {
      console.error('Error creating user account:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link href="/dashboard/accounts">
              <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-200 shadow-sm hover:shadow-md">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Accounts
              </Button>
            </Link>
          </div>
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Create User Account</h1>
            <p className="text-gray-600 text-lg">Set up a new user account with appropriate roles and permissions</p>
          </div>
          
          {/* Progress Indicator */}
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep 
                      ? 'bg-red-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step}
                  </div>
                  {step < totalSteps && (
                    <div className={`w-16 h-1 mx-2 ${
                      step < currentStep ? 'bg-red-600' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps}: {
                  currentStep === 1 ? 'Personal Information' :
                  currentStep === 2 ? 'Account Settings' :
                  'Security Settings'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Success/Error Messages */}
        {submitStatus === 'success' && (
          <Card className="border-green-200 bg-green-50 mb-6 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">User account created successfully!</span>
              </div>
            </CardContent>
          </Card>
        )}

        {submitStatus === 'error' && (
          <Card className="border-red-200 bg-red-50 mb-6 shadow-md">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Please fill all the fields and try again.</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <Card className="shadow-lg border-l-4 border-l-blue-500">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  Personal Information
                </CardTitle>
                <CardDescription className="text-base">
                  Basic information about the new user account
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`h-12 ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      placeholder="Enter first name"
                    />
                    {errors.firstName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.firstName}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`h-12 ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      placeholder="Enter last name"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email Address <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`h-12 ${errors.email ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      placeholder="user@epol.com"
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`h-12 ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                      placeholder="+63 123 456 7890"
                      maxLength={11}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Account Settings */}
          {currentStep === 2 && (
            <Card className="shadow-lg border-l-4 border-l-green-500">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 rounded-full bg-green-600 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  Account Settings
                </CardTitle>
                <CardDescription className="text-base">
                  Configure role and department permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Role <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                      <SelectTrigger className={`h-12 ${errors.role ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'}`}>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="Admin" className="hover:bg-gray-50">Admin</SelectItem>
                        <SelectItem value="Team Leader" className="hover:bg-gray-50">Team Leader</SelectItem>
                        <SelectItem value="EPOL" className="hover:bg-gray-50">EPOL</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.role && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.role}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Department <span className="text-red-500">*</span>
                    </Label>
                    <Select value={formData.department} onValueChange={(value) => handleInputChange('department', value)}>
                      <SelectTrigger className={`h-12 ${errors.department ? 'border-red-500 focus:ring-red-500' : 'focus:ring-green-500'}`}>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg">
                        <SelectItem value="Office" className="hover:bg-gray-50">Office</SelectItem>
                        <SelectItem value="Field" className="hover:bg-gray-50">Field</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.department && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.department}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Security Settings */}
          {currentStep === 3 && (
            <Card className="shadow-lg border-l-4 border-l-red-500">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  Security Settings
                </CardTitle>
                <CardDescription className="text-base">
                  Set up password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className={`h-12 pr-10 ${errors.password ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'}`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.password}
                      </p>
                    )}
                    <p className="text-xs text-gray-500">
                      Must be at least 8 characters with uppercase, lowercase, numbers, and special characters
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className={`h-12 pr-10 ${errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'focus:ring-red-500'}`}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          )}


          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-8">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Previous
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/accounts">
                <Button type="button" variant="outline" className="hover:bg-gray-50">
                  Cancel
                </Button>
              </Link>
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Next Step
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
