"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useEffect, useState } from "react";

export default function UsageDashboard() {
  const { publicKey } = useWallet();
  const [savedWallet, setSavedWallet] = useState<string | null>(null);

  // Fetch saved wallet from PostgreSQL
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

  // Save wallet automatically when connected
  useEffect(() => {
    if (!publicKey) return;
    async function saveWallet() {
      const walletAddress = publicKey!.toBase58();
      await fetch("/api/user/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: walletAddress }),
      });
      setSavedWallet(walletAddress);
    }
    saveWallet();
  }, [publicKey]);

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold mb-4">Profile</h2>

      <div className="mb-4">
        <p className="font-medium">Saved Wallet in DB:</p>
        {savedWallet ? (
          <span className="text-green-600">{savedWallet}</span>
        ) : (
          <span className="text-red-500">No wallet saved yet</span>
        )}
      </div>

      {/* Real Solana wallet connect button */}
      <WalletMultiButton />
    </div>
  );
}

// "use client";

// import { useEffect, useState } from "react";

// export default function UsageDashboard() {
//   const [wallet, setWallet] = useState<string | null>(null);
//   const [loading, setLoading] = useState(true);

//   // Fetch wallet on load
//   useEffect(() => {
//     async function fetchWallet() {
//       try {
//         const res = await fetch("/api/user/wallet", { method: "GET" });
//         if (res.ok) {
//           const data = await res.json();
//           setWallet(data.wallet);
//         } else {
//           setWallet(null);
//         }
//       } catch (err) {
//         console.error("Error fetching wallet:", err);
//       } finally {
//         setLoading(false);
//       }
//     }
//     fetchWallet();
//   }, []);

//   if (loading) return <p>Loading profile...</p>;

//   return (
//     <div className="p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
//       <h2 className="text-xl font-semibold mb-4">Profile</h2>

//       <div className="mb-4">
//         <p className="font-medium">Connected Wallet:</p>
//         {wallet ? (
//           <span className="text-green-600">{wallet}</span>
//         ) : (
//           <span className="text-red-500">No wallet connected</span>
//         )}
//       </div>

//       {/* Button to add/change wallet */}
//       <button
//         onClick={async () => {
//           const newWallet = prompt("Enter your Solana wallet address:");
//           if (!newWallet) return;

//           const res = await fetch("/api/user/wallet", {
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ wallet: newWallet }),
//           });

//           if (res.ok) {
//             setWallet(newWallet);
//             alert("Wallet saved!");
//           } else {
//             alert("Failed to save wallet.");
//           }
//         }}
//         className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//       >
//         {wallet ? "Change Wallet" : "Add Wallet"}
//       </button>
//     </div>
//   );
// }
