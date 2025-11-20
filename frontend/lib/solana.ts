// lib/solana.ts
import { Connection, PublicKey } from "@solana/web3.js";

// Your treasury wallet (the project’s wallet to receive funds)
const TREASURY_WALLET = new PublicKey(process.env.TREASURY_WALLET!);

// Solana RPC connection (you can use a public one or QuickNode/Helius)
const connection = new Connection("https://api.mainnet-beta.solana.com");

export async function verifyTransaction(
  txSignature: string,
  expectedAmountLamports: number
): Promise<boolean> {
  try {
    const tx = await connection.getTransaction(txSignature, {
      commitment: "confirmed",
    });

    if (!tx) {
      console.error("Transaction not found");
      return false;
    }

    // Check each instruction
    const postBalances = tx.meta?.postBalances || [];
    const preBalances = tx.meta?.preBalances || [];

    // Ensure money landed in treasury
    const accounts = tx.transaction.message.accountKeys.map((a) => a.toBase58());
    const treasuryIndex = accounts.indexOf(TREASURY_WALLET.toBase58());

    if (treasuryIndex === -1) {
      console.error("Treasury not in transaction");
      return false;
    }

    const received = postBalances[treasuryIndex] - preBalances[treasuryIndex];

    if (received >= expectedAmountLamports) {
      return true;
    }

    console.error("Amount mismatch", { received, expectedAmountLamports });
    return false;
  } catch (err) {
    console.error("Verify tx failed:", err);
    return false;
  }
}
