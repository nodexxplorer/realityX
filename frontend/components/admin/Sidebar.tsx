// 1. SIDEBAR (components/admin/Sidebar.tsx)

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, Users, MessageSquare, BarChart3, Settings, List, HelpCircle, 
   ChevronLeft, X 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/chats', label: 'Chats', icon: MessageSquare },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
  { href: '/admin/logs', label: 'Logs', icon: List },
  { href: '/admin/help', label: 'Help & Suggestions', icon: HelpCircle },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const isActive = (href: string) => {
    if (!pathname) return false;
    return pathname === href || pathname.startsWith(href + '/');
  };

  const sidebarVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: -280, opacity: 0 },
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={isOpen || isDesktop ? 'open' : 'closed'}
        variants={sidebarVariants}
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col z-40 transition-all duration-300 ${
          isCollapsed && 'md:w-20'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <motion.h1
            animate={{ opacity: isCollapsed ? 0 : 1 }}
            className="text-xl font-bold"
          >
            Admin
          </motion.h1>
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={20} />
          </button>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:block p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link 
                key={item.href} 
                href={item.href} 
                onClick={() => {
                  // Only close sidebar on mobile
                  if (!isDesktop) {
                    onClose();
                  }
                }}
              >
                <motion.div
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                    active
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  whileHover={{ x: 4 }}
                >
                  <Icon size={20} />
                  <motion.span
                    animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                    className="overflow-hidden whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
          <motion.p animate={{ opacity: isCollapsed ? 0 : 1 }}>
            v1.0.0
          </motion.p>
        </div>
      </motion.div>
    </>
  );
}