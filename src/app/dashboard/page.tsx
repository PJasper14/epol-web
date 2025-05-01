import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCheck, ShieldAlert, Boxes, Activity } from "lucide-react";

export default function DashboardPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card className="border-red-100 hover:border-red-200 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Attendance</CardTitle>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <CardDescription>Staff attendance today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">85%</div>
            <p className="text-sm text-gray-500 mt-1">17 of 20 staff clocked in</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/dashboard/attendance" className="text-sm text-red-600 hover:text-red-800">
              View all records →
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-red-100 hover:border-red-200 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Safeguarding</CardTitle>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <ShieldAlert className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <CardDescription>Recent incident reports</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-sm text-gray-500 mt-1">New reports this week</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/dashboard/safeguarding" className="text-sm text-red-600 hover:text-red-800">
              View all reports →
            </Link>
          </CardFooter>
        </Card>

        <Card className="border-red-100 hover:border-red-200 transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-medium">Inventory</CardTitle>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <Boxes className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <CardDescription>Resources availability</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">13</div>
            <p className="text-sm text-gray-500 mt-1">Items in inventory</p>
          </CardContent>
          <CardFooter className="pt-0">
            <Link href="/dashboard/inventory" className="text-sm text-red-600 hover:text-red-800">
              Manage inventory →
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Activity Overview</CardTitle>
              <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                <Activity className="h-5 w-5 text-red-600" />
              </div>
            </div>
            <CardDescription>System activities in the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { date: "Today", action: "New safeguarding report filed by Officer John", time: "2 hours ago" },
                { date: "Today", action: "Inventory updated - Added 10 new items", time: "5 hours ago" },
                { date: "Yesterday", action: "Attendance records exported to CSV", time: "1 day ago" },
                { date: "Apr 18", action: "New user account created for Officer Maria", time: "2 days ago" },
                { date: "Apr 17", action: "System maintenance performed", time: "3 days ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-start pb-4 last:pb-0 last:border-0 border-b border-gray-100">
                  <div className="w-full">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium">{item.action}</p>
                      <span className="text-xs text-gray-500">{item.time}</span>
                    </div>
                    <p className="text-xs text-gray-500">{item.date}</p>
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