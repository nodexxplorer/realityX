// components/WalletConnect.tsx


'use client';

import { useEffect, useState } from 'react';
import { PublicKey } from '@solana/web3.js';

declare global {
  interface Window {
    solana?: any;
  }
}

export default function WalletConnect() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  // Check for Phantom and auto-connect if already approved
  useEffect(() => {
    const checkIfWalletIsConnected = async () => {
      try {
        const { solana } = window;
        if (solana && solana.isPhantom) {
          const response = await solana.connect({ onlyIfTrusted: true });
          setWalletAddress(response.publicKey.toString());
        }
      } catch (err) {
        console.error('Wallet connection error', err);
      }
    };

    checkIfWalletIsConnected();
  }, []);

  const connectWallet = async () => {
    try {
      const { solana } = window;
      if (solana) {
        const response = await solana.connect();
        setWalletAddress(response.publicKey.toString());
      } else {
        alert('Phantom Wallet not found. Install it first.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      {walletAddress ? (
        <div className="text-green-600 font-bold">
          ✅ Connected: {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)}
        </div>
      ) : (
        <button
          onClick={connectWallet}
          className="bg-purple-700 hover:bg-purple-800 text-white px-4 py-2 rounded shadow"
        >
          🔌 Connect Phantom Wallet
        </button>
      )}
    </div>
  );
}
