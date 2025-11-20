// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { X } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import TabContent from "./TabContent";

// export default function SettingsDrawerMobile() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState("profile");

//   return (
//     <AnimatePresence>
//       <motion.div
//         initial={{ y: "100%" }}
//         animate={{ y: 0 }}
//         exit={{ y: "100%" }}
//         transition={{ type: "spring", stiffness: 120, damping: 20 }}
//         className="fixed inset-x-0 bottom-0 z-50 h-[90vh] bg-zinc-900 rounded-t-3xl shadow-2xl flex flex-col"
//       >
//         {/* Drag handle */}
//         <div className="flex justify-center py-2">
//           <div className="w-12 h-1.5 bg-zinc-600 rounded-full" />
//         </div>

//         {/* Header */}
//         <div className="flex justify-between items-center px-6 py-3 border-b border-zinc-700">
//           <h1 className="text-lg font-bold text-white">⚡ Settings</h1>
//           <button
//             onClick={() => router.back()}
//             className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700"
//           >
//             <X size={20} className="text-zinc-400" />
//           </button>
//         </div>

//         {/* Tabs */}
//         <div className="flex justify-around py-2 border-b border-zinc-700 text-sm font-medium">
//           {["profile", "preferences", "security", "danger"].map((tab) => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`capitalize px-3 py-1 rounded-lg transition-all ${
//                 activeTab === tab
//                   ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md"
//                   : "text-zinc-400 hover:text-white"
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {/* Tab Content */}
//         <div className="flex-1 overflow-y-auto p-6">
//           <TabContent activeTab={activeTab} onClose={() => router.back()} />
//         </div>
//       </motion.div>
//     </AnimatePresence>
//   );
// }
