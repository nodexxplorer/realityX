// app/dashboard/settings/TabContent.tsx

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from 'next-themes';

export default function TabContent({
  activeTab,
  onClose,
}: {
  activeTab: string;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const { theme, systemTheme, setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching user data...");
        const res = await fetch("/api/dashboard");
        console.log("Fetch response status:", res.status);
        
        if (res.ok) {
          const data = await res.json();
          console.log("User data:", data);
          setName(data.user.name || "");
          setNickname(data.user.nickname || "");
          setEmail(data.user.email || "");
        } else {
          const errorData = await res.json();
          console.error("Failed to fetch user data:", errorData);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };
    fetchData();
  }, []);

  const handleUpdate = async () => {
    try {
      console.log("Updating profile with:", { name, nickname, email });
      const res = await fetch("/api/dashboard/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, nickname, email }),
      });
      
      console.log("Update response status:", res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log("Update successful:", data);
        alert("Profile updated!");
        onClose();
      } else {
        const errorData = await res.json();
        console.error("Update failed:", errorData);
        alert("Failed to update profile: " + (errorData.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Update error:", error);
      alert("Failed to update profile: " + error);
    }
  };

  const handleDelete = async () => {
    if (confirm("Are you sure? This action cannot be undone.")) {
      await fetch("/api/dashboard/delete", { method: "DELETE" });
      window.location.href = "/";
    }
  };

  useEffect(() => {
    // initialize darkMode from theme resolver
    const current = resolvedTheme || (theme === 'system' ? systemTheme : theme);
    setDarkMode(current === 'dark');
  }, [resolvedTheme, theme, systemTheme]);

  const handleToggleDark = () => {
    const newDark = !darkMode;
    setDarkMode(newDark);
    setTheme(newDark ? 'dark' : 'light');
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.25 }}
        className="space-y-4"
      >
        {/* Profile */}
        {activeTab === "profile" && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Account Info</h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-zinc-700 bg-zinc-800 p-2 rounded text-white"
              placeholder="Full Name"
            />
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border border-zinc-700 bg-zinc-800 p-2 rounded text-white"
              placeholder="Nickname"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-zinc-700 bg-zinc-800 p-2 rounded text-white"
              placeholder="Email"
            />
            <button
              onClick={handleUpdate}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Preferences */}
        {activeTab === "preferences" && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Preferences</h3>
            <div className="flex items-center justify-between">
              <span>Dark Mode</span>
              <input
                type="checkbox"
                checked={darkMode}
                onChange={handleToggleDark}
                className="w-5 h-5"
                aria-label="Toggle dark mode"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>Notifications</span>
              <input
                type="checkbox"
                checked={notifications}
                onChange={() => setNotifications(!notifications)}
                className="w-5 h-5"
              />
            </div>
          </div>
        )}

        {/* Security */}
        {activeTab === "security" && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Security</h3>
            <p className="text-sm text-zinc-400">
              Reset your password or enable 2FA here.
            </p>
            <button className="bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-white">
              Reset Password
            </button>
            <button className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white">
              Enable 2FA
            </button>
          </div>
        )}

        {/* Danger Zone */}
        {activeTab === "danger" && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-red-400">Danger Zone</h3>
            <p className="text-sm text-zinc-400">
              Deleting your account is irreversible.
            </p>
            <button
              onClick={handleDelete}
              className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
            >
              Delete Account
            </button>
         
            <h3 className="text-lg font-semibold">Logout</h3>
            <p className="text-sm text-zinc-400">
              You will be logged out of your account.
            </p>
            <button
              onClick={() => {
                fetch("/api/auth/signout", { method: "POST" }).then(() => {
                  window.location.href = "/";
                });
              }}
              className="w-full bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
            >
              Log Out
            </button>
           </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
