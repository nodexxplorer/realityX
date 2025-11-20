

// // app/api/dashboard/generate/route.ts

// import { NextRequest } from "next/server";
// import { generateAIResponse } from "@/lib/ai";
// import { getServerSession } from "next-auth";
// import { authOptions } from "@/lib/auth";
// import { isUsageAllowed } from "@/lib/usageLimiter";
// import { logUsage } from "@/lib/helpers";

// export const runtime = "edge";

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session) return new Response("Unauthorized", { status: 401 });

//   const { id, is_premium } = session.user;
//   const body = await req.json();

//   if (!body || !Array.isArray(body.messages)) {
//     return new Response("Invalid request body", { status: 400 });
//   }

//   const allowed = await isUsageAllowed(id, is_premium);
//   if (!allowed) {
//     return new Response("Free limit reached. Upgrade to premium.", { status: 402 });
//   }

//   await logUsage(id, "dashboard_ai");

//   return generateAIResponse(body.messages);
// }
