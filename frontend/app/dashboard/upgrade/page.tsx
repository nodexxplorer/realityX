// app/dashboard/upgrade/page.tsx - CORRECTED UPGRADE FLOW

"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { PublicKey, SystemProgram, Transaction, Connection } from "@solana/web3.js";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";

const TREASURY_WALLET = process.env.NEXT_PUBLIC_TREASURY_WALLET!;
const PLAN_PRICES: Record<"pro" | "elite", number> = {
  pro: 0.05 * 1e9, // 0.05 SOL
  elite: 0.25 * 1e9, // 0.25 SOL
};

type PlanType = "free" | "pro" | "elite";

const ELITE_PLAN: PlanType = "elite";

const planAliasMap: Record<string, PlanType> = {
  free: "free",
  pro: "pro",
  tier1: "pro",
  tier_1: "pro",
  premium: "elite",
  premuim: "elite",
  tier2: "elite",
  tier_2: "elite",
  elite: "elite",
};

const normalizePlan = (plan?: string | null): PlanType => {
  if (!plan) return "free";
  const normalized = planAliasMap[plan.toLowerCase()];
  return normalized ?? "free";
};

type PlanCardProps = {
  title: string;
  price: string;
  description?: string;
  features: string[];
  tier: PlanType;
  isPopular?: boolean;
  isCurrent?: boolean;
  isProcessing?: boolean;
  onSelect: (tier: PlanType) => void;
};

const PlanCard: React.FC<PlanCardProps> = ({
  title,
  price,
  description,
  features,
  tier,
  isPopular,
  isCurrent,
  isProcessing,
  onSelect,
}) => (
  <div
    className={`relative flex flex-col rounded-2xl p-6 shadow-xl w-full max-w-sm border-2 transition-all duration-300
    ${isCurrent ? "border-green-500 bg-green-950/20" : "border-gray-800 bg-gray-900"}
    ${isPopular ? "border-purple-500" : ""} transform hover:scale-105`}
  >
    {isPopular && (
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-lg">
        ⭐ Most Popular
      </div>
    )}

    {isCurrent && (
      <div className="absolute top-4 right-4 flex items-center bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
        ✓ Current Plan
      </div>
    )}

    <div className="text-center mb-6">
      <h3 className="text-2xl font-bold text-white">{title}</h3>
      <p className="text-white text-3xl font-extrabold mt-2">{price}</p>
      {description && <p className="text-sm text-gray-400 mt-2">{description}</p>}
    </div>

    <div className="flex-1 space-y-3">
      {features.map((feature, i) => (
        <div key={i} className="flex items-center space-x-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-5 w-5 ${isCurrent ? "text-green-500" : "text-gray-500"}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-10.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-gray-300">{feature}</span>
        </div>
      ))}
    </div>

    <div className="mt-8">
      <button
        disabled={isCurrent || isProcessing}
        onClick={() => onSelect(tier)}
        className={`w-full py-3 rounded-lg font-bold text-white transition-colors duration-300
          ${isCurrent
            ? "bg-gray-600 cursor-not-allowed"
            : isPopular
            ? "bg-purple-600 hover:bg-purple-700"
            : "bg-blue-600 hover:bg-blue-700"}`}
      >
        {isCurrent 
          ? "Your Current Plan" 
          : isProcessing 
          ? "Processing..." 
          : "Select Plan"}
      </button>
    </div>
  </div>
);

declare global {
  interface Window {
    solana?: any;
  }
}

