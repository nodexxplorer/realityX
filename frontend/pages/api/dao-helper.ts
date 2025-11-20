// pages/api/dao-helper.ts

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message } = await req.json();

  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Invalid message" }, { status: 400 });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: message }],
    });

    return NextResponse.json({
      reply: completion.choices[0]?.message?.content ?? "No response",
    });
  } catch (error) {
    console.error("OpenAI error:", error);
    return NextResponse.json({ error: "OpenAI request failed" }, { status: 500 });
  }
}
