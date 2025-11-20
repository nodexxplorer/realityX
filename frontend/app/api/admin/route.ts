// app/api/admin/route.ts

import { requireAdminAuth } from "@/lib/admin/auth-middleware";
import { NextResponse } from "next/server";

export async function GET() {
  const auth = await requireAdminAuth();

  if (auth instanceof NextResponse) {
    return auth;
  }

  return NextResponse.json({
    message: "Welcome Admin!",
    email: auth.email,
    role: auth.role,
    isAdmin: auth.isAdmin,
  });
}













// // app/api/admin/route.ts)


// import { requireAdminAuth } from "@/lib/admin/auth-middleware";

// export async function GET() {
//   const auth = await requireAdminAuth();

//   if (auth instanceof Response) {
//     return auth; // Return error response
//   }

//   return Response.json({ message: "Welcome Admin!", email: auth.email, role: auth.role });
// }