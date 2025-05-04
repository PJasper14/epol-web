"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, User, FileText, Calendar, AlertTriangle, CheckCircle, ChevronLeft, Camera } from "lucide-react";
import Link from "next/link";
import { useIncidentContext } from "../IncidentContext";

export default function IncidentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { incidents, updateIncident } = useIncidentContext();
  const { id } = React.use(params);

  if (!id) {
    return <div className="p-8 text-center text-red-600 font-bold">No incident ID provided.</div>;
  }

  const incidentReport = useMemo(
    () => incidents.find(i => i.id === id),
    [incidents, id]
  );

  // If not found, show a message
  if (!incidentReport) {
    return <div className="p-8 text-center text-red-600 font-bold">Incident not found.</div>;
  }

  const [showActionForm, setShowActionForm] = useState(false);
  const [newAction, setNewAction] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [showInProgressConfirm, setShowInProgressConfirm] = useState(false);

  const handleAddAction = () => {
    if (!newAction.trim()) return;
    const updatedActions = [
      ...(incidentReport.actions || []),
      {
        date: new Date().toISOString(),
        action: newAction,
        by: "System"
      }
    ];
    updateIncident(incidentReport.id, {
      actions: updatedActions,
      lastUpdated: new Date().toISOString()
    });
    setNewAction("");
    setShowActionForm(false);
  };

  const handleMarkResolved = () => {
    updateIncident(incidentReport.id, {
      status: "Resolved",
      lastUpdated: new Date().toISOString()
    });
    setShowConfirm(false);
  };

  const handleMarkInProgress = () => {
    updateIncident(incidentReport.id, {
      status: "In Progress",
      lastUpdated: new Date().toISOString()
    });
    setShowInProgressConfirm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const status = incidentReport.status;
  const lastUpdated = incidentReport.lastUpdated;

  // Only show the appropriate button based on current status
  const renderStatusButton = () => {
    switch (status) {
      case "Pending":
        return (
          <Button size="sm" className="gap-2 bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setShowInProgressConfirm(true)}>
            <Clock className="h-4 w-4" />
            Mark as In Progress
          </Button>
        );
      case "In Progress":
        return (
          <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowConfirm(true)}>
            <CheckCircle className="h-4 w-4" />
            Mark as Resolved
          </Button>
        );
      case "Resolved":
        return null; // No button shown for resolved status
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Incident Details</h1>
          <p className="text-gray-500">View and manage incident report details</p>
        </div>
        <Button className="gap-2 border-red-300 text-red-600 hover:bg-red-50" variant="outline" asChild>
          <Link href="/dashboard/safeguarding">
            <ChevronLeft className="h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </div>

      <div>
        {/* Main Incident Details */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{incidentReport.title}</CardTitle>
              </div>
              <div className="flex gap-2 items-center">
                {renderStatusButton()}
                {showInProgressConfirm && (
                  <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/60">
                    <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs border border-gray-200">
                      <div className="mb-4 text-center">
                        <Clock className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                        <div className="font-semibold mb-2">Mark as In Progress?</div>
                        <div className="text-gray-500 text-sm">Are you sure you want to mark this incident as in progress?</div>
                      </div>
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white flex items-center" onClick={handleMarkInProgress}>
                          <Clock className="h-4 w-4 mr-1 text-white" />
                          Yes, Mark as In Progress
                    </Button>
                        <Button size="sm" className="border border-gray-300 text-gray-700 hover:bg-gray-100" variant="outline" onClick={() => setShowInProgressConfirm(false)}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}
                    {showConfirm && (
                      <div className="fixed inset-0 flex items-center justify-center z-50 bg-white/60">
                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-xs border border-gray-200">
                          <div className="mb-4 text-center">
                            <CheckCircle className="mx-auto mb-2 h-8 w-8 text-green-600" />
                            <div className="font-semibold mb-2">Mark as Resolved?</div>
                            <div className="text-gray-500 text-sm">Are you sure you want to mark this incident as resolved?</div>
                          </div>
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex items-center" onClick={handleMarkResolved}>
                              <CheckCircle className="h-4 w-4 mr-1 text-white" />
                              Yes, Mark as Resolved
                            </Button>
                            <Button size="sm" className="border border-gray-300 text-gray-700 hover:bg-gray-100" variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
                          </div>
                        </div>
                      </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span>ID</span>
                </div>
                <p className="font-medium">{incidentReport.id}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>Date & Time</span>
                </div>
                <p className="font-medium">{incidentReport.date} at {incidentReport.time}</p>
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
              <div className="col-span-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <FileText className="h-4 w-4" />
                  <span>Description</span>
                </div>
                <p className="text-gray-700">{incidentReport.description}</p>
              </div>
              <div className="col-span-2">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <Camera className="h-4 w-4" />
                  <span>Uploaded Media</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-20 bg-gray-100 border border-dashed border-gray-300 flex flex-col items-center justify-center rounded-md">
                    <Camera className="h-8 w-8 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-400">No media uploaded</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span>Status</span>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(status)}`}>{status}</span>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <span>Last Updated</span>
                </div>
                <p className="font-medium">{lastUpdated ? new Date(lastUpdated).toLocaleString() : "Not updated"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}