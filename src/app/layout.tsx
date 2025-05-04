import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "../styles/datepicker.css";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { PurchaseOrderProvider } from "@/contexts/PurchaseOrderContext";
import { IncidentProvider } from "@/app/dashboard/safeguarding/IncidentContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EPOL Admin",
  description: "Cabuyao City Environmental Police Integrated System",
  icons: [
    { rel: 'icon', url: '/favicon.jpg' },
    { rel: 'apple-touch-icon', url: '/favicon.jpg' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/favicon.jpg" />
        <link rel="icon" type="image/jpeg" sizes="32x32" href="/favicon.jpg" />
        <link rel="icon" type="image/jpeg" sizes="16x16" href="/favicon.jpg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/favicon.jpg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background`}
      >
        <InventoryProvider>
          <PurchaseOrderProvider>
            <IncidentProvider>
        {children}
            </IncidentProvider>
          </PurchaseOrderProvider>
        </InventoryProvider>
      </body>
    </html>
  );
}
