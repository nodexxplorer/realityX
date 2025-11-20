// app/api/proposals/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db, daoProposals } from "@/lib/db";
import { NextResponse } from "next/server";
import { z } from "zod";

// Zod schema for proposal
const ProposalSchema = z.object({
  title: z.string().min(3, "Title too short"),
  description: z.string().min(10, "Description too short"),
  voteStart: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid start date" }),
  voteEnd: z.string().refine(val => !isNaN(Date.parse(val)), { message: "Invalid end date" }),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = ProposalSchema.parse(body);

    const [proposal] = await db.insert(daoProposals).values({
      title: parsed.title,
      description: parsed.description,
      createdBy: session.user.id,
      voteStart: new Date(parsed.voteStart),
      voteEnd: new Date(parsed.voteEnd),
    }).returning();

    return NextResponse.json(proposal);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", issues: err.errors }, { status: 400 });
    }

    console.error("Proposal creation failed", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export function GET() {
  return NextResponse.json({ error: "GET not supported on this route" }, { status: 405 });
}
