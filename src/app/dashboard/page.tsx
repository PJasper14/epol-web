import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, ShieldAlert, Boxes, Activity, ArrowRight, TrendingUp, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Dashboard</h1>
            <p className="text-gray-600 text-lg">Environmental Police Administration System</p>
          </div>
          <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="border-l-4 border-l-blue-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl font-semibold text-gray-900 mb-1">Attendance</CardTitle>
                <CardDescription className="text-base">Staff attendance today</CardDescription>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-md">
                <UserCheck className="h-7 w-7 text-blue-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">85%</div>
            <div className="flex items-center text-sm text-blue-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              17 of 20 staff clocked in
            </div>
          </CardContent>
          <CardFooter className="pt-0 px-6 pb-6">
            <Link href="/dashboard/attendance" className="w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all duration-200">
                View all records
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-red-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
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
            <div className="text-3xl font-bold text-gray-900 mb-2">5</div>
            <div className="flex items-center text-sm text-red-600">
              <Clock className="h-3 w-3 mr-1" />
              New reports this week
            </div>
          </CardContent>
          <CardFooter className="pt-0 px-6 pb-6">
            <Link href="/dashboard/safeguarding" className="w-full">
              <Button className="w-full bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl transition-all duration-200">
                View all reports
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-l-4 border-l-green-500 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <CardTitle className="text-xl font-semibold text-gray-900 mb-1">Inventory</CardTitle>
                <CardDescription className="text-base">Resources availability</CardDescription>
              </div>
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center shadow-md">
                <Boxes className="h-7 w-7 text-green-600" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-gray-900 mb-2">13</div>
            <div className="flex items-center text-sm text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              Items in inventory
            </div>
          </CardContent>
          <CardFooter className="pt-0 px-6 pb-6">
            <Link href="/dashboard/inventory" className="w-full">
              <Button className="w-full bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200">
                Manage inventory
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mb-8">
        <Card className="shadow-lg border-l-4 border-l-purple-500">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-purple-600 flex items-center justify-center">
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
              {[
                { date: "Today", action: "New safeguarding report filed by Officer John", time: "2 hours ago" },
                { date: "Today", action: "Inventory updated - Added 10 new items", time: "5 hours ago" },
                { date: "Yesterday", action: "Attendance records exported to CSV", time: "1 day ago" },
                { date: "Apr 18", action: "New user account created for Officer Maria", time: "2 days ago" },
                { date: "Apr 17", action: "System maintenance performed", time: "3 days ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-start p-4 rounded-lg hover:bg-gray-50 transition-colors border-l-4 border-l-gray-200">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-900">{item.action}</p>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{item.time}</span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium">{item.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 