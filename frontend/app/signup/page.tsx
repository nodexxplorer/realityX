// app/signup/page.tsx

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeOffIcon, AlertCircle, CheckCircle } from "lucide-react";

const SignupPage = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    // Validate terms agreed
    if (!agreedToTerms) {
      setError("Please agree to the Terms and Conditions to continue");
      setLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Check your email to verify your account.");
        // Clear form
        setName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setAgreedToTerms(false);
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative bg-gray-950 text-gray-200 p-4 font-sans antialiased overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute w-80 h-80 rounded-full bg-purple-600 opacity-20 -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-60 h-60 rounded-full bg-blue-500 opacity-20 bottom-10 right-10 animate-pulse"></div>
        <div className="absolute w-52 h-52 rounded-full bg-pink-500 opacity-20 top-40 right-1/4 animate-pulse"></div>
      </div>

      {/* Signup Card */}
      <div className="relative z-10 w-full max-w-sm p-8 rounded-3xl bg-gray-800/50 backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">Create Account.</h2>
          <p className="text-gray-400 text-sm mt-1">
            Join the community and start creating
          </p>
        </div>

        {/* Success Message */}
        {message && (
          <div className="text-center text-sm text-green-400 mb-4 p-3 bg-green-900/20 rounded-lg border border-green-500/50 flex items-start gap-2">
            <CheckCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-center text-sm text-red-400 mb-4 p-3 bg-red-900/20 rounded-lg border border-red-500/50 flex items-start gap-2">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Name Input */}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 border border-transparent focus:border-purple-600 transition-colors"
          />

          {/* Email Input */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 border border-transparent focus:border-purple-600 transition-colors"
          />

          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 8 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 border border-transparent focus:border-purple-600 transition-colors pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
            >
              {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
            </button>
          </div>

          {/* Confirm Password Input */}
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              className="w-full px-4 py-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 border border-transparent focus:border-purple-600 transition-colors pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white focus:outline-none"
            >
              {showConfirmPassword ? (
                <EyeOffIcon size={18} />
              ) : (
                <EyeIcon size={18} />
              )}
            </button>
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-lg border border-gray-600/50">
            <input
              type="checkbox"
              id="terms"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="w-4 h-4 mt-1 rounded border-gray-500 text-purple-600 focus:ring-purple-600 cursor-pointer"
            />
            <label
              htmlFor="terms"
              className="text-xs text-gray-300 cursor-pointer flex-1 leading-relaxed"
            >
              I agree to the{" "}
              <a
                href="/terms-and-conditions"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline transition"
              >
                Terms and Conditions
              </a>
              {" "}and{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-400 hover:text-purple-300 underline transition"
              >
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            disabled={loading || !agreedToTerms}
            className={`w-full px-4 py-3 rounded-lg font-semibold text-white transition-colors ${
              agreedToTerms
                ? "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                : "bg-gray-600 cursor-not-allowed opacity-50"
            }`}
          >
            {loading ? "Signing up..." : "Sign up with Email"}
          </button>
        </form>

        {/* Footer Links */}
        <div className="text-center text-gray-400 text-sm mt-6">
          Already have an account?{" "}
          <a href="/login" className="text-white hover:underline">
            Log in
          </a>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

