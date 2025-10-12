"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Save, AlertCircle, Shield, Key, Eye, EyeOff, Lock, Phone, User, Calendar, Check, X, Loader2, MapPin, UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthday: string;
  homeAddress: string;
  role: string;
  username: string;
  password: string;
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
    phone: '',
    gender: '',
    birthday: '',
    homeAddress: '',
    role: '',
    username: '',
    password: '',
    notes: ''
  });

  // Auto-generate password function
  const generatePassword = () => {
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    let password = '';
    
    // Ensure at least one character from each category
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += specialChars[Math.floor(Math.random() * specialChars.length)];
    
    // Fill the rest randomly
    const allChars = uppercase + lowercase + numbers + specialChars;
    for (let i = 4; i < 12; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  };

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isPasswordGenerated, setIsPasswordGenerated] = useState(false);
  const [calculatedAge, setCalculatedAge] = useState<number | null>(null);

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 1;
    return strength;
  };

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

  const handleGeneratePassword = () => {
    let newPassword;
    let strength;
    
    // Keep generating until we get a very strong password (5/5)
    do {
      newPassword = generatePassword();
      strength = calculatePasswordStrength(newPassword);
    } while (strength < 5);
    
    setFormData(prev => ({
      ...prev,
      password: newPassword
    }));
    setPasswordStrength(strength);
    setIsPasswordGenerated(true);
  };


  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    // Special handling for phone number to allow only digits and limit to 11 digits
    if (field === 'phone' && typeof value === 'string') {
      // Remove any non-digit characters and limit to 11 digits
      const numericValue = value.replace(/\D/g, '').slice(0, 11);
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
          
          // Calculate age when birthday changes
          if (field === 'birthday' && typeof value === 'string') {
            const age = calculateAgeFromBirthday(value);
            setCalculatedAge(age);
          }
    
    // Calculate password strength
    if (field === 'password' && typeof value === 'string') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    
    // Clear errors when user starts typing
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
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.birthday) newErrors.birthday = 'Birthday is required';
    if (!formData.homeAddress.trim()) newErrors.homeAddress = 'Home address is required';
    if (!formData.role) newErrors.role = 'Role is required';
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';

      // Username validation
      if (formData.username) {
        const usernameRegex = /^[a-zA-Z0-9]+$/;
        if (!usernameRegex.test(formData.username)) {
          newErrors.username = 'Username can only contain letters and numbers';
        } else if (formData.username.length < 5) {
          newErrors.username = 'Username must be at least 5 characters long';
        } else if (formData.username.length > 12) {
          newErrors.username = 'Username must be no more than 12 characters long';
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

    // Phone validation - exactly 11 digits
    const phoneDigits = formData.phone.replace(/[\s\-\(\)]/g, '');
    if (formData.phone && (!/^\d{11}$/.test(phoneDigits) || phoneDigits.length !== 11)) {
      newErrors.phone = 'Phone number must be exactly 11 digits';
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
        const age = calculateAgeFromBirthday(formData.birthday);
        if (age !== null && (age < 18 || age > 100)) {
          newErrors.birthday = 'Age must be between 18 and 100 years old';
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



  const renderFormField = (
    field: keyof FormData,
    label: string,
    icon: React.ReactNode,
    type: string = 'text',
    placeholder: string = '',
    required: boolean = false,
    options?: { value: string; label: string }[],
    helperText?: string,
    maxLength?: number
  ) => {
    const error = errors[field];
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
              maxLength={maxLength}
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
        phone: formData.phone,
        age: calculatedAge || 0,
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
                <h1 className="text-4xl font-bold text-gray-900 mb-2">Add New Employee</h1>
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
          {/* Complete Employee Information */}
          <Card className="shadow-xl border-l-4 border-l-blue-500 hover:shadow-2xl transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="h-12 w-12 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Employee Information</h2>
                  <p className="text-sm text-blue-700 font-medium">Complete information for the new employee account</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              {/* Personal Information Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Personal Information</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('firstName', 'First Name', <User className="h-4 w-4" />, 'text', 'Enter first name', true)}
                  {renderFormField('lastName', 'Last Name', <User className="h-4 w-4" />, 'text', 'Enter last name', true)}
                </div>
                  
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('phone', 'Phone Number', <Phone className="h-4 w-4" />, 'tel', '+63 123 456 7890', true, undefined, 'Enter 11 digits only', 11)}
                  {renderFormField('gender', 'Gender', <User className="h-4 w-4" />, 'select', 'Select gender', true, [
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' }
                  ])}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderFormField('birthday', 'Birthday', <Calendar className="h-4 w-4" />, 'date', '', true, undefined)}
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
                  {renderFormField('homeAddress', 'Home Address', <MapPin className="h-4 w-4" />, 'text', 'Enter home address', true, undefined)}
                </div>
              </div>

              {/* Account Settings Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Account Settings</h3>
                </div>
                
                <div className="max-w-md">
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
              </div>

              {/* Security Settings Section */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-200">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Key className="h-4 w-4 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Security Settings</h3>
                </div>
                
                {/* Username Field */}
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
                  
                  {errors.username && (
                    <div className="flex items-center gap-2 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
                      <AlertCircle className="h-4 w-4" />
                      <span>{errors.username}</span>
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    5-12 characters long, can contain letters and numbers
                  </p>
                </div>

                {/* Password Field */}
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
                      className={`h-12 pr-20 ${errors.password ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'focus:ring-red-500'} ${isPasswordGenerated ? 'bg-green-50 border-green-300' : ''}`}
                      placeholder="Auto-generated password will appear here"
                      readOnly={isPasswordGenerated}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <Button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 h-8"
                      >
                        Generate
                      </Button>
                    </div>
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
                    {isPasswordGenerated 
                      ? "Password auto-generated with secure characters. Employee will need to change this on first login."
                      : "Click 'Generate' to create a secure password automatically"
                    }
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                <Link href="/dashboard/accounts">
                  <Button 
                    type="button" 
                    className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </Link>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 px-8"
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
              </div>
            </CardContent>
          </Card>
          
        </form>
      </div>
    </div>
  );
}
