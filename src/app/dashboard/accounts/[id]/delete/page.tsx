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
  Mail, 
  Shield,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  department: string;
  status: string;
  createdAt: string;
  lastLogin: string;
}

const mockUserDetails: UserDetails = {
  id: '1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@epol.com',
  role: 'Admin',
  department: 'Operations',
  status: 'Active',
  createdAt: '2024-01-01',
  lastLogin: '2024-01-15 10:30:00'
};

export default function DeleteUserAccountPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id as string;
  
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const expectedConfirmation = 'DELETE';

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Here you would make the actual API call to fetch user details
        setUserDetails(mockUserDetails);
      } catch (err) {
        setMessage({ type: 'error', text: 'Failed to fetch user details' });
        console.error('Error fetching user details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId]);

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
      
      // Here you would make the actual API call to delete the user
      console.log('Deleting user account:', userId);
      
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">User not found</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href={`/dashboard/accounts/${userId}`}>
              <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Account Details
              </Button>
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Delete User Account</h1>
            <p className="text-gray-600">Permanently remove this user account from the system</p>
          </div>
        </div>

        {/* Warning Message */}
        <Card className="border-red-200 bg-red-50 mb-6 shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-red-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-800 mb-2">Warning: This action cannot be undone</h3>
                <p className="text-red-700 text-sm">
                  Deleting this user account will permanently remove all user data, including:
                </p>
                <ul className="text-red-700 text-sm mt-2 list-disc list-inside">
                  <li>User profile and personal information</li>
                  <li>Login credentials and access permissions</li>
                  <li>Associated records and activity logs</li>
                  <li>All user-generated content</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* User Details */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              Account to be Deleted
            </CardTitle>
          </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Full Name</Label>
              <p className="text-lg font-medium">{userDetails.firstName} {userDetails.lastName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Mail className="h-4 w-4" />
                Email Address
              </Label>
              <p className="text-lg">{userDetails.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                <Shield className="h-4 w-4" />
                Role
              </Label>
              <p className="text-lg">{userDetails.role}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Department</Label>
              <p className="text-lg">{userDetails.department}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Account Status</Label>
              <p className="text-lg">{userDetails.status}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Last Login</Label>
              <p className="text-lg">{new Date(userDetails.lastLogin).toLocaleString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

        {/* Confirmation */}
        <Card className="mb-6 shadow-md">
          <CardHeader>
            <CardTitle>Confirm Deletion</CardTitle>
            <CardDescription>
              To confirm deletion, type <strong>DELETE</strong> in the field below
            </CardDescription>
          </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="confirmation">Type DELETE to confirm</Label>
            <Input
              id="confirmation"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              placeholder="Type DELETE here"
              className="mt-1"
            />
          </div>
        </CardContent>
      </Card>

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

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 pt-6">
          <Link href={`/dashboard/accounts/${userId}`}>
            <Button variant="outline" className="hover:bg-gray-50">
              Cancel
            </Button>
          </Link>
          <Button 
            onClick={handleDelete}
            disabled={deleting || confirmationText !== expectedConfirmation}
            className="bg-red-600 hover:bg-red-700 shadow-md hover:shadow-lg transition-shadow"
          >
            {deleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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
    </div>
  );
}
