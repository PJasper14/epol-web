"use client";

import Sidebar from "@/components/ui/sidebar";
import Footer from "@/components/ui/footer";
import { useAdmin } from "@/contexts/AdminContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, loading } = useAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to access the dashboard.</p>
          <a href="/" className="text-red-600 hover:text-red-800 underline">
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <LocationProvider>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Sidebar />
        <div className="ml-64 flex-1 flex flex-col">
          <main className="p-6 flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    </LocationProvider>
  );
} 