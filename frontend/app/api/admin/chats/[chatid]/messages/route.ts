// app/api/admin/chats/[chatId]/messages/route.ts

import { requireAdminAuth } from "@/lib/admin/auth-middleware";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { chatid: string } }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    const chatId = params.chatid;
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    // Check if chat exists
    const chatCheck = await pool.query(
      "SELECT id FROM conversations WHERE id = $1",
      [chatId]
    );

    if (chatCheck.rows.length === 0) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    // Get total message count
    const countResult = await pool.query(
      "SELECT COUNT(*) as count FROM messages WHERE conversation_id = $1",
      [chatId]
    );
    const total = parseInt(countResult.rows[0]?.count || "0");

    // Get paginated messages
    const messagesResult = await pool.query(
      `
      SELECT 
        id,
        role as sender,
        message_text as text,
        created_at as timestamp
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3
      `,
      [chatId, limit, offset]
    );

    const messages = messagesResult.rows.map((row) => ({
      id: row.id,
      sender: row.sender || "user",
      text: row.text,
      timestamp: row.timestamp,
    }));

    return NextResponse.json({
      data: messages,
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}









// // app/api/admin/chats/[chatId]/messages/route.ts

// import { requireAdminAuth } from "@/lib/admin/auth-middleware";
// import pool from "@/lib/db";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(
//   req: NextRequest,
//   { params }: { params: { chatid: string } }
// ) {
//   const auth = await requireAdminAuth();
//   if (auth instanceof Response) return auth;

//   try {
//     const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
//     const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");

//     // Try conversation_id first (as per schema), fallback to chat_id if needed
//     let countQuery = "SELECT COUNT(*) as count FROM messages WHERE conversation_id = $1";
//     let selectQuery = `SELECT id, role as sender, message_text as text, created_at as timestamp 
//        FROM messages 
//        WHERE conversation_id = $1 
//        ORDER BY created_at ASC 
//        LIMIT $2 OFFSET $3`;
    
//     let countResult;
//     let result;
//     let total: number;
//     const offset = (page - 1) * limit;
    
//     try {
//       // Try with conversation_id first
//       countResult = await pool.query(countQuery, [params.chatid]);
//       total = parseInt(countResult.rows[0]?.count || "0");
//       result = await pool.query(selectQuery, [params.chatid, limit, offset]);
//     } catch (err) {
//       // Fallback to chat_id if conversation_id doesn't work
//       console.log("Trying with chat_id instead of conversation_id");
//       countQuery = "SELECT COUNT(*) as count FROM messages WHERE chat_id = $1";
//       selectQuery = `SELECT id, role as sender, COALESCE(message_text, content) as text, created_at as timestamp 
//          FROM messages 
//          WHERE chat_id = $1 
//          ORDER BY created_at ASC 
//          LIMIT $2 OFFSET $3`;
      
//       countResult = await pool.query(countQuery, [params.chatid]);
//       total = parseInt(countResult.rows[0]?.count || "0");
//       result = await pool.query(selectQuery, [params.chatid, limit, offset]);
//     }

//     return NextResponse.json({
//       data: result.rows,
//       total,
//       page,
//       limit,
//       hasMore: offset + limit < total,
//     });
//   } catch (error) {
//     console.error("Get messages error:", error);
//     return NextResponse.json(
//       { error: "Failed to fetch messages" },
//       { status: 500 }
//     );
//   }
// }