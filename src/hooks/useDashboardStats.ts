import { useState, useEffect, useCallback, useRef } from 'react';
import { useInventory } from '@/contexts/InventoryContext';
import { useIncidentContext } from '@/app/dashboard/safeguarding/IncidentContext';
import { useUser } from '@/contexts/UserContext';
import { useAttendance } from '@/contexts/AttendanceContext';
import { inventoryApi } from '@/services/inventoryApi';

export interface DashboardStats {
  attendance: {
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
    pendingRequests: number;
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
  const { users } = useUser();
  const { getAttendanceStats, loadAttendanceRecords, attendanceRecords } = useAttendance();
  const [stats, setStats] = useState<DashboardStats>({
    attendance: { total: 0 },
    employees: { total: 0, active: 0 },
    accounts: { total: 0, active: 0 },
    inventory: { total: 0, lowStock: 0, outOfStock: 0, pendingRequests: 0 },
    incidents: { total: 0, pending: 0, ongoing: 0, resolved: 0, thisWeek: 0 }
  });
  const [loading, setLoading] = useState(true);
  
  // Track if a calculation is in progress to prevent duplicate API calls
  const isCalculating = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasLoadedAttendance = useRef(false);

  // Load attendance records on mount
  useEffect(() => {
    const loadData = async () => {
      if (!hasLoadedAttendance.current) {
        hasLoadedAttendance.current = true;
        // Load all attendance records (no date filter for dashboard stats)
        await loadAttendanceRecords();
      }
    };
    loadData();
  }, [loadAttendanceRecords]);

  // Calculate stats when data changes
  useEffect(() => {
    console.log('[useDashboardStats] Data changed - inventoryItems:', inventoryItems.length, 'incidents:', incidents.length, 'users:', users.length, 'attendanceRecords:', attendanceRecords.length);
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the calculation by 300ms to prevent rapid successive calls
    timeoutRef.current = setTimeout(async () => {
      // If already calculating, skip this call
      if (isCalculating.current) {
        console.log('[useDashboardStats] ⏭️ Skipping calculation - already in progress');
        return;
      }

      console.log('[useDashboardStats] 🔄 Starting stats calculation...');
      isCalculating.current = true;
      
      await calculateStats();
      
      isCalculating.current = false;
      console.log('[useDashboardStats] ✅ Stats calculation complete');
    }, 300);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [inventoryItems, incidents, users, attendanceRecords]);

  const calculateStats = async () => {
      // Use real attendance data from API for today's date
      const today = new Date().toISOString().split('T')[0];
      const attendanceStats = getAttendanceStats(today);
      console.log('Dashboard Stats - Attendance for today:', today, attendanceStats);

      // Use real user data from UserContext - only count EPOL and Team Leader roles
      console.log('[useDashboardStats] Total users:', users.length, users);
      console.log('[useDashboardStats] User roles:', users.map(u => ({ name: u.firstName, role: u.role })));
      const employeeUsers = users.filter(user => user.role === 'EPOL' || user.role === 'Team Leader');
      console.log('[useDashboardStats] Filtered employee users:', employeeUsers.length, employeeUsers);
      const totalEmployees = employeeUsers.length;
      const activeEmployees = employeeUsers.length; // All EPOL and Team Leader users are considered active employees
      
      // For accounts, we'll use the same user data but count all users (including admins)
      const totalAccounts = users.length;
      const activeAccounts = users.length; // All users in the system are considered active accounts

      // Real inventory data - filter from already-loaded inventory items instead of making new API calls
      const lowStockItems = inventoryItems.filter(item => item.quantity <= item.threshold && item.quantity > 0);
      const outOfStockItems = inventoryItems.filter(item => item.quantity === 0);

      // Get pending inventory requests
      let pendingRequestsCount = 0;
      try {
        const requestsResponse = await inventoryApi.getInventoryRequests({ status: 'pending' });
        pendingRequestsCount = requestsResponse.data?.length || 0;
      } catch (error) {
        console.error('Error fetching pending inventory requests:', error);
      }

      // Real incident data
      console.log('Dashboard Stats - Total incidents:', incidents.length, incidents);
      const pendingIncidents = incidents.filter(inc => inc.status === "Pending").length;
      const ongoingIncidents = incidents.filter(inc => inc.status === "Ongoing").length;
      const resolvedIncidents = incidents.filter(inc => inc.status === "Resolved").length;
      console.log('Dashboard Stats - Incident counts:', { pending: pendingIncidents, ongoing: ongoingIncidents, resolved: resolvedIncidents });

      // Calculate incidents this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const incidentsThisWeek = incidents.filter(inc => {
        const incidentDate = new Date(inc.date);
        return incidentDate >= oneWeekAgo;
      }).length;

      setStats({
        attendance: {
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
          outOfStock: outOfStockItems.length,
          pendingRequests: pendingRequestsCount
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

  return { stats, loading };
}
