// admin/layout.tsx)
import type { Metadata } from 'next';
import { QueryProvider } from '@/components/admin/providers/QueryProvider';
import { ErrorBoundary } from '@/components/admin/common/ErrorBoundary';
import { AdminShell } from './AdminShell';
import { ThemeProvider } from 'next-themes';
// import NextAuthProvider from '@/components/admin/providers/SessionProvider';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'AI Chat Admin Management System',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* <NextAuthProvider> */}
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ErrorBoundary>
            <QueryProvider>
              <AdminShell>{children}</AdminShell>
            </QueryProvider>
          </ErrorBoundary>
        </ThemeProvider>
        {/* </NextAuthProvider> */}
      </body>
    </html>
  );
}












// import React from "react";
// import DashboardLayout from "@/components/AdminDashboard";

// export default function AdminLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }): React.ReactNode {
//   return <DashboardLayout>{children}</DashboardLayout>;
// }
