"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
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
  LucideIcon
} from 'lucide-react';

type SidebarLink = {
  title: string;
  href: string;
  icon: LucideIcon;
  variant: 'default' | 'ghost';
};

export function Sidebar() {
  const pathname = usePathname();

  const links: SidebarLink[] = [
    {
      title: 'Dashboard',
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
      title: 'Safeguarding Records',
      href: '/dashboard/safeguarding',
      icon: ShieldAlert,
      variant: pathname?.includes('/dashboard/safeguarding') ? 'default' : 'ghost',
    },
    {
      title: 'Resources Inventory',
      href: '/dashboard/inventory',
      icon: Boxes,
      variant: pathname?.includes('/dashboard/inventory') ? 'default' : 'ghost',
    },
    {
      title: 'Employee Management',
      href: '/dashboard/employees',
      icon: Users,
      variant: pathname?.includes('/dashboard/employees') ? 'default' : 'ghost',
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
        <Link
          href="/"
          className="group flex items-center justify-center gap-3 rounded-2xl bg-red-700 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-red-800"
        >
          <LogOut className="h-5 w-5 text-white transition-colors" />
          <span className="transition-colors">Logout</span>
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar; 