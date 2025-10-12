"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ArrowLeft, 
  Trash2, 
  AlertTriangle, 
  User, 
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  X,
  Calendar,
  Clock,
  Activity,
  Phone,
  Building,
  Copy,
  Zap
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';


export default function DeleteUserAccountPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  const { getUserById, deleteUser } = useUser();
  
  const [userDetails, setUserDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const expectedConfirmation = 'DELETE';

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Find user by ID from context
        const user = getUserById(userId);
        if (user) {
          setUserDetails(user);
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

    if (userId) {
      fetchUserDetails();
    }
  }, [userId, getUserById]);

  const handleDelete = async () => {
    if (confirmationText !== expectedConfirmation) {
      setMessage({ type: 'error', text: 'Please type DELETE to confirm' });
      return;
    }

    setDeleting(true);
    setMessage(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Delete the user from context
      deleteUser(userId);
      
      setMessage({ type: 'success', text: 'User account deleted successfully!' });
      
      // Redirect to accounts list after successful deletion
      setTimeout(() => {
        router.push('/dashboard/accounts');
      }, 2000);
      
    } catch (error) {
      console.error('Error deleting user account:', error);
      setMessage({ type: 'error', text: 'Failed to delete user account' });
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmationChange = (value: string) => {
    setConfirmationText(value);
    setMessage(null);
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

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <Card className="border-red-200 bg-red-50 shadow-lg max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <X className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">User Not Found</h3>
                <p className="text-red-600 text-sm">The user account you're looking for doesn't exist or has been removed.</p>
              </div>
              <Link href="/dashboard/accounts">
                <Button className="bg-red-600 hover:bg-red-700 text-white">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Accounts
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center shadow-lg">
                <Trash2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Delete User Account</h1>
                <p className="text-gray-600 text-lg">Permanently remove this user account from the system</p>
              </div>
            </div>
            <Link href="/dashboard/accounts">
              <Button className="bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-3 group">
                <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                Back to Accounts
              </Button>
            </Link>
          </div>
        </div>

        {/* Warning Message */}
        <Card className="border-l-4 border-l-red-500 border-red-200 bg-red-50 mb-8 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-800 text-lg mb-3">⚠️ Warning: This action cannot be undone</h3>
                <p className="text-red-700 text-base mb-4">
                  Deleting this user account will permanently remove all user data, including:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span className="text-sm">User profile and personal information</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-700">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <span className="text-sm">Login credentials and access permissions</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Details */}
        <Card className="mb-8 shadow-xl border-l-4 border-l-blue-500 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                <User className="h-5 w-5 text-white" />
              </div>
              Account to be Deleted
            </CardTitle>
            <CardDescription className="text-blue-700">
              Review the user information before proceeding with deletion
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Personal and Contact Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Personal & Contact Information</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      FIRST NAME
                    </Label>
                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <p className="font-bold text-gray-900">{userDetails.firstName}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      LAST NAME
                    </Label>
                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <p className="font-bold text-gray-900">{userDetails.lastName}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      AGE
                    </Label>
                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <p className="font-bold text-gray-900">{userDetails.age} years old</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      GENDER
                    </Label>
                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <p className="font-bold text-gray-900">{userDetails.gender}</p>
                    </div>
                  </div>


                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      USERNAME
                    </Label>
                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <p className="font-bold text-gray-900">{userDetails.username}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      PHONE NUMBER
                    </Label>
                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <p className="font-bold text-gray-900">{userDetails.phone}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      BIRTHDAY
                    </Label>
                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <p className="font-bold text-gray-900">
                        {new Date(userDetails.birthday).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      HOME ADDRESS
                    </Label>
                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <p className="font-bold text-gray-900">{userDetails.homeAddress}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Account Information */}
              <div className="space-y-6">
                <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2">Account Information</h4>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      USER ID
                    </Label>
                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm relative">
                      <p className="font-bold text-gray-900">{userDetails.id}</p>
                      <button className="absolute top-2 right-2 p-1 hover:bg-gray-100 rounded">
                        <Copy className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      USER ROLE
                    </Label>
                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <p className="font-bold text-gray-900">{userDetails.role}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      CREATED DATE
                    </Label>
                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <p className="font-bold text-gray-900">
                        {new Date(userDetails.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      LAST UPDATED
                    </Label>
                    <div className="px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm">
                      <p className="font-bold text-gray-900">
                        {new Date(userDetails.lastUpdated).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Confirmation */}
        <Card className="mb-8 shadow-xl border-l-4 border-l-amber-500 hover:shadow-2xl transition-all duration-300">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 border-b border-amber-200">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-amber-600 to-amber-700 flex items-center justify-center shadow-lg">
                <AlertTriangle className="h-5 w-5 text-white" />
              </div>
              Confirm Deletion
            </CardTitle>
            <CardDescription className="text-amber-700">
              To confirm deletion, type <strong className="font-bold">DELETE</strong> in the field below
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="space-y-3">
              <Label htmlFor="confirmation" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Type DELETE to confirm
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => handleConfirmationChange(e.target.value)}
                placeholder="Type DELETE here"
                className={`h-12 text-lg font-mono focus:ring-2 transition-all duration-200 ${
                  confirmationText && confirmationText !== expectedConfirmation
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : confirmationText === expectedConfirmation
                    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
                    : 'focus:ring-amber-500'
                }`}
              />
              {confirmationText && confirmationText !== expectedConfirmation && (
                <div className="flex items-center gap-2 text-red-600 text-sm animate-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="h-4 w-4" />
                  <span>Please type exactly "DELETE" to confirm</span>
                </div>
              )}
              {confirmationText === expectedConfirmation && (
                <div className="flex items-center gap-2 text-green-600 text-sm animate-in slide-in-from-top-1 duration-200">
                  <CheckCircle className="h-4 w-4" />
                  <span>Confirmation text matches. You can now proceed with deletion.</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Success/Error Messages */}
        {message && (
          <Card className={`mb-8 shadow-lg border-l-4 ${message.type === 'success' ? 'border-l-green-500 border-green-200 bg-green-50' : 'border-l-red-500 border-red-200 bg-red-50'} animate-in slide-in-from-top-2 duration-300`}>
            <CardContent className="pt-6">
              <div className={`flex items-center gap-3 ${message.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${message.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                  {message.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
                </div>
                <div>
                  <span className="font-medium text-base">{message.text}</span>
                  {message.type === 'success' && (
                    <p className="text-sm text-green-600 mt-1">You will be redirected to the accounts list shortly.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <Card className="shadow-lg border border-gray-200 bg-gradient-to-r from-gray-50 to-white">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500"></div>
                  <span>This action is permanent and cannot be undone</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link href={`/dashboard/accounts/${userId}`}>
                  <Button 
                    variant="outline" 
                    className="hover:bg-gray-50 transition-all duration-200 border-gray-300 hover:border-gray-400"
                    disabled={deleting}
                  >
                    Cancel
                  </Button>
                </Link>
                <Button 
                  onClick={handleDelete}
                  disabled={deleting || confirmationText !== expectedConfirmation}
                  className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Deleting Account...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
