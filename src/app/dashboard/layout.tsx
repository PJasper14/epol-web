import { Metadata } from "next";
import Sidebar from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "EPOL Admin",
  description: "Environmental Police Admin Dashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 