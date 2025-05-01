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
  
  ];

  return (
    <aside className="fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r bg-white">
      <div className="flex h-14 items-center border-b px-4 py-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full overflow-hidden">
            <Image
              src="/images/EPOL LOGO.jpg"
              alt="EPOL Logo"
              width={32}
              height={32}
            />
          </div>
          <span className="font-semibold text-red-700">EPOL Admin</span>
        </div>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {links.map((link, index) => {
            const Icon = link.icon;
            return (
              <Link
                key={index}
                href={link.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                  link.variant === 'default' 
                    ? "bg-red-100 text-red-700 hover:bg-red-200" 
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <Icon 
                  className={cn(
                    "h-5 w-5",
                    link.variant === 'default' ? "text-red-700" : "text-gray-500"
                  )} 
                />
                {link.title}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-lg border-2 border-red-600 bg-white px-3 py-2 text-sm font-medium text-red-600 transition-all hover:bg-red-50"
        >
          <LogOut className="h-5 w-5 text-red-600" />
          Logout
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar; 