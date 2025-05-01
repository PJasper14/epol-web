"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, User, FileText, Calendar, AlertTriangle, CheckCircle, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

// Mock data - in a real application, this would come from an API
const incidentReport = {
  id: "INC-2023-001",
  title: "Illegal Waste Dumping",
  location: "Riverside Park",
  date: "2023-04-19",
  time: "14:30",
  reportedBy: "John Doe",
  status: "Open",
  priority: "High",
  description: "Large quantities of construction waste dumped near the river bank. Potential contamination risk.",
  resolution: {
    status: "Pending",
    assignedTo: "Sarah Johnson",
    lastUpdated: "2023-04-19T15:30:00",
    notes: "Initial assessment completed. Waiting for cleanup team deployment.",
    actions: [
      {
        date: "2023-04-19T14:45:00",
        action: "Report received and logged",
        by: "System"
      },
      {
        date: "2023-04-19T15:00:00",
        action: "Assigned to cleanup team",
        by: "Sarah Johnson"
      }
    ]
  }
};

export default function IncidentDetailsPage({ params }: { params: { id: string } }) {
  const [showActionForm, setShowActionForm] = useState(false);
  const [newAction, setNewAction] = useState("");

  const handleAddAction = () => {
    if (!newAction.trim()) return;
    
    // In a real application, this would update the backend
    const updatedActions = [
      ...incidentReport.resolution.actions,
      {
        date: new Date().toISOString(),
        action: newAction,
        by: "Current User" // This would be the actual logged-in user
      }
    ];

    // Update the incident report (in a real app, this would be an API call)
    incidentReport.resolution.actions = updatedActions;
    incidentReport.resolution.lastUpdated = new Date().toISOString();
    
    setNewAction("");
    setShowActionForm(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "text-red-600 bg-red-50 border-red-200";
      case "High":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "Critical":
        return <AlertTriangle className="h-5 w-5" />;
      case "High":
        return <AlertCircle className="h-5 w-5" />;
      case "Medium":
        return <Clock className="h-5 w-5" />;
      case "Low":
        return <CheckCircle className="h-5 w-5" />;
      default:
        return <AlertCircle className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Incident Details</h1>
          <p className="text-gray-500">View and manage incident report details</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/safeguarding">Back to Reports</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Incident Details */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{incidentReport.title}</CardTitle>
                <CardDescription>Report ID: {incidentReport.id}</CardDescription>
              </div>
              <div className="flex gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getPriorityColor(incidentReport.priority)}`}
                >
                  {getPriorityIcon(incidentReport.priority)}
                  <span className="ml-1">{incidentReport.priority}</span>
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    incidentReport.status === "Open"
                      ? "bg-blue-100 text-blue-800"
                      : incidentReport.status === "In Progress"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {incidentReport.status}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Date & Time</span>
                </div>
                <p className="font-medium">
                  {incidentReport.date} at {incidentReport.time}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <User className="h-4 w-4" />
                  <span>Reported By</span>
                </div>
                <p className="font-medium">{incidentReport.reportedBy}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>Location</span>
                </div>
                <p className="font-medium">{incidentReport.location}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <User className="h-4 w-4" />
                  <span>Assigned To</span>
                </div>
                <p className="font-medium">{incidentReport.resolution?.assignedTo || "Unassigned"}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                <FileText className="h-4 w-4" />
                <span>Description</span>
              </div>
              <p className="text-gray-700">{incidentReport.description}</p>
            </div>
          </CardContent>
        </Card>

        {/* Resolution Status */}
        <Card>
          <CardHeader>
            <CardTitle>Resolution Status</CardTitle>
            <CardDescription>Current status and progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Resolution Status</span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    incidentReport.resolution?.status === "Pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : incidentReport.resolution?.status === "In Progress"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {incidentReport.resolution?.status || "Not Started"}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Last Updated: {incidentReport.resolution ? new Date(incidentReport.resolution.lastUpdated).toLocaleString() : "Not updated"}
              </div>
            </div>

            {incidentReport.resolution?.notes && (
              <div>
                <div className="text-sm font-medium mb-1">Notes</div>
                <p className="text-sm text-gray-600">{incidentReport.resolution.notes}</p>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Action History</div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  onClick={() => setShowActionForm(!showActionForm)}
                >
                  {showActionForm ? "Cancel" : "Add Action"}
                </Button>
              </div>

              {showActionForm && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <textarea
                    className="w-full p-2 border rounded-md mb-2"
                    rows={3}
                    placeholder="Enter action details..."
                    value={newAction}
                    onChange={(e) => setNewAction(e.target.value)}
                  />
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleAddAction}
                  >
                    Add Action
                  </Button>
                </div>
              )}

              <div className="space-y-3">
                {incidentReport.resolution?.actions.map((action, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-gray-300" />
                    <div>
                      <div className="text-sm font-medium">{action.action}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(action.date).toLocaleString()} by {action.by}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // In a real application, this would update the status
                  const newStatus = incidentReport.status === "Open" ? "In Progress" : "Closed";
                  incidentReport.status = newStatus;
                  incidentReport.resolution.status = newStatus;
                }}
              >
                {incidentReport.status === "Open" ? "Start Resolution" : "Mark as Resolved"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 