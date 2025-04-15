import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ReactNode } from "react";

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 text-white min-h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="font-bold text-xl">EPOL</div>
            <div className="text-sm">LOGO</div>
          </div>

          <nav className="space-y-2">
            <NavItem href="/dashboard" label="Dashboard" />
            <NavItem href="/dashboard/users" label="Users" />
            <NavItem href="/dashboard/attendance" label="Attendance" />
            <NavItem href="/dashboard/incidents" label="Incidents" />
            <NavItem href="/dashboard/inventory" label="Inventory" />
            <NavItem href="/dashboard/reports" label="Reports" />
            <NavItem href="/dashboard/settings" label="Settings" />
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top navbar */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">EPOL Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">User: Admin</div>
            <div className="h-8 w-px bg-gray-200"></div>
            <Avatar>
              <AvatarImage src="/avatar.png" alt="User" />
              <AvatarFallback>AD</AvatarFallback>
            </Avatar>
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
              Logout
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gray-50 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center px-4 py-3 text-gray-300 hover:text-white hover:bg-zinc-800 rounded-md transition-colors"
    >
      <span>{label}</span>
    </Link>
  );
} 