// lib/wallet.ts

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { Connection, PublicKey, clusterApiUrl } from "@solana/web3.js";

// export const SOLANA_NETWORK: WalletAdapterNetwork = "devnet
export const SOLANA_NETWORK = WalletAdapterNetwork.Devnet;
export const RPC_URL = clusterApiUrl(SOLANA_NETWORK);
export const connection = new Connection(RPC_URL, "confirmed");

export async function getWalletBalance(publicKey: string): Promise<number> {
  const pk = new PublicKey(publicKey);
  const lamports = await connection.getBalance(pk);
  return lamports / 1_000_000_000;
}
