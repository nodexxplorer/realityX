
"use client";

import { useState } from "react";
import { X, ArrowLeft } from "lucide-react";
import TabContent from "./TabContent";

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <>
      {/* Desktop Modal - hidden on mobile */}
      <div className="hidden md:flex fixed inset-0 z-50 items-center justify-center bg-black/60">
        <div className="relative bg-zinc-900 w-full max-w-2xl max-h-[90vh] rounded-xl shadow-lg flex flex-col">
          {/* Header */}
          <div className="sticky top-0 flex justify-between items-center bg-zinc-800 px-6 py-4 rounded-t-xl z-10">
            <h2 className="text-xl font-bold">⚙️ Settings</h2>
            <button onClick={onClose} className="text-zinc-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-700">
            {["profile", "preferences", "security", "danger"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 capitalize transition-colors text-sm ${
                  activeTab === tab
                    ? "border-b-2 border-blue-500 text-blue-400"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Animated Tab Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <TabContent activeTab={activeTab} onClose={onClose} />
          </div>
        </div>
      </div>

      {/* Mobile Full Screen - visible only on mobile */}
      <div className="md:hidden fixed inset-0 z-50 bg-zinc-900 flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center bg-zinc-800 px-4 py-4 border-b border-zinc-700">
          <button onClick={onClose} className="text-zinc-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-lg font-bold">⚙️ Settings</h2>
          <div className="w-6" />
        </div>

        {/* Tabs - Horizontal scroll on mobile */}
        <div className="overflow-x-auto border-b border-zinc-700">
          <div className="flex gap-0 px-2 py-2">
            {["profile", "preferences", "security", "danger"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`whitespace-nowrap py-2 px-3 capitalize transition-colors text-xs sm:text-sm rounded-lg ${
                  activeTab === tab
                    ? "bg-blue-600 text-white"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Animated Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <TabContent activeTab={activeTab} onClose={onClose} />
        </div>
      </div>
    </>
  );
}
