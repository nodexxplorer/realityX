// app/dashboard/layout.tsx

"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, HelpCircle } from "lucide-react";
import SettingsPage from "./Settings/page";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div className="p-6 text-white">Loading...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar (Desktop) */}
      <div className={`hidden md:flex transition-all duration-300 ${collapsed ? "w-20" : "w-64"}`}>
        <aside className="h-full bg-gray-900 border-r border-gray-800 p-5 flex flex-col">
          <div className="flex items-center mb-10">
            <img src="/realityX logo.png" alt="Logo" className="h-10 w-auto" />
            {!collapsed && (
              <Link href="/" className="text-xl font-bold ml-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
                realityX
              </Link>
            )}
          </div>

          <nav className="flex-1 space-y-2">
            {([
              {
                name: "Dashboard",
                href: "/dashboard",
                icon: (
                  <svg xmlns="http//www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125h9.75a1.125 1.125 0 001.125-1.125V9.75M8.25 21.75h4.5m-4.5 0a2.25 2.25 0 00-2.25-2.25H5.875a2.25 2.25 0 00-2.25 2.25m10.125 0h4.5a2.25 2.25 0 002.25-2.25v-2.25m-10.125 0H14.25m-4.5 0a2.25 2.25 0 012.25-2.25h1.5a2.25 2.25 0 012.25 2.25" />
                  </svg>
                ),
              },
              { name: "New AI Session", href: "/dashboard/new-ai-session", icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 1.5a6 6 0 01-6-6v-1.5m6 7.5v3M18.75 6.75h1.5m-1.5 0v1.5m0-1.5h-1.5m0 0a6 6 0 016-6v-1.5M5.25 6.75H3.75m1.5 0V5.25m0 0a6 6 0 00-6 6v1.5m6 7.5v3M12 1.5v-1.5" />
                 </svg>
              ) },
              { name: "AI Sessions", href: "/dashboard/ai-sessions", icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 1.5a6 6 0 01-6-6v-1.5m6 7.5v3M18.75 6.75h1.5m-1.5 0v1.5m0-1.5h-1.5m0 0a6 6 0 016-6v-1.5M5.25 6.75H3.75m1.5 0V5.25m0 0a6 6 0 00-6 6v1.5m6 7.5v3M12 1.5v-1.5" />
                 </svg>
              ) },
              { name: "Help and Suggestions", href: "/dashboard/help", icon: (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 3h10.5a2.25 2.25 0 002.25-2.25v-6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v6a2.25 2.25 0 002.25 2.25z" />
                 </svg>
              ) },
              { name: "Upgrade", href: "/dashboard/upgrade", icon: (
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 3h10.5a2.25 2.25 0 002.25-2.25v-6a2.25 2.25 0 00-2.25-2.25H6.75A2.25 2.25 0 004.5 4.5v6a2.25 2.25 0 002.25 2.25z" />
                 </svg>
              ) },
              { name: "Settings", href: "#", icon: (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.298.81 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              ), onClick: () => setShowSettings(true) },
            ] as any[]).map((item) => (
              <a
                key={item.name}
                href={item.href}
                onClick={item.onClick}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-all"
              >
                <span>{item.icon}</span>
                {!collapsed && <span>{item.name}</span>}
              </a>
            ))}
          </nav>

          <div className="mt-auto flex flex-row gap-2 items-center">
            {session ? (
              <>
                <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-black font-bold uppercase">
                  {session.user?.email?.charAt(0).toUpperCase()}
                </div>
                {!collapsed && (
                  <Button
                    onClick={() => signOut()}
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-black"
                  >
                    Logout
                  </Button>
                )}
              </>
            ) : (
              <Button onClick={() => router.push("/login")}>Login</Button>
            )}
          </div>
        </aside>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="fixed inset-0 bg-black bg-opacity-60" onClick={() => setMobileOpen(false)} />
            <motion.aside
              className="relative z-50 w-64 bg-gray-800 border-r border-gray-700 p-5"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
            >
              <div className="flex items-center justify-between mb-6">
                <img src="/realityX logo.png" alt="Logo" className="h-10 w-auto" />
                <button onClick={() => setMobileOpen(false)}>
                  <X className="w-6 h-6" />
                </button>
              </div>

              <nav className="space-y-3">
                <Link href="/dashboard" className="block p-2 hover:bg-gray-700 rounded-lg">Dashboard</Link>
                <Link href="/dashboard/new-ai-session" className="block p-2 hover:bg-gray-700 rounded-lg">New AI Session</Link>
                <Link href="/dashboard/ai-sessions" className="block p-2 hover:bg-gray-700 rounded-lg">AI Sessions</Link>
                <Link href="/dashboard/help" className="block p-2 hover:bg-gray-700 rounded-lg">Help and Suggestions</Link>
                <Link href="/dashboard/upgrade" className="block p-2 hover:bg-gray-700 rounded-lg">Upgrade</Link>
                <button
                  onClick={() => setShowSettings(true)}
                  className="block w-full text-left p-2 hover:bg-gray-700 rounded-lg"
                >
                  Settings
                </button>
                 {session ? (
                  <div className="mt-6 border-t border-gray-700 pt-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-9 w-9 flex items-center justify-center rounded-full bg-white text-black font-bold uppercase">
                        {session.user?.email?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm truncate">{session.user?.email}</span>
                    </div>
                    <Button
                      onClick={() => signOut()}
                      variant="outline"
                      className="w-full text-white border-white hover:bg-white hover:text-black"
                    >
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="mt-6 border-t border-gray-700 pt-4">
                    <Button onClick={() => router.push('/login')} className="w-full">Login</Button>
                  </div>
                )}
              </nav>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700 md:hidden">
          <button onClick={() => setMobileOpen(!mobileOpen)}>
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">realityX</h1>
        </div>

        {/* Smooth Page Transitions */}
        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            className="flex-1 overflow-y-auto p-4 md:p-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>

      {showSettings && <SettingsPage />}
    </div>
  );
}














