// // import { NextRequest, NextResponse } from "next/server";

// // export async function POST(req: NextRequest) {
// //   const { wallet, email } = await req.json();

// //   if (!wallet && !email) {
// //     return NextResponse.json({ error: "No credentials provided" }, { status: 400 });
// //   }

// //   // TODO: Replace with real validation/auth lookup
// //   const isValidWallet = wallet && wallet.length > 10;
// //   const isValidEmail = email && email.includes("@");

// //   const is_premium = isValidWallet || isValidEmail;

// //   return NextResponse.json({ is_premium });
// // }


// // app/api/dashboard/verify/route.ts

// import { NextResponse } from "next/server";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { isAdmin } from "@/lib/permissions";

// export async function GET() {
//   const session = await getServerSession(authOptions);
//   const authorized = await isAdmin(session);

//   if (!authorized) {
//     return new NextResponse("Forbidden", { status: 403 });
//   }

//   return NextResponse.json({ admin: true });
// }
