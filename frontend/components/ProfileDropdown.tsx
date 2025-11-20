"use client";

import { useState, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useWallet, WalletMultiButton } from "@solana/wallet-adapter-react";
import Link from "next/link";

export default function ProfileDropdown() {
  const { data: session } = useSession();
  const { publicKey, disconnect } = useWallet();
  const [savedWallet, setSavedWallet] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  // Fetch wallet from DB
  useEffect(() => {
    async function fetchWallet() {
      const res = await fetch("/api/user/wallet", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setSavedWallet(data.wallet);
      }
    }
    fetchWallet();
  }, []);

  // Disconnect wallet
  const handleDisconnect = async () => {
    await fetch("/api/user/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ wallet: null }),
    });
    setSavedWallet(null);
    disconnect();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="px-3 py-2 bg-gray-800 text-white rounded-md"
      >
        {session?.user?.name || "Profile"}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-md p-4 z-50">
          <p className="font-semibold">{session?.user?.name}</p>
          <p className="text-sm text-gray-500">{session?.user?.email}</p>

          <div className="mt-3">
            <p className="font-medium text-gray-700 mb-1">Solana Wallet:</p>
            {savedWallet ? (
              <div className="flex items-center justify-between">
                <span className="text-green-600 text-sm">{savedWallet}</span>
                <button
                  onClick={handleDisconnect}
                  className="text-red-600 text-sm hover:underline"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <WalletMultiButton />
            )}
          </div>

          <div className="mt-4 border-t pt-3">
            <Link
              href="/dashboard"
              className="block px-2 py-1 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Dashboard
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-2 w-full px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
