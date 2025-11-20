"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage({ params }: { params: { token: string } }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Password updated successfully. Redirecting to login...");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setMessage(data.error || "Failed to reset password.");
      }
    } catch (error) {
      setMessage("Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative bg-gray-950 text-gray-200 p-4">
      <div className="relative z-10 w-full max-w-sm p-8 rounded-3xl bg-gray-800/50 backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">Reset Password</h2>
          <p className="text-gray-400 text-sm mt-1">Enter your new password below.</p>
        </div>

        {message && (
          <div className="text-center text-sm text-red-400 mb-4">{message}</div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg font-semibold text-white transition-colors bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
