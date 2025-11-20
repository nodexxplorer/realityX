// app/login/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
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
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Redirect authenticated users
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const role = (session.user as any).role ?? 2;
      
      // Redirect based on role
      if (role === 4) {
        router.push("/admin");
      } else if (role === 3) {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    }
  }, [status, session, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setMessage(result.error);
        setLoading(false);
        return;
      }

      // Success - useEffect will handle redirect
    } catch (error) {
      setMessage("An unexpected error occurred");
      setLoading(false);
    }
  };

  // Phantom wallet setup
  const endpoint = "https://api.devnet.solana.com";
  const wallets = [new PhantomWalletAdapter()];

  // Show loading while checking auth
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-950">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen relative bg-gray-950 text-gray-200 p-4">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute w-80 h-80 rounded-full bg-purple-600 opacity-20 -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-60 h-60 rounded-full bg-blue-500 opacity-20 bottom-10 right-10 animate-pulse"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm p-8 rounded-3xl bg-gray-800/50 backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
        </div>

        {message && (
          <div className="text-center text-sm text-red-400 mb-4 p-3 bg-red-900/20 rounded-lg border border-red-500/50">
            {message}
          </div>
        )}

        {/* Google Login */}
        <button
          onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          className="w-full flex items-center justify-center px-4 py-3 mb-4 bg-gray-700/50 rounded-lg text-white font-semibold hover:bg-gray-700 transition"
        >
          <img
            src="https://www.svgrepo.com/show/355037/google.svg"
            alt="Google logo"
            className="w-5 h-5 mr-3"
          />
          Continue with Google
        </button>

        {/* Email + Password Login */}
        <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 pr-10 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
            >
              {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 transition"
          >
            {loading ? "Logging in..." : "Log in with Email"}
          </button>
        </form>

        {/* Phantom Wallet Connect */}
        <div className="mb-6 flex justify-center items-center">
          <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                <WalletMultiButton className="w-full px-4 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600" />
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-400 text-sm mt-6">
          Don't have an account?{" "}
          <a href="/signup" className="text-white hover:underline">
            Sign Up
          </a>
          <br />
          <a href="/forgot-password" className="text-white hover:underline mt-1 block">
            Forgot Password?
          </a>
        </div>
      </div>
    </div>
  );
}