export default function UpgradePage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [currentPlan, setCurrentPlan] = useState<PlanType>("free");
  const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
  const [expiry, setExpiry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentStep, setPaymentStep] = useState<"select" | "payment" | "confirm">("select");
  const [txSignature, setTxSignature] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string>("");
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Check for wallet connection on load
  useEffect(() => {
    const checkWallet = async () => {
      try {
        const { solana } = window;
        if (solana && solana.isPhantom) {
          const response = await solana.connect({ onlyIfTrusted: true });
          setWalletAddress(response.publicKey.toString());
        }
      } catch (err) {
        // Wallet not connected or not approved
      }
    };
    checkWallet();
  }, []);
   // Phantom wallet setup
   const endpoint = "https://api.devnet.solana.com";
   const wallets = [new PhantomWalletAdapter()];
 

  // Fetch current plan on load
  useEffect(() => {
    if (session?.user?.email) {
      fetchCurrentPlan();
    }
  }, [session]);

  const fetchCurrentPlan = async () => {
    try {
      const res = await fetch("/api/dashboard/upgrade/plan");
      if (res.ok) {
        const data = await res.json();
        setCurrentPlan(normalizePlan(data.plan));
        setExpiry(data.expiry);
      }
    } catch (err) {
      console.error("Failed to fetch plan:", err);
    }
  };

  // Step 1: User selects a tier
  const handleSelectPlan = (tier: PlanType) => {
    if (tier === currentPlan) return;
    if (tier === "free") return;
    
    setSelectedPlan(tier);
    setPaymentStep("payment");
    setError("");
    setTxSignature("");
    setSuccessMessage("");
  };

  // Step 2: User sends SOL and enters transaction signature
  const handleConfirmPayment = async () => {
    if (!txSignature.trim()) {
      setError("Please enter the transaction signature");
      return;
    }

    if (!selectedPlan) {
      setError("No plan selected");
      return;
    }

    setLoading(true);
    setError("");

    try {
      console.log(`💰 Processing payment for plan: ${selectedPlan}`);
      console.log(`📝 Transaction signature: ${txSignature}`);

      // Call backend to verify and record upgrade
      const response = await fetch("/api/dashboard/upgrade/upgrade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: selectedPlan,
          txSignature: txSignature.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("❌ Upgrade failed:", data);
        setError(data.error || "Failed to upgrade subscription");
        return;
      }

      console.log("✅ Upgrade successful:", data);
      setSuccessMessage("✅ Upgrade successful! Your account has been updated.");
      setPaymentStep("confirm");
      
      // Refresh plan from database to ensure we have the latest tier
      await fetchCurrentPlan();
      
      // Redirect after 3 seconds
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 3000);
    } catch (err) {
      console.error("❌ Error:", err);
      setError("An error occurred during upgrade");
    } finally {
      setLoading(false);
    }
  };


  const sendTransaction = async () => {
    if (!walletAddress || !selectedPlan || selectedPlan === "free") {
      setError("Please connect your wallet and select a paid plan");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const { solana } = window;
      if (!solana) {
        setError("Phantom Wallet not found");
        return;
      }

      const amount = PLAN_PRICES[selectedPlan];
      const treasuryPubkey = new PublicKey(TREASURY_WALLET);
      const rpcEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com";
      const connection = new Connection(rpcEndpoint, "confirmed");

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: treasuryPubkey,
          lamports: amount,
        })
      );

      // Get recent blockhash
      const { blockhash } = await connection.getRecentBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = new PublicKey(walletAddress);

      // Sign and send transaction
      const { signature } = await solana.signAndSendTransaction(transaction);
      
      // Convert signature to base58 string if needed
      const signatureString = typeof signature === 'string' 
        ? signature 
        : Buffer.from(signature).toString('base64');

      setTxSignature(signatureString);
      
      // Automatically confirm payment after transaction
      setTimeout(() => {
        handleConfirmPayment();
      }, 1000);
    } catch (err: any) {
      console.error("Transaction error:", err);
      if (err.code === 4001) {
        setError("Transaction rejected");
      } else {
        setError(err.message || "Failed to send transaction");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setPaymentStep("select");
    setSelectedPlan(null);
    setTxSignature("");
    setError("");
    setSuccessMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 font-sans antialiased">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Wallet Connection Section */}
        
            <div className="mb-6 flex justify-center gap-2 items-center">
            <ConnectionProvider endpoint={endpoint}>
              <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                  <WalletMultiButton className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" />
                </WalletModalProvider>
              </WalletProvider>
            </ConnectionProvider>
            
        <p className="mt-2 text-sm text-gray-400">Wallet connection is required to proceed.</p>
        </div>

        <div className="mb-6 flex justify-center gap-2 items-center">
        <Button
          className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-pink-500 hover:to-purple-600 transition-colors duration-300 text-white px-6 py-3 rounded-xl text-lg"
          onClick={() => alert("Token upgrade flow coming soon!")}
          >
          Upgrade with NX Token 🔐
        </Button>
          </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-white">Unlock More Power</h1>
          <p className="text-gray-400 mt-2 text-lg">Choose the plan that's right for you</p>
        </div>

        {/* Step 1: Select Plan */}
        {paymentStep === "select" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 justify-items-center">
            <PlanCard
              title="Free Account"
              price="Included"
              features={["50 AI Credits/Month", "3 Active Proposals", "Community Voting Access"]}
              tier="free"
              isCurrent={currentPlan === "free"}
              onSelect={handleSelectPlan}
            />

            <PlanCard
              title="Tier 1 Premium"
              price="0.05 SOL / month"
              description="Unlock Essential Tools"
              features={[
                "500 AI Credits/Month",
                "Unlimited Proposals",
                "Priority Voting",
                "Advanced Analytics Lite",
                "Exclusive Templates",
              ]}
              tier="pro"
              isPopular
              isCurrent={currentPlan === "pro"}
              isProcessing={loading}
              onSelect={handleSelectPlan}
            />

            <PlanCard
              title="Tier 2 Elite"
              price="0.25 SOL / month"
              description="Experience Maximum Control"
              features={[
                "Unlimited AI Credits",
                "Full Analytics Dashboard",
                "Custom Template Creation",
                "Dedicated Support",
                "Image Upload & Analysis",
              ]}
              tier={ELITE_PLAN}
              isCurrent={currentPlan === ELITE_PLAN}
              isProcessing={loading}
              onSelect={handleSelectPlan}
            />
          </div>
        </>
      )}

        {/* Step 2: Payment Instructions */}
        {paymentStep === "payment" && selectedPlan && (
          <div className="max-w-2xl mx-auto bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-white mb-6">
            Upgrade to {selectedPlan === "pro" ? "Tier 1 Premium" : "Tier 2 Elite"}
          </h2>

          {/* Payment Info */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Amount to Send</p>
                <p className="text-2xl font-bold text-white">
                  {selectedPlan === "pro" ? "0.05" : "0.25"} SOL
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Billing Period</p>
                <p className="text-xl font-bold text-white">30 days</p>
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Send SOL to this wallet address:
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 bg-gray-900 p-3 rounded text-xs text-purple-400 break-all">
                {TREASURY_WALLET}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(TREASURY_WALLET);
                  alert("Wallet address copied!");
                }}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded transition-colors"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Transaction Options */}
          {walletAddress ? (
            <div className="mb-6">
              <button
                onClick={sendTransaction}
                disabled={loading}
                className="w-full px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-4"
              >
                {loading ? "Sending Transaction..." : `Send ${selectedPlan === "pro" ? "0.05" : "0.25"} SOL from Wallet`}
              </button>
              <div className="text-center text-sm text-gray-400 mb-4">OR</div>
            </div>
          ) : null}

          {/* Transaction Signature Input */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              {walletAddress 
                ? "Or paste the transaction signature if you sent manually:"
                : "After sending, paste the transaction signature below:"}
            </label>
            <textarea
              value={txSignature}
              onChange={(e) => setTxSignature(e.target.value)}
              placeholder="Enter your Solana transaction signature (starts with a long string of characters)"
              className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-purple-500 focus:outline-none font-mono text-sm"
              rows={4}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
              <p className="text-red-300 text-sm">❌ {error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-gray-700 hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={loading || !txSignature.trim()}
              className="flex-1 px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? "Processing..." : "Confirm Payment"}
            </button>
          </div>
        </div>
      )}

        {/* Step 3: Success Message */}
        {paymentStep === "confirm" && (
          <div className="max-w-2xl mx-auto bg-green-900/20 border border-green-500/50 rounded-xl p-8 shadow-lg text-center">
          <div className="text-5xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-300 mb-2">Upgrade Successful!</h2>
          <p className="text-gray-300 mb-6">
            Your subscription has been activated. You now have access to all elite features.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Redirecting to dashboard in 3 seconds...
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-semibold rounded-lg transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      )}

        {/* Current Plan Info */}
        {paymentStep === "select" && (
          <div className="mt-12 max-w-2xl mx-auto p-4 bg-zinc-800 rounded-xl text-center">
          <p className="text-lg">
            Current Plan: <span className="font-semibold capitalize">{currentPlan}</span>
          </p>
          {expiry && (
            <p className="text-sm text-zinc-400">
              Expiry: {new Date(expiry).toLocaleDateString()}
            </p>
          )}

          {currentPlan !== "free" && (
            <button
              onClick={async () => {
                if (confirm("Cancel your subscription?")) {
                  const res = await fetch("/api/dashboard/upgrade/cancel", { method: "POST" });
                  if (res.ok) {
                    alert("✅ Subscription cancelled.");
                    fetchCurrentPlan();
                  } else {
                    alert("❌ Failed to cancel subscription.");
                  }
                }
              }}
              className="mt-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Cancel Subscription
            </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}