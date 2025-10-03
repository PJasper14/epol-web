"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import Image from "next/image";
import { useAdmin } from "@/contexts/AdminContext";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Clock, Users, Key, Package, Shield } from "lucide-react";

export default function LoginPage() {
  const { login, loading, isAuthenticated } = useAdmin();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50 p-4 sm:p-6 md:p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    const success = await login(username, password);
    if (success) {
      router.push('/dashboard');
    } else {
      setError('Invalid username or password');
    }
  };


  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
        style={{
          backgroundImage: 'url("/images/Epol_BG_Login.jpg")'
        }}
      ></div>
      <div className="w-full max-w-4xl mx-auto relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex min-h-[600px]">
          {/* Left Panel - Login Form */}
          <div className="flex-1 p-12 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="flex items-center justify-center gap-6 mb-6">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center mb-2">
                      <Image 
                        src="/images/EPOL LOGO.jpg" 
                        alt="EPOL Logo" 
                        width={60} 
                        height={60}
                        className="object-contain rounded-full"
                        priority
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">EPOL</span>
                  </div>
                  <div className="w-px h-16 bg-gray-300"></div>
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 bg-white rounded-full shadow-lg border border-gray-100 flex items-center justify-center mb-2">
                      <Image 
                        src="/images/CABUYAO LOGO.jpg" 
                        alt="Cabuyao Logo" 
                        width={60} 
                        height={60}
                        className="object-contain rounded-full"
                        priority
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">CABUYAO</span>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Log in to access the EPOL Admin Panel
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <span className="text-sm font-medium">{error}</span>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <Input 
                      id="username" 
                      type="text"
                      placeholder="Username" 
                      className="w-full h-12 pl-12 border-gray-300 focus:border-red-500 focus:ring-red-500/20 rounded-lg transition-colors duration-200" 
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required 
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"}
                      placeholder="Password" 
                      className="w-full h-12 pl-12 pr-12 border-gray-300 focus:border-red-500 focus:ring-red-500/20 rounded-lg transition-colors duration-200" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-4 flex items-center hover:bg-gray-50 rounded-r-lg transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                      ) : (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors duration-200" />
                      )}
                    </button>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span className="font-medium">Signing in...</span>
                    </div>
                  ) : (
                    <span className="font-semibold">SIGN IN</span>
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Right Panel - Features */}
          <div className="flex-1 bg-red-700 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="w-full h-full" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundRepeat: 'repeat'
              }}></div>
            </div>
            
            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center text-white p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-2">EPOL Admin</h2>
                <p className="text-red-100 text-sm">Environmental Police System</p>
              </div>
              
              {/* Main Modules Grid */}
              <div className="grid grid-cols-2 gap-6 max-w-sm">
                {/* Attendance Records */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
                    <Clock className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-red-100 text-xs font-medium">Attendance Records</span>
                </div>
                
                {/* Employee Management */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-red-100 text-xs font-medium">Employee Management</span>
                </div>
                
                {/* Account Management */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
                    <Key className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-red-100 text-xs font-medium">Account Management</span>
                </div>
                
                {/* Inventory Management */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
                    <Package className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-red-100 text-xs font-medium">Inventory Management</span>
                </div>
                
                {/* Safeguarding Records */}
                <div className="flex flex-col items-center text-center col-span-2">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3 backdrop-blur-sm">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <span className="text-red-100 text-xs font-medium">Safeguarding Records</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}