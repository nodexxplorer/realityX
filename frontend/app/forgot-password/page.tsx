// app/forgot-password/page.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 🔹 Replace this with API call to your backend
    if (email) {
      setMessage(
        "If a matching account is found, a password reset link has been sent to your email."
      );
    } else {
      setMessage("Please enter your email address.");
    }

    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen relative bg-gray-950 text-gray-200 p-4 font-sans antialiased overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute w-80 h-80 rounded-full bg-purple-600 opacity-20 -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-60 h-60 rounded-full bg-blue-500 opacity-20 bottom-10 right-10 animate-pulse animation-delay-500"></div>
        <div className="absolute w-52 h-52 rounded-full bg-pink-500 opacity-20 top-40 right-1/4 animate-pulse animation-delay-1000"></div>
      </div>

      {/* Forgot Password Card */}
      <div className="relative z-10 w-full max-w-sm p-8 rounded-3xl bg-gray-800/50 backdrop-blur-md border border-white/20 shadow-2xl">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold">Forgot Password?</h2>
          <p className="text-gray-400 text-sm mt-1">
            Enter your email to receive a password reset link.
          </p>
        </div>

        {message && (
          <div className="text-center text-sm text-green-400 mb-4">{message}</div>
        )}

        <form onSubmit={handleResetPassword} className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-gray-700/50 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 border border-transparent focus:border-purple-600 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 rounded-lg font-semibold text-white transition-colors bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        {/* Back to login */}
        <div className="flex items-center justify-center space-x-2 text-sm text-gray-400 mt-6">
          <span>Remembered your password?</span>
          <button
            onClick={() => router.push("/login")}
            className="text-white hover:underline"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}


// import Link from "next/link";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { useState } from "react";


// export default function ForgotPasswordPage() {
//    const [email, setEmail] = useState("");
//   const [sent, setSent] = useState(false);

//   const handleReset = async (e: React.FormEvent) => {
//     e.preventDefault();
//     await fetch("/api/auth/forgot-password", {
//       method: "POST",
//       body: JSON.stringify({ email }),
//     });
//     setSent(true);
//   };


//   return (
//     <div className="flex min-h-screen items-center  relative z-10 justify-center  px-4">
//       <div className="w-full max-w-md rounded-2xl p-8 bg-gray-100 shadow-2xl  backdrop-blur-md bg-white/10 border border-white/20 ">
//         <h1 className="text-2xl font-bold text-center mb-6 text-white">
//           Forgot Password
//         </h1>

//         <form className="space-y-4">
//           <div>
//             <Label htmlFor="email" className=" font-bold
//              text-l " >Enter your email</Label>
//             <Input id="email" type="email" className="mt-2 bg-white text-blue-600 dark:text-blue-400" placeholder="you@example.com" required />
//           </div>

//           <Button className="w-full" type="submit">
//             Send Reset Link
//           </Button>
//         </form>

//         <p className="text-center mt-4 text-sm text-zinc-500 dark:text-zinc-400">
//           <Link href="/login" className="text-blue-600 dark:text-blue-400">Back to login</Link>
//         </p>
//       </div>
//     </div>
//   );
// }
















