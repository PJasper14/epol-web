"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, UserPlus, Save, AlertCircle, CheckCircle, Shield, Key, Eye, EyeOff, Lock, Mail, Phone, User, Calendar, Check, X, Loader2, Sparkles, Building, MapPin, Clock, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  birthday: string;
  homeAddress: string;
  role: string;
  username: string;
  password: string;
  confirmPassword: string;
  sendWelcomeEmail: boolean;
  notes: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CreateUserAccountPage() {
  const { addUser } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    age: '',
    gender: '',
    birthday: '',
    homeAddress: '',
    role: '',
    username: '',
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [usernameStrength, setUsernameStrength] = useState(0);
  const totalSteps = 3;

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    return strength;
  };

  const calculateUsernameStrength = (username: string) => {
    let strength = 0;
    if (username.length >= 8) strength += 1;
    if (/[A-Z]/.test(username)) strength += 1;
    if (/[a-z]/.test(username)) strength += 1;
    if (/\d/.test(username)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(username)) strength += 1;
    return strength;
  };

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    // Special handling for phone number to allow only digits
    if (field === 'phone' && typeof value === 'string') {
      // Remove any non-digit characters
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [field]: numericValue
      }));
    } else if (field === 'age' && typeof value === 'string') {
      // Allow only numbers for age
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [field]: numericValue
      }));
    } else if (field === 'homeAddress' && typeof value === 'string') {
      // Allow only letters, numbers, and spaces for home address
      const cleanValue = value.replace(/[^a-zA-Z0-9\s]/g, '');
      setFormData(prev => ({
        ...prev,
        [field]: cleanValue
      }));
    } else if (field === 'username' && typeof value === 'string') {
      // Allow only alphanumeric and underscores for username
      const cleanValue = value.replace(/[^a-zA-Z0-9_.!@#$%^&*]/g, '');
      setFormData(prev => ({
        ...prev,
        [field]: cleanValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Calculate password strength
    if (field === 'password' && typeof value === 'string') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    // Calculate username strength
    if (field === 'username' && typeof value === 'string') {
      setUsernameStrength(calculateUsernameStrength(value));
    }
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
    // Clear submit status when user starts typing
    if (submitStatus === 'error') {
      setSubmitStatus('idle');
    }
    
    // Mark form as having changes
    setHasChanges(true);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.age.trim()) newErrors.age = 'Age is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.birthday.trim()) newErrors.birthday = 'Birthday is required';
    if (!formData.homeAddress.trim()) newErrors.homeAddress = 'Home address is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Username validation
    if (formData.username) {
      const usernameRegex = /^[a-zA-Z0-9_.!@#$%^&*]+$/;
      if (!usernameRegex.test(formData.username)) {
        newErrors.username = 'Username can only contain letters, numbers, and special characters';
      } else if (formData.username.length < 8) {
        newErrors.username = 'Username must be at least 8 characters long';
      } else if (formData.username.length > 14) {
        newErrors.username = 'Username must be no more than 14 characters long';
      } else {
        // Check for required character types
        const hasUpperCase = /[A-Z]/.test(formData.username);
        const hasLowerCase = /[a-z]/.test(formData.username);
        const hasNumber = /\d/.test(formData.username);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.username);
        
        if (!hasUpperCase) {
          newErrors.username = 'Username must contain at least one uppercase letter';
        } else if (!hasLowerCase) {
          newErrors.username = 'Username must contain at least one lowercase letter';
        } else if (!hasNumber) {
          newErrors.username = 'Username must contain at least one number';
        } else if (!hasSpecialChar) {
          newErrors.username = 'Username must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
        }
      }
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

    // Age validation - must be a valid number between 18 and 100
    if (formData.age) {
      const age = parseInt(formData.age);
      if (isNaN(age) || age < 18 || age > 100) {
        newErrors.age = 'Age must be between 18 and 100';
      }
    }

    // Birthday validation - must be a valid date and not in the future
    if (formData.birthday) {
      const birthdayDate = new Date(formData.birthday);
      const today = new Date();
      if (isNaN(birthdayDate.getTime())) {
        newErrors.birthday = 'Please enter a valid date';
      } else if (birthdayDate > today) {
        newErrors.birthday = 'Birthday cannot be in the future';
      } else {
        // Check if age matches birthday
        let ageFromBirthday = today.getFullYear() - birthdayDate.getFullYear();
        const monthDiff = today.getMonth() - birthdayDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdayDate.getDate())) {
          ageFromBirthday--;
        }
        if (formData.age && parseInt(formData.age) !== ageFromBirthday) {
          newErrors.birthday = 'Birthday does not match the entered age';
        }
      }
    }

    // Home address validation - must be at least 5 characters
    if (formData.homeAddress && formData.homeAddress.trim().length < 5) {
      newErrors.homeAddress = 'Home address must be at least 5 characters';
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
      if (!formData.age.trim()) newErrors.age = 'Age is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
      if (!formData.birthday.trim()) newErrors.birthday = 'Birthday is required';
      if (!formData.homeAddress.trim()) newErrors.homeAddress = 'Home address is required';
      
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

      // Age validation - must be a valid number between 18 and 100
      if (formData.age) {
        const age = parseInt(formData.age);
        if (isNaN(age) || age < 18 || age > 100) {
          newErrors.age = 'Age must be between 18 and 100';
        }
      }

      // Birthday validation - must be a valid date and not in the future
      if (formData.birthday) {
        const birthdayDate = new Date(formData.birthday);
        const today = new Date();
        if (isNaN(birthdayDate.getTime())) {
          newErrors.birthday = 'Please enter a valid date';
        } else if (birthdayDate > today) {
          newErrors.birthday = 'Birthday cannot be in the future';
        } else {
          // Check if age matches birthday
          let ageFromBirthday = today.getFullYear() - birthdayDate.getFullYear();
          const monthDiff = today.getMonth() - birthdayDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthdayDate.getDate())) {
            ageFromBirthday--;
          }
          if (formData.age && parseInt(formData.age) !== ageFromBirthday) {
            newErrors.birthday = 'Birthday does not match the entered age';
          }
        }
      }

      // Home address validation - must be at least 5 characters
      if (formData.homeAddress && formData.homeAddress.trim().length < 5) {
        newErrors.homeAddress = 'Home address must be at least 5 characters';
      }
    } else if (currentStep === 2) {
      if (!formData.role) newErrors.role = 'Role is required';
    } else if (currentStep === 3) {
      if (!formData.username.trim()) newErrors.username = 'Username is required';
      if (!formData.password) newErrors.password = 'Password is required';
      
      // Username validation
      if (formData.username) {
        const usernameRegex = /^[a-zA-Z0-9_.!@#$%^&*]+$/;
        if (!usernameRegex.test(formData.username)) {
          newErrors.username = 'Username can only contain letters, numbers, and special characters';
        } else if (formData.username.length < 8) {
          newErrors.username = 'Username must be at least 8 characters long';
        } else if (formData.username.length > 14) {
          newErrors.username = 'Username must be no more than 14 characters long';
        } else {
          // Check for required character types
          const hasUpperCase = /[A-Z]/.test(formData.username);
          const hasLowerCase = /[a-z]/.test(formData.username);
          const hasNumber = /\d/.test(formData.username);
          const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.username);
          
          if (!hasUpperCase) {
            newErrors.username = 'Username must contain at least one uppercase letter';
          } else if (!hasLowerCase) {
            newErrors.username = 'Username must contain at least one lowercase letter';
          } else if (!hasNumber) {
            newErrors.username = 'Username must contain at least one number';
          } else if (!hasSpecialChar) {
            newErrors.username = 'Username must contain at least one special character (!@#$%^&*(),.?":{}|<>)';
          }
        }
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
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      setIsTransitioning(true);
      setTimeout(() => {
      setCurrentStep(currentStep + 1);
        setIsTransitioning(false);
      }, 300);
    } else {
      setSubmitStatus('error');
    }
  };

  const handlePreviousStep = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsTransitioning(false);
    }, 300);
  };

  const renderFormField = (
    field: keyof FormData,
    label: string,
    icon: React.ReactNode,
    type: string = 'text',
    placeholder: string = '',
    required: boolean = false,
    options?: { value: string; label: string }[],
    helperText?: string
  ) => {
    const error = errors[field] || fieldErrors[field];
    const isError = !!error;
    const hasValue = !!formData[field];
    const fieldValue = typeof formData[field] === 'string' ? formData[field] : '';

    return (
      <div className="space-y-2">
        <Label htmlFor={field} className={`text-sm font-medium flex items-center gap-2 ${isError ? 'text-red-700' : 'text-gray-700'}`}>
          {icon}
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        {type === 'select' && options ? (
          <Select value={fieldValue} onValueChange={(value) => handleInputChange(field, value)}>
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
          <div className="relative">
            <Input
              id={field}
              type={type}
              value={fieldValue}
              onChange={(e) => handleInputChange(field, e.target.value)}
              placeholder={placeholder}
              className={`h-12 focus:ring-2 transition-all duration-200 ${isError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-blue-500'}`}
              required={required}
              min={type === 'number' ? '18' : undefined}
              max={type === 'number' ? '100' : type === 'date' ? new Date().toISOString().split('T')[0] : undefined}
            />
            {hasValue && !isError && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Check className="h-4 w-4 text-green-500" />
              </div>
            )}
          </div>
        )}
        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {helperText && !error && (
          <p className="text-xs text-gray-500">{helperText}</p>
        )}
      </div>
    );
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
      // Create the user via API
      console.log('Form data being submitted:', formData);
      await addUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        age: parseInt(formData.age),
        gender: formData.gender as 'Male' | 'Female',
        birthday: formData.birthday,
        homeAddress: formData.homeAddress,
        role: formData.role as 'Admin' | 'Team Leader' | 'EPOL',
        username: formData.username,
        password: formData.password
      });
      
      setSubmitStatus('success');
      
      // Redirect to accounts page after successful submission using router
      // Show success message for 1 second, then redirect
      setTimeout(() => {
        router.push('/dashboard/accounts');
      }, 1000);
      
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
          <div className="flex items-center justify-between mb-8">
            {/* Left side - Title and Description with Icon */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Create User Account</h1>
                <p className="text-gray-600 text-lg">Set up a new user account with appropriate roles and permissions</p>
              </div>
            </div>
            
            {/* Right side - Back to Accounts Button */}
            <div>
              <Link href="/dashboard/accounts">
                <Button className="bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Accounts
                </Button>
              </Link>
          </div>
          </div>
          
          {/* Enhanced Progress Indicator */}
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                    step < currentStep 
                      ? 'bg-green-500 text-white shadow-lg' 
                      : step === currentStep
                      ? 'bg-red-600 text-white shadow-xl scale-110'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step < currentStep ? <Check className="h-5 w-5" /> : step}
                  </div>
                  {step < totalSteps && (
                    <div className={`w-20 h-2 mx-3 rounded-full transition-all duration-500 ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                {currentStep === 1 ? 'Personal Information' :
                  currentStep === 2 ? 'Account Settings' :
                 'Security Settings'}
              </h3>
              <p className="text-sm text-gray-600">
                Step {currentStep} of {totalSteps} • {Math.round((currentStep / totalSteps) * 100)}% Complete
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className="bg-gradient-to-r from-red-500 to-red-600 h-2 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Success/Error Messages */}
        {submitStatus === 'success' && (
          <Card className="border-green-200 bg-gradient-to-r from-green-50 to-green-100 mb-6 shadow-lg animate-in slide-in-from-top-2 duration-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-800">
                <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">User account created successfully!</p>
                  <p className="text-sm text-green-700">Redirecting to accounts page...</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {submitStatus === 'error' && (
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-red-100 mb-6 shadow-lg animate-in slide-in-from-top-2 duration-500">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-red-800">
                <div className="h-10 w-10 rounded-full bg-red-500 flex items-center justify-center">
                  <X className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-lg">Please fix the errors below</p>
                  <p className="text-sm text-red-700">Check all required fields and try again.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <Card className={`shadow-xl border-l-4 border-l-blue-500 hover:shadow-2xl transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                    <p className="text-sm text-blue-700 font-medium">Step 1 of 3</p>
                  </div>
                </CardTitle>
                <CardDescription className="text-base text-blue-800 mt-2">
                  Basic information about the new user account
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('firstName', 'First Name', <User className="h-4 w-4" />, 'text', 'Enter first name', true)}
                  {renderFormField('lastName', 'Last Name', <User className="h-4 w-4" />, 'text', 'Enter last name', true)}
                  </div>
                  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('email', 'Email Address', <Mail className="h-4 w-4" />, 'email', 'user@epol.com', true)}
                  {renderFormField('phone', 'Phone Number', <Phone className="h-4 w-4" />, 'tel', '+63 123 456 7890', true, undefined, 'Enter 11 digits only')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('age', 'Age', <Calendar className="h-4 w-4" />, 'number', 'Enter age', true, undefined, 'Must be between 18-100')}
                  {renderFormField('gender', 'Gender', <User className="h-4 w-4" />, 'select', 'Select gender', true, [
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' }
                  ])}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('birthday', 'Birthday', <Calendar className="h-4 w-4" />, 'date', '', true, undefined)}
                  {renderFormField('homeAddress', 'Home Address', <MapPin className="h-4 w-4" />, 'text', 'Enter home address', true, undefined)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Account Settings */}
          {currentStep === 2 && (
            <Card className={`shadow-xl border-l-4 border-l-green-500 hover:shadow-2xl transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
                    <p className="text-sm text-green-700 font-medium">Step 2 of 3</p>
                  </div>
                </CardTitle>
                <CardDescription className="text-base text-green-800 mt-2">
                  Configure user role and permissions
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                <div className="max-w-md mx-auto">
                  {renderFormField('role', 'User Role', <Shield className="h-4 w-4" />, 'select', 'Select a role', true, [
                    { value: 'Admin', label: 'Admin - Full system access' },
                    { value: 'Team Leader', label: 'Team Leader - Manage team members' },
                    { value: 'EPOL', label: 'EPOL - Environmental police officer' }
                  ], 'Choose the appropriate role for this user')}
                  
                  {/* Role Description */}
                  {formData.role && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Role Description:</h4>
                      <p className="text-sm text-green-700">
                        {formData.role === 'Admin' && 'Full administrative access to all system features and user management.'}
                        {formData.role === 'Team Leader' && 'Can manage team members and oversee environmental operations.'}
                        {formData.role === 'EPOL' && 'Environmental police officer with field operation capabilities.'}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Security Settings */}
          {currentStep === 3 && (
            <Card className={`shadow-xl border-l-4 border-l-red-500 hover:shadow-2xl transition-all duration-300 ${isTransitioning ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}`}>
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center shadow-lg">
                    <Key className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Security Settings</h2>
                    <p className="text-sm text-red-700 font-medium">Step 3 of 3</p>
                  </div>
                </CardTitle>
                <CardDescription className="text-base text-red-800 mt-2">
                  Set up secure login credentials
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Username Field with Strength Indicator */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Username <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                  <Input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => handleInputChange('username', e.target.value)}
                      className={`h-12 focus:ring-2 transition-all duration-200 ${errors.username ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-red-500'}`}
                    placeholder="Enter username"
                  />
                    {formData.username && !errors.username && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Check className="h-4 w-4 text-green-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Username Strength Indicator */}
                  {formData.username && (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                          <div
                            key={level}
                            className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                              level <= usernameStrength
                                ? usernameStrength <= 2
                                  ? 'bg-red-500'
                                  : usernameStrength <= 3
                                  ? 'bg-yellow-500'
                                  : 'bg-green-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-gray-600">
                        Strength: {
                          usernameStrength <= 2 ? 'Weak' :
                          usernameStrength <= 3 ? 'Medium' :
                          usernameStrength <= 4 ? 'Strong' : 'Very Strong'
                        }
                      </p>
                    </div>
                  )}
                  
                  {errors.username && (
                    <div className="flex items-center gap-2 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.username}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    8-14 characters with uppercase, lowercase, numbers, and special characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Password Field with Strength Indicator */}
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
                        className={`h-12 pr-10 ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-red-500'}`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {formData.password && (
                      <div className="space-y-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((level) => (
                            <div
                              key={level}
                              className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                                level <= passwordStrength
                                  ? passwordStrength <= 2
                                    ? 'bg-red-500'
                                    : passwordStrength <= 3
                                    ? 'bg-yellow-500'
                                    : 'bg-green-500'
                                  : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-gray-600">
                          Strength: {
                            passwordStrength <= 2 ? 'Weak' :
                            passwordStrength <= 3 ? 'Medium' :
                            passwordStrength <= 4 ? 'Strong' : 'Very Strong'
                          }
                        </p>
                      </div>
                    )}
                    
                    {errors.password && (
                      <div className="flex items-center gap-2 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-500">
                      Must be at least 8 characters with uppercase, lowercase, numbers, and special characters
                    </p>
                  </div>
                  
                  {/* Confirm Password Field */}
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
                        className={`h-12 pr-10 ${errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-red-500'}`}
                        placeholder="Confirm password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Password Match Indicator */}
                    {formData.confirmPassword && (
                      <div className="flex items-center gap-2 text-sm">
                        {formData.password === formData.confirmPassword ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <Check className="h-4 w-4" />
                            <span>Passwords match</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-600">
                            <X className="h-4 w-4" />
                            <span>Passwords don't match</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {errors.confirmPassword && (
                      <div className="flex items-center gap-2 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
                        <AlertCircle className="h-4 w-4" />
                        <span>{errors.confirmPassword}</span>
                      </div>
                    )}
                  </div>
                </div>

              </CardContent>
            </Card>
          )}


          {/* Enhanced Navigation Buttons */}
          <div className="flex items-center justify-between pt-8">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  onClick={handlePreviousStep}
                  disabled={isTransitioning}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <Link href="/dashboard/accounts">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="hover:bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400 transition-all duration-200"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </Link>
              
              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isTransitioning}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 px-6"
                >
                  {isTransitioning ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                  Next Step
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </>
                  )}
                </Button>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isSubmitting || isTransitioning}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 px-8"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
