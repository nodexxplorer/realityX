// // pages/api/ask.ts
// import { NextResponse } from "next/server";
// import { checkUsage } from "@/lib/checkUsage";
// import { auth } from "@/app/api/auth"; // if you're using auth() to get session in App Router

// export async function POST(req: Request) {
//   try {
//     const session = await auth();
//     if (!session?.user) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//     }

//     const { prompt } = await req.json();

//     if (!prompt || typeof prompt !== "string") {
//       return NextResponse.json({ error: "Invalid prompt" }, { status: 400 });
//     }

//     // Optional: Check usage/credits
//     const canProceed = await checkUserUsage(session.user.id);
//     if (!canProceed) {
//       return NextResponse.json({ error: "Usage limit exceeded" }, { status: 403 });
//     }

//     if (!process.env.OPENAI_API_KEY) {
//       return NextResponse.json({ error: "OpenAI API key not set" }, { status: 500 });
//     }

//     const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "gpt-4",
//         messages: [{ role: "user", content: prompt }],
//       }),
//     });

//     if (!openaiRes.ok) {
//       const err = await openaiRes.json();
//       return NextResponse.json({ error: err.error?.message ?? "OpenAI error" }, { status: 500 });
//     }

    // return res.status(200).json({ reply });

import { authOptions } from "./auth/nextauth";
import { getServerSession } from "next-auth/next";
import type { NextApiRequest, NextApiResponse } from "next";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Dummy usage check (replace with your real logic)
async function checkUsage(userId: string): Promise<boolean> {
  // Always allow for now
  return true;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const session = await getServerSession(req, res, authOptions);
    if (!session?.user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { prompt } = req.body;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Invalid prompt" });
    }

    const canProceed = await checkUsage(session.user.id);
    if (!canProceed) {
      return res.status(403).json({ error: "Usage limit exceeded" });
    }

    // Gemini API call
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    return res.status(200).json({ reply });
  } catch (err) {
    console.error("API Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

