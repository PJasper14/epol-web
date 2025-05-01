import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Download, Filter, Search, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function SafeguardingRecordsPage() {
  // Mock data for demonstration
  const incidentReports = [
    { 
      id: "INC-2023-001", 
      title: "Illegal Waste Dumping", 
      location: "Riverside Park", 
      date: "2023-04-19", 
      time: "14:30", 
      reportedBy: "John Doe", 
      status: "Open", 
      priority: "High",
      description: "Large quantities of construction waste dumped near the river bank. Potential contamination risk."
    },
    { 
      id: "INC-2023-002", 
      title: "Air Pollution from Factory", 
      location: "Industrial Zone B", 
      date: "2023-04-18", 
      time: "10:15", 
      reportedBy: "Jane Smith", 
      status: "In Progress", 
      priority: "Medium",
      description: "Excessive smoke emissions observed from factory chimney. Residents complained about strong odor."
    },
    { 
      id: "INC-2023-003", 
      title: "Wildlife Poaching", 
      location: "Northern Forest Reserve", 
      date: "2023-04-17", 
      time: "07:45", 
      reportedBy: "Alex Johnson", 
      status: "Closed", 
      priority: "High",
      description: "Evidence of illegal hunting and trapping of protected species found during routine patrol."
    },
    { 
      id: "INC-2023-004", 
      title: "Chemical Spill", 
      location: "Highway Junction 45", 
      date: "2023-04-15", 
      time: "16:20", 
      reportedBy: "Sam Williams", 
      status: "Open", 
      priority: "Critical",
      description: "Tanker truck accident resulting in chemical spill. Emergency response team dispatched."
    },
    { 
      id: "INC-2023-005", 
      title: "Illegal Fishing", 
      location: "East Bay Conservation Area", 
      date: "2023-04-14", 
      time: "09:30", 
      reportedBy: "Taylor Brown", 
      status: "In Progress", 
      priority: "Medium",
      description: "Multiple individuals observed using prohibited fishing methods in protected waters."
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Safeguarding Records</h1>
        <p className="text-gray-500">View and manage environmental incident reports</p>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search incidents..."
              className="pl-8 w-full"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-1">
            <AlertCircle className="h-4 w-4" />
            <span>Status Filter</span>
          </Button>
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>

      <Card className="border-red-100">
        <CardHeader className="bg-red-50 rounded-t-lg border-b border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Incident Reports</CardTitle>
              <CardDescription>Environmental safeguarding reports submitted from mobile app</CardDescription>
            </div>
            <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-500">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Incident</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Location</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Date & Time</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Reported By</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Priority</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {incidentReports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{report.id}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium">{report.title}</div>
                      <div className="text-xs text-gray-500 mt-1 max-w-60 truncate" title={report.description}>{report.description}</div>
                    </td>
                    <td className="py-3 px-4">{report.location}</td>
                    <td className="py-3 px-4">
                      <div>{report.date}</div>
                      <div className="text-xs text-gray-500">{report.time}</div>
                    </td>
                    <td className="py-3 px-4">{report.reportedBy}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          report.priority === "Critical"
                            ? "bg-red-100 text-red-800"
                            : report.priority === "High"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {report.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          report.status === "Open"
                            ? "bg-blue-100 text-blue-800"
                            : report.status === "In Progress"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-red-600 hover:text-red-800 hover:bg-red-50 p-0 px-2"
                        asChild
                      >
                        <Link href={`/dashboard/safeguarding/${report.id}`}>View Details</Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between p-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">Showing 5 of 24 reports</div>
            <div className="flex gap-1">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="outline" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 