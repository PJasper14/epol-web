import { useState, useEffect } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { useIncidentContext } from '@/app/dashboard/safeguarding/IncidentContext';
import { calculateAttendanceStats } from '@/data/attendanceData';

export interface DashboardStats {
  attendance: {
    percentage: number;
    present: number;
    total: number;
  };
  employees: {
    total: number;
    active: number;
  };
  accounts: {
    total: number;
    active: number;
  };
  inventory: {
    total: number;
    lowStock: number;
    outOfStock: number;
  };
  incidents: {
    total: number;
    pending: number;
    ongoing: number;
    resolved: number;
    thisWeek: number;
  };
}

export function useDashboardStats() {
  const { inventoryItems, getLowStockItems, getOutOfStockItems } = useInventory();
  const { incidents } = useIncidentContext();
  const [stats, setStats] = useState<DashboardStats>({
    attendance: { percentage: 0, present: 0, total: 0 },
    employees: { total: 0, active: 0 },
    accounts: { total: 0, active: 0 },
    inventory: { total: 0, lowStock: 0, outOfStock: 0 },
    incidents: { total: 0, pending: 0, ongoing: 0, resolved: 0, thisWeek: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateStats = () => {
      // Use real attendance data
      const attendanceStats = calculateAttendanceStats();

      // Mock employee data - in a real app, this would come from an API
      const mockEmployeeData = [
        { id: 1, name: "John Doe", status: "Active" },
        { id: 2, name: "Jane Smith", status: "Active" },
        { id: 3, name: "Alex Johnson", status: "Active" },
        { id: 4, name: "Sam Williams", status: "Active" },
        { id: 5, name: "Taylor Brown", status: "On Leave" },
        { id: 6, name: "Jordan Lee", status: "Active" },
        { id: 7, name: "Casey Green", status: "Active" },
        { id: 8, name: "Riley White", status: "Active" },
        { id: 9, name: "Michael Chen", status: "Active" },
        { id: 10, name: "Sarah Wilson", status: "Active" },
        { id: 11, name: "David Martinez", status: "Active" },
        { id: 12, name: "Lisa Anderson", status: "Active" },
        { id: 13, name: "Robert Taylor", status: "Active" },
        { id: 14, name: "Maria Garcia", status: "Active" },
        { id: 15, name: "James Rodriguez", status: "Active" }
      ];

      const activeEmployees = mockEmployeeData.filter(emp => emp.status === "Active").length;
      const totalEmployees = mockEmployeeData.length;

      // Mock account data - in a real app, this would come from an API
      const mockAccountData = [
        { id: 1, username: "admin", status: "Active" },
        { id: 2, username: "john.doe", status: "Active" },
        { id: 3, username: "jane.smith", status: "Active" },
        { id: 4, username: "alex.johnson", status: "Active" },
        { id: 5, username: "sam.williams", status: "Active" }
      ];

      const activeAccounts = mockAccountData.filter(acc => acc.status === "Active").length;
      const totalAccounts = mockAccountData.length;

      // Real inventory data
      const lowStockItems = getLowStockItems();
      const outOfStockItems = getOutOfStockItems();

      // Real incident data
      const pendingIncidents = incidents.filter(inc => inc.status === "Pending").length;
      const ongoingIncidents = incidents.filter(inc => inc.status === "Ongoing").length;
      const resolvedIncidents = incidents.filter(inc => inc.status === "Resolved").length;

      // Calculate incidents this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const incidentsThisWeek = incidents.filter(inc => {
        const incidentDate = new Date(inc.date);
        return incidentDate >= oneWeekAgo;
      }).length;

      setStats({
        attendance: {
          percentage: attendanceStats.percentage,
          present: attendanceStats.present,
          total: attendanceStats.total
        },
        employees: {
          total: totalEmployees,
          active: activeEmployees
        },
        accounts: {
          total: totalAccounts,
          active: activeAccounts
        },
        inventory: {
          total: inventoryItems.length,
          lowStock: lowStockItems.length,
          outOfStock: outOfStockItems.length
        },
        incidents: {
          total: incidents.length,
          pending: pendingIncidents,
          ongoing: ongoingIncidents,
          resolved: resolvedIncidents,
          thisWeek: incidentsThisWeek
        }
      });

      setLoading(false);
    };

    calculateStats();
  }, [inventoryItems, incidents, getLowStockItems, getOutOfStockItems]);

  return { stats, loading };
}
