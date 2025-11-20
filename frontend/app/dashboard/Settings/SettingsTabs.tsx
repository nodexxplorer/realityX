

// "use client";

// import { useState, useEffect } from "react";
// import { Bell, MessageSquare, AlertCircle, Mail, X } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";

// interface ChatNotification {
//   id: string;
//   type: 'assistance' | 'urgent' | 'new_message';
//   title: string;
//   message: string;
//   chatId: string;
//   timestamp: Date;
//   isRead: boolean;
// }

// export function NotificationBell() {
//   const [showNotifications, setShowNotifications] = useState(false);
//   const [notifications, setNotifications] = useState<ChatNotification[]>([]);

//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const res = await fetch('/api/notifications/chat');
//         if (res.ok) {
//           const data = await res.json();
//           setNotifications(data);
//         }
//       } catch (error) {
//         console.error('Failed to fetch notifications:', error);
//       }
//     };

//     fetchNotifications();

//     // Poll for new notifications every 15 seconds
//     const interval = setInterval(fetchNotifications, 15000);

//     return () => clearInterval(interval);
//   }, []);

//   const unreadCount = notifications.filter(n => !n.isRead).length;

//   const markAsRead = async (id: string) => {
//     try {
//       await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
//       setNotifications(prev => prev.map(n => 
//         n.id === id ? { ...n, isRead: true } : n
//       ));
//     } catch (error) {
//       console.error('Failed to mark as read:', error);
//     }
//   };

//   const markAllAsRead = async () => {
//     try {
//       await fetch('/api/notifications/mark-all-read', { method: 'POST' });
//       setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
//     } catch (error) {
//       console.error('Failed to mark all as read:', error);
//     }
//   };

//   const getNotificationIcon = (type: string) => {
//     switch (type) {
//       case 'assistance':
//         return <MessageSquare className="text-blue-500" size={20} />;
//       case 'urgent':
//         return <AlertCircle className="text-red-500" size={20} />;
//       case 'new_message':
//         return <Mail className="text-green-500" size={20} />;
//       default:
//         return <Bell className="text-gray-500" size={20} />;
//     }
//   };

//   const getNotificationStyle = (type: string) => {
//     switch (type) {
//       case 'urgent':
//         return 'border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20';
//       case 'assistance':
//         return 'border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20';
//       case 'new_message':
//         return 'border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20';
//       default:
//         return 'border-l-4 border-gray-300 dark:border-gray-700';
//     }
//   };

//   const formatTimeAgo = (date: Date) => {
//     const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
//     if (seconds < 60) return 'Just now';
//     if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
//     if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
//     return `${Math.floor(seconds / 86400)}d ago`;
//   };

//   const handleNotificationClick = (notification: ChatNotification) => {
//     markAsRead(notification.id);
//     // Navigate to the specific chat
//     window.location.href = `/dashboard/chat/${notification.chatId}`;
//   };

//   return (
//     <div className="relative">
//       {/* Notification Bell Button */}
//       <button
//         onClick={() => setShowNotifications(!showNotifications)}
//         className="relative p-2 hover:bg-gray-100 dark:hover:bg-zinc-700 rounded-lg transition-colors"
//         aria-label="View notifications"
//       >
//         <Bell size={24} className="text-gray-700 dark:text-gray-300" />
//         {unreadCount > 0 && (
//           <motion.span
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1 font-semibold"
//           >
//             {unreadCount > 9 ? '9+' : unreadCount}
//           </motion.span>
//         )}
//       </button>

//       {/* Notifications Dropdown */}
//       <AnimatePresence>
//         {showNotifications && (
//           <>
//             {/* Backdrop */}
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               className="fixed inset-0 z-40"
//               onClick={() => setShowNotifications(false)}
//             />

//             {/* Dropdown */}
//             <motion.div
//               initial={{ opacity: 0, y: -10, scale: 0.95 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: -10, scale: 0.95 }}
//               transition={{ duration: 0.2 }}
//               className="absolute right-0 mt-2 w-96 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg shadow-xl overflow-hidden z-50"
//             >
//               {/* Header */}
//               <div className="px-4 py-3 border-b border-gray-200 dark:border-zinc-700 flex items-center justify-between">
//                 <div>
//                   <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
//                     Notifications
//                   </h3>
//                   {unreadCount > 0 && (
//                     <p className="text-xs text-gray-500 dark:text-gray-400">
//                       {unreadCount} unread
//                     </p>
//                   )}
//                 </div>
//                 {unreadCount > 0 && (
//                   <button
//                     onClick={markAllAsRead}
//                     className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
//                   >
//                     Mark all read
//                   </button>
//                 )}
//               </div>

//               {/* Notifications List */}
//               <div className="max-h-[400px] overflow-y-auto">
//                 {notifications.length === 0 ? (
//                   <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
//                     <Bell size={48} className="mx-auto mb-2 opacity-50" />
//                     <p>No notifications</p>
//                   </div>
//                 ) : (
//                   <div className="divide-y divide-gray-200 dark:divide-zinc-700">
//                     {notifications.map((notification) => (
//                       <motion.div
//                         key={notification.id}
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         onClick={() => handleNotificationClick(notification)}
//                         className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-zinc-700 cursor-pointer transition-colors ${
//                           getNotificationStyle(notification.type)
//                         } ${!notification.isRead ? 'bg-opacity-100' : 'bg-opacity-0'}`}
//                       >
//                         <div className="flex items-start space-x-3">
//                           <div className="flex-shrink-0 mt-1">
//                             {getNotificationIcon(notification.type)}
//                           </div>
//                           <div className="flex-1 min-w-0">
//                             <div className="flex items-start justify-between">
//                               <p className={`text-sm font-medium text-gray-900 dark:text-white ${
//                                 !notification.isRead ? 'font-semibold' : ''
//                               }`}>
//                                 {notification.title}
//                               </p>
//                               {!notification.isRead && (
//                                 <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></span>
//                               )}
//                             </div>
//                             <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
//                               {notification.message}
//                             </p>
//                             <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
//                               {formatTimeAgo(notification.timestamp)}
//                             </p>
//                           </div>
//                         </div>
//                       </motion.div>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Footer */}
//               {notifications.length > 0 && (
//                 <div className="px-4 py-3 border-t border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-900">
//                   <button
//                     onClick={() => {
//                       setShowNotifications(false);
//                       window.location.href = '/dashboard/notifications';
//                     }}
//                     className="w-full text-center text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline"
//                   >
//                     View All Notifications
//                   </button>
//                 </div>
//               )}
//             </motion.div>
//           </>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// }