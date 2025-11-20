// app/verify/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  const token = searchParams?.get("token"); 

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link.");
      return;
    }

    const verifyAccount = async () => {
      try {
        const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (res.ok) {
          setStatus("success");
          setMessage("Your account has been verified successfully!");
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.error || "Verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Something went wrong. Please try again.");
      }
    };

    verifyAccount();
  }, [token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-white p-4">
      <div className="w-full max-w-md p-8 bg-zinc-800 rounded-lg shadow-lg text-center space-y-4">
        {status === "loading" && <p className="text-lg animate-pulse">Verifying your account...</p>}
        {status === "success" && (
          <>
            <h2 className="text-2xl font-bold text-green-400">✅ Verified!</h2>
            <p>{message}</p>
            <p className="text-sm text-zinc-400">Redirecting to your dashboard...</p>
          </>
        )}
        {status === "error" && (
          <>
            <h2 className="text-2xl font-bold text-red-400">❌ Error</h2>
            <p>{message}</p>
          </>
        )}
      </div>
    </div>
  );
}























// "use client";

// import { useEffect, useState } from "react";
// import { useRouter, useSearchParams } from "next/navigation";

// export default function VerifyPage() {
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token");


//   const [status, setStatus] = useState<"loading" | "success" | "error">(
//     "loading"
//   );
//   const [message, setMessage] = useState("");

//   useEffect(() => {
//     if (!token) {
//       setStatus("error");
//       setMessage("Invalid verification link.");
//       return;
//     }

//     const verifyAccount = async () => {
//       try {
//         const res = await fetch(`/api/auth/verify?token=${encodeURIComponent(token)}`);
//         const data = await res.json();

//         if (res.ok) {
//           setStatus("success");
//           setMessage("Your account has been verified successfully!");
//           // Redirect to dashboard after 2s
//           setTimeout(() => {
//             router.push("/dashboard");
//           }, 2000);
//         } else {
//           setStatus("error");
//           setMessage(data.error || "Verification failed.");
//         }
//       } catch (err) {
//         setStatus("error");
//         setMessage("Something went wrong. Please try again.");
//       }
//     };

//     verifyAccount();
//   }, [token, router]);

//   return (
//     <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-white p-4">
//       <div className="w-full max-w-md p-8 bg-zinc-800 rounded-lg shadow-lg text-center space-y-4">
//         {status === "loading" && (
//           <p className="text-lg animate-pulse">Verifying your account...</p>
//         )}

//         {status === "success" && (
//           <>
//             <h2 className="text-2xl font-bold text-green-400">✅ Verified!</h2>
//             <p>{message}</p>
//             <p className="text-sm text-zinc-400">
//               Redirecting to your dashboard...
//             </p>
//           </>
//         )}

//         {status === "error" && (
//           <>
//             <h2 className="text-2xl font-bold text-red-400">❌ Error</h2>
//             <p>{message}</p>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
