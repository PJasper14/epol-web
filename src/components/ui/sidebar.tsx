"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAdmin } from '@/contexts/AdminContext';
import { 
  BarChart3, 
  UserCheck, 
  ShieldAlert, 
  Boxes, 
  LogOut, 
  Settings, 
  Home,
  Users,
  MapPin,
  UserCog,
  Navigation,
  LucideIcon,
  AlertTriangle
} from 'lucide-react';

type SidebarLink = {
  title: string;
  href: string;
  icon: LucideIcon;
  variant: 'default' | 'ghost';
};

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAdmin();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const confirmLogout = async () => {
    setShowLogoutModal(false);
    await handleLogout();
  };

  const links: SidebarLink[] = [
    {
      title: 'Home',
      href: '/dashboard',
      icon: Home,
      variant: pathname === '/dashboard' ? 'default' : 'ghost',
    },
    {
      title: 'Attendance Records',
      href: '/dashboard/attendance',
      icon: UserCheck,
      variant: pathname?.includes('/dashboard/attendance') ? 'default' : 'ghost',
    },
    {
      title: 'Employee Management',
      href: '/dashboard/employees',
      icon: Users,
      variant: pathname?.includes('/dashboard/employees') ? 'default' : 'ghost',
    },
    {
      title: 'Account Management',
      href: '/dashboard/accounts',
      icon: UserCog,
      variant: pathname?.includes('/dashboard/accounts') ? 'default' : 'ghost',
    },
    {
      title: 'Inventory Management',
      href: '/dashboard/inventory',
      icon: Boxes,
      variant: pathname?.includes('/dashboard/inventory') ? 'default' : 'ghost',
    },
    {
      title: 'Safeguarding Records',
      href: '/dashboard/safeguarding',
      icon: ShieldAlert,
      variant: pathname?.includes('/dashboard/safeguarding') ? 'default' : 'ghost',
    },
  ];

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col bg-red-600 text-white">
      <div className="flex h-16 items-center border-b border-red-500 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-white p-1 ring-2 ring-white">
            <Image
              src="/images/EPOL LOGO.jpg"
              alt="EPOL Logo"
              width={32}
              height={32}
              className="h-full w-full object-contain"
            />
          </div>
          <div>
            <span className="font-bold text-lg text-white">EPOL</span>
            <span className="font-semibold text-sm text-white/80 block">Admin Panel</span>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-3 text-sm font-medium">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={index}
                href={link.href}
                className={cn(
                  "group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all",
                  link.variant === 'default' 
                    ? "bg-white text-red-600 shadow-sm" 
                    : "text-white hover:bg-white hover:text-red-600 hover:shadow-sm"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5 transition-colors",
                    link.variant === 'default' ? "text-red-600" : "text-white group-hover:text-red-600"
                  )} 
                />
                <span className="transition-colors">{link.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t border-red-500">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="group flex items-center justify-center gap-3 rounded-2xl bg-red-700 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-red-800 w-full"
        >
          <LogOut className="h-5 w-5 text-white transition-colors" />
          <span className="transition-colors">Logout</span>
        </button>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Confirm Logout
                </h3>
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 text-sm leading-relaxed">
                  Are you sure you want to logout from the EPOL Admin Panel? You will need to login again to access the system.
                </p>
              </div>
              
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

export default Sidebar; 