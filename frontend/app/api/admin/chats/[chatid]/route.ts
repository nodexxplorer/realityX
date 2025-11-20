// app/api/admin/chats/[chatId]/route.ts

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
    // Get conversation from conversations table
    const chatResult = await pool.query(
      "SELECT * FROM conversations WHERE id = $1 LIMIT 1",
      [params.chatid]
    );

    if (!chatResult.rows.length) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    const chat = chatResult.rows[0];

    // Get user - user_id is UUID
    let userResult;
    try {
      userResult = await pool.query(
        "SELECT id::text as id, name, email, nickname FROM auth_users WHERE id = $1::uuid LIMIT 1",
        [chat.user_id]
      );
    } catch (err) {
      console.error("Error fetching user:", err);
      userResult = { rows: [] };
    }

    // Get message count
    let messageCount = 0;
    try {
      const countResult = await pool.query(
        "SELECT COUNT(*) as count FROM messages WHERE conversation_id = $1",
        [chat.id]
      );
      messageCount = parseInt(countResult.rows[0]?.count || '0');
    } catch (err) {
      console.error("Error fetching message count:", err);
    }

    // Generate title from first message if title is null
    let title = chat.title;
    if (!title) {
      try {
        const firstMessageResult = await pool.query(
          "SELECT message_text FROM messages WHERE conversation_id = $1 AND role = 'user' ORDER BY created_at ASC LIMIT 1",
          [chat.id]
        );
        if (firstMessageResult.rows.length > 0) {
          const firstMessage = firstMessageResult.rows[0].message_text || '';
          title = firstMessage.substring(0, 50).trim() || 'Untitled Chat';
        } else {
          title = 'Untitled Chat';
        }
      } catch (err) {
        console.error("Error fetching first message:", err);
        title = 'Untitled Chat';
      }
    }

    return NextResponse.json({
      id: chat.id,
      userId: chat.user_id,
      user: userResult.rows[0]?.name || userResult.rows[0]?.nickname || userResult.rows[0]?.email || 'Unknown',
      title: title,
      date: chat.created_at,
      messagesCount: messageCount,
      model: 'gemini-2.5-flash', // Default since conversations table doesn't have model column
    });
  } catch (error) {
    console.error("Get chat error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatid: string } }
) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    const result = await pool.query(
      "DELETE FROM conversations WHERE id = $1 RETURNING id",
      [params.chatid]
    );

    if (!result.rows.length) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    );
  }
}
