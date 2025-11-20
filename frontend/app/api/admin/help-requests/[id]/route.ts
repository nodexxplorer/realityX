// app/api/admin/help-requests/[id]/route.ts


import { requireAdminAuth } from "@/lib//admin/auth-middleware";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    const result = await pool.query(
      "SELECT * FROM help_requests WHERE id = $1",
      [params.id]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Get help request error:", error);
    return NextResponse.json(
      { error: "Failed to fetch request" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json();
    const { response, status, priority } = body;

    const result = await pool.query(
      `UPDATE help_requests 
       SET response = COALESCE($1, response),
           status = COALESCE($2, status),
           priority = COALESCE($3, priority),
           updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [response || null, status || null, priority || null, params.id]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    // Log admin action
    await pool.query(
      `INSERT INTO admin_logs (admin_email, action, reason, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [auth.email, "update_help_request", `Updated request ${params.id}`]
    );

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Update help request error:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    const body = await req.json();
    const { status, priority } = body;

    const updateFields = [];
    const updateValues = [];
    let paramCount = 1;

    if (status) {
      updateFields.push(`status = $${paramCount++}`);
      updateValues.push(status);
    }

    if (priority) {
      updateFields.push(`priority = $${paramCount++}`);
      updateValues.push(priority);
    }

    updateFields.push(`updated_at = NOW()`);

    const result = await pool.query(
      `UPDATE help_requests 
       SET ${updateFields.join(", ")}
       WHERE id = $${paramCount}
       RETURNING *`,
      [...updateValues, params.id]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Patch help request error:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    const result = await pool.query(
      "DELETE FROM help_requests WHERE id = $1 RETURNING id",
      [params.id]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Request deleted successfully" });
  } catch (error) {
    console.error("Delete help request error:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}