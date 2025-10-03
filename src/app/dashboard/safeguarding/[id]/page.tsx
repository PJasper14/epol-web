"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Clock, User, FileText, Calendar, AlertTriangle, CheckCircle, ArrowLeft, Camera, MapPin, Plus } from "lucide-react";
import Link from "next/link";
import { useIncidentContext } from "../IncidentContext";

// Helper function to convert 24-hour time to 12-hour format
const formatTimeTo12Hour = (time24: string) => {
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
};

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

  const [showConfirm, setShowConfirm] = useState(false);
  const [showInProgressConfirm, setShowInProgressConfirm] = useState(false);


  const handleMarkResolved = () => {
    updateIncident(incidentReport.id, {
      status: "Resolved",
      lastUpdated: new Date().toISOString()
    });
    setShowConfirm(false);
  };

  const handleMarkInProgress = () => {
    updateIncident(incidentReport.id, {
      status: "Ongoing",
      lastUpdated: new Date().toISOString()
    });
    setShowInProgressConfirm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Ongoing":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Low":
        return "bg-green-100 text-green-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-red-100 text-red-800";
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
            Mark as Ongoing
          </Button>
        );
      case "Ongoing":
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
        <Button className="gap-2 bg-red-600 hover:bg-red-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 px-6 py-2" asChild>
          <Link href="/dashboard/safeguarding">
            <ArrowLeft className="h-4 w-4" />
            Back to Reports
          </Link>
        </Button>
      </div>

      {/* Header Section with Status and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{incidentReport.title}</h1>
                <p className="text-gray-600">Incident ID: {incidentReport.id}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status)}`}>
                <Clock className="h-4 w-4" />
                {status}
              </span>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(incidentReport.priority || "Low")}`}>
                <AlertTriangle className="h-4 w-4" />
                {incidentReport.priority || "Low"} Priority
              </span>
              {lastUpdated && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
                  <Clock className="h-4 w-4" />
                  Last updated: {new Date(lastUpdated).toLocaleString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {renderStatusButton()}
          </div>
        </div>
      </div>

      {/* Main Incident Details Card */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Incident Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date & Time
              </label>
              <p className="text-lg font-semibold text-gray-900">
                {incidentReport.date} at {formatTimeTo12Hour(incidentReport.time)}
              </p>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <User className="h-4 w-4" />
                Reported By
              </label>
              <p className="text-lg font-semibold text-gray-900">{incidentReport.reportedBy}</p>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Location
              </label>
              <p className="text-lg font-semibold text-gray-900">{incidentReport.location}</p>
              {incidentReport.coordinates && (
                <p className="text-sm text-gray-500 font-mono">
                  {incidentReport.coordinates.latitude.toFixed(6)}, {incidentReport.coordinates.longitude.toFixed(6)}
                </p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </label>
              <p className="text-gray-700 leading-relaxed">{incidentReport.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Media Evidence Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Media Evidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
              <Camera className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-500">No media uploaded</span>
            </div>
            <div className="aspect-square bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-gray-400 transition-colors cursor-pointer">
              <Plus className="h-8 w-8 text-gray-400" />
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Status Change Modals */}
      {showInProgressConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full border border-gray-200">
            <div className="p-6 text-center">
              <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Mark as Ongoing?</h3>
              <p className="text-gray-600 mb-6">This will change the incident status to "Ongoing" and update the timeline.</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowInProgressConfirm(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleMarkInProgress}>
                  Mark as Ongoing
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full border border-gray-200">
            <div className="p-6 text-center">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Mark as Resolved?</h3>
              <p className="text-gray-600 mb-6">This will change the incident status to "Resolved" and close the case.</p>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowConfirm(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={handleMarkResolved}>
                  Mark as Resolved
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}