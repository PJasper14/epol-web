"use client";

import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, ShieldAlert, Boxes, Activity, ArrowRight, TrendingUp, TrendingDown, Clock, Users, UserPlus, Settings, Key, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAdmin } from "@/contexts/AdminContext";
import { usePasswordReset } from "@/contexts/PasswordResetContext";
import { useReassignmentRequest } from "@/contexts/ReassignmentRequestContext";
import { useActivity } from "@/contexts/ActivityContext";
import { useState, useEffect } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export default function DashboardPage() {
  const { admin } = useAdmin();
  const { stats, loading } = useDashboardStats();
  const { getPendingCount: getPasswordResetPendingCount } = usePasswordReset();
  const { getPendingCount: getReassignmentPendingCount } = useReassignmentRequest();
  const { getRecentActivities, loading: activitiesLoading } = useActivity();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activityPage, setActivityPage] = useState(1);
  const activitiesPerPage = 5;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Update every second

    return () => clearInterval(timer);
  }, []);

  // Get real activities from backend
  const allActivities = getRecentActivities(50).map(activity => ({
    date: new Date(activity.created_at).toLocaleDateString("en-US", { 
      month: "short", 
      day: "numeric" 
    }),
    action: activity.description,
    time: activity.formatted_time || new Date(activity.created_at).toLocaleDateString(),
    module: activity.module_display_name || activity.module.charAt(0).toUpperCase() + activity.module.slice(1)
  }));

  // Pagination logic for activities
  const totalActivityPages = Math.ceil(allActivities.length / activitiesPerPage);
  const startIndex = (activityPage - 1) * activitiesPerPage;
  const endIndex = startIndex + activitiesPerPage;
  const currentActivities = allActivities.slice(startIndex, endIndex);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mb-8">
        <div className="relative overflow-hidden bg-red-700 rounded-2xl shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative px-8 py-12">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
                    <UserCheck className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2">
                      Welcome, {admin?.name}!
                    </h1>
                    <p className="text-red-100 text-lg font-medium">Environmental Police Administration System</p>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-center lg:items-end">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4 shadow-lg border border-white/20">
                  <div className="text-center lg:text-right">
                    <div className="text-white/80 text-sm font-medium mb-1">Today is</div>
                    <div className="text-white text-xl font-bold">
                      {currentTime.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </div>
                    <div className="text-red-200 text-sm mt-1">
                      {currentTime.toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        </div>
      </div>

      {/* Logo Section */}
      <div className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-12">
            <div className="flex items-center gap-8">
              <div className="h-40 w-40 rounded-full overflow-hidden bg-white p-4 border border-gray-300 shadow-xl">
                <img
                  src="/images/EPOL LOGO.jpg"
                  alt="EPOL Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-5xl font-bold text-gray-900">EPOL</h2>
                <p className="text-gray-600 font-medium text-xl">Environmental Police</p>
              </div>
            </div>
            
            <div className="hidden md:block w-1 h-24 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full"></div>
            
            <div className="flex items-center gap-8">
              <div className="h-40 w-40 rounded-full overflow-hidden bg-white p-4 border border-gray-300 shadow-xl">
                <img
                  src="/images/CABUYAO LOGO.jpg"
                  alt="Cabuyao Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-5xl font-bold text-gray-900">Cabuyao</h2>
                <p className="text-gray-600 font-medium text-xl">City Government</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
        <div className="space-y-6">
          {/* First Row - Main Modules */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-l-4 border-l-red-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl font-semibold text-gray-900 mb-1">Attendance</CardTitle>
                <CardDescription className="text-base">Staff attendance today</CardDescription>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                <UserCheck className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {loading ? "..." : `${stats.attendance.total} Records`}
            </div>
            <div className="flex items-center text-sm text-red-600">
              <UserCheck className="h-3 w-3 mr-1" />
              {loading ? "Loading..." : `${stats.attendance.present} of ${stats.attendance.total} staff clocked in`}
            </div>
          </CardContent>
          <CardFooter className="pt-0 px-6 pb-6">
            <Link href="/dashboard/attendance" className="w-full">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                View All Records
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl font-semibold text-gray-900 mb-1">Employee</CardTitle>
                <CardDescription className="text-base">Staff management</CardDescription>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                <UserPlus className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {loading ? "..." : `${stats.employees.total} Employees`}
            </div>
            <div className="flex items-center text-sm text-red-600">
              <AlertTriangle className="h-3 w-3 mr-1" />
              {loading ? "Loading..." : `${getReassignmentPendingCount()} pending requests`}
            </div>
          </CardContent>
          <CardFooter className="pt-0 px-6 pb-6">
            <Link href="/dashboard/employees" className="w-full">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                Manage All Staff
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl font-semibold text-gray-900 mb-1">Account</CardTitle>
                <CardDescription className="text-base">User accounts & settings</CardDescription>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                <Settings className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {loading ? "..." : `${stats.accounts.active} Accounts`}
            </div>
            <div className="flex items-center text-sm text-red-600">
              <Key className="h-3 w-3 mr-1" />
              {loading ? "Loading..." : `${getPasswordResetPendingCount()} pending password reset requests`}
            </div>
          </CardContent>
          <CardFooter className="pt-0 px-6 pb-6">
            <Link href="/dashboard/accounts" className="w-full">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                Manage All Accounts
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
          </div>

          {/* Second Row - Additional Modules */}
          <div className="flex flex-wrap justify-center gap-6">
        <Card className="border-l-4 border-l-red-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full max-w-sm">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl font-semibold text-gray-900 mb-1">Inventory</CardTitle>
                <CardDescription className="text-base">Resources availability</CardDescription>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                <Boxes className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {loading ? "..." : `${stats.inventory.total} Items`}
            </div>
            <div className="flex items-center text-sm text-red-600">
              <TrendingDown className="h-3 w-3 mr-1" />
              {loading ? "Loading..." : `${stats.inventory.lowStock} low stock, ${stats.inventory.outOfStock} out of stock`}
            </div>
          </CardContent>
          <CardFooter className="pt-0 px-6 pb-6">
            <Link href="/dashboard/inventory" className="w-full">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                Manage All Inventory
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 w-full max-w-sm">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl font-semibold text-gray-900 mb-1">Safeguarding</CardTitle>
                <CardDescription className="text-base">Recent incident reports</CardDescription>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center shadow-md">
                <ShieldAlert className="h-7 w-7 text-red-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {loading ? "..." : `${stats.incidents.total} Reports`}
            </div>
            <div className="flex items-center text-sm text-red-600">
              <Clock className="h-3 w-3 mr-1" />
              {loading ? "Loading..." : `${stats.incidents.pending} pending reports`}
            </div>
          </CardContent>
          <CardFooter className="pt-0 px-6 pb-6">
            <Link href="/dashboard/safeguarding" className="w-full">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                View All Reports
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <Card className="shadow-lg border-l-4 border-l-red-500">
          <CardHeader className="bg-gradient-to-r from-red-50 to-red-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-600 flex items-center justify-center">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">Activity Overview</CardTitle>
                  <CardDescription className="text-base">System activities in the last 7 days</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {activitiesLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">Loading activities...</div>
                </div>
              ) : currentActivities.length > 0 ? (
                currentActivities.map((item, i) => (
                  <div key={i} className="flex items-start p-4 rounded-lg hover:bg-gray-50 transition-colors border-l-4 border-l-gray-200">
                    <div className="w-full">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-semibold text-gray-900">{item.action}</p>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{item.time}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500 font-medium">{item.date}</p>
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full font-medium">{item.module}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-8">
                  <div className="text-gray-500">No activities found</div>
                </div>
              )}
            </div>
            
            {/* Pagination Controls */}
            {totalActivityPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 mt-6">
                <div className="text-sm text-gray-600">
                  Showing {startIndex + 1}-{Math.min(endIndex, allActivities.length)} of {allActivities.length} activities
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActivityPage(prev => Math.max(prev - 1, 1))}
                    disabled={activityPage === 1}
                    className="h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(3, totalActivityPages) }, (_, i) => {
                      const pageNum = activityPage <= 2 ? i + 1 : activityPage - 1 + i;
                      if (pageNum > totalActivityPages) return null;
                      return (
                        <Button
                          key={pageNum}
                          variant={activityPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActivityPage(pageNum)}
                          className={`h-8 w-8 p-0 font-semibold ${
                            activityPage === pageNum 
                              ? "bg-red-600 hover:bg-red-700 text-white shadow-md" 
                              : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                          }`}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActivityPage(prev => Math.min(prev + 1, totalActivityPages))}
                    disabled={activityPage === totalActivityPages}
                    className="h-8 px-3 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 