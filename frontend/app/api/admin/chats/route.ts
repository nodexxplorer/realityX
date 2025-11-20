// app/api/admin/chats/route.ts

import { requireAdminAuth } from "@/lib/admin/auth-middleware";
import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

function getPaginationParams(req: NextRequest) {
  const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
  return { page: Math.max(1, page), limit: Math.min(100, Math.max(1, limit)) };
}

export async function GET(req: NextRequest) {
  const auth = await requireAdminAuth();
  if (auth instanceof Response) return auth;

  try {
    const { page, limit } = getPaginationParams(req);
    const userId = req.nextUrl.searchParams.get("userId");
    const search = req.nextUrl.searchParams.get("search");

    // Use conversations table (chats table doesn't exist)
    const tableName = 'conversations';

    let query = `SELECT * FROM ${tableName} WHERE 1=1`;
    const params: any[] = [];
    let paramCount = 1;

    if (userId) {
      query += ` AND user_id = $${paramCount++}`;
      params.push(userId);
    }

    if (search) {
      query += ` AND title ILIKE $${paramCount++}`;
      params.push(`%${search}%`);
    }

    const countResult = await pool.query(
      query.replace("SELECT *", "SELECT COUNT(*) as count"),
      params
    );
    const total = parseInt(countResult.rows[0]?.count || "0");

    const offset = (page - 1) * limit;
    query += ` ORDER BY created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get user names - user_id is UUID that references auth_users(id)
    const userIds = result.rows.map(r => r.user_id).filter(Boolean);
    let userMap: any = {};
    if (userIds.length > 0) {
      try {
        // user_id is UUID, so we can directly query auth_users by id
        const uniqueUserIds = [...new Set(userIds)];
        
        // Query all users at once for better performance
        const usersResult = await pool.query(
          `SELECT id::text as id, name, email, nickname 
           FROM auth_users 
           WHERE id = ANY($1::uuid[])`,
          [uniqueUserIds]
        );
        
        usersResult.rows.forEach(u => {
          const displayName = u.name || u.nickname || u.email || 'Unknown';
          // Store by both UUID string and original format for lookup
          const userIdStr = u.id?.toString() || u.id;
          userMap[userIdStr] = displayName;
        });
      } catch (userError) {
        console.error("Error fetching users:", userError);
        // Fallback: try one by one
        try {
          const uniqueUserIds = [...new Set(userIds)];
          for (const userId of uniqueUserIds) {
            try {
              const userResult = await pool.query(
                `SELECT id::text as id, name, email, nickname 
                 FROM auth_users 
                 WHERE id = $1::uuid LIMIT 1`,
                [userId]
              );
              if (userResult.rows.length > 0) {
                const u = userResult.rows[0];
                const displayName = u.name || u.nickname || u.email || 'Unknown';
                const userIdStr = u.id?.toString() || u.id;
                userMap[userIdStr] = displayName;
              }
            } catch (singleUserError) {
              console.log(`Error looking up single user ${userId}:`, singleUserError);
            }
          }
        } catch (fallbackError) {
          console.error("Fallback user lookup error:", fallbackError);
        }
      }
    }

    // Get message counts and generate titles if missing
    const chatIds = result.rows.map(r => r.id);
    let messageCounts: any = {};
    let chatTitles: any = {};
    
    if (chatIds.length > 0) {
      try {
        // Get message counts
        const messageCountResult = await pool.query(
          `SELECT conversation_id, COUNT(*) as count 
           FROM messages 
           WHERE conversation_id = ANY($1::int[])
           GROUP BY conversation_id`,
          [chatIds]
        );
        messageCountResult.rows.forEach(row => {
          messageCounts[row.conversation_id] = parseInt(row.count || '0');
        });

        // Get first messages for titles if title is null
        const titleResult = await pool.query(
          `SELECT DISTINCT ON (conversation_id) 
           conversation_id, message_text 
           FROM messages 
           WHERE conversation_id = ANY($1::int[]) 
           AND role = 'user'
           ORDER BY conversation_id, created_at ASC`,
          [chatIds]
        );
        titleResult.rows.forEach(row => {
          const firstMessage = row.message_text || '';
          // Generate title from first message (first 50 chars)
          const generatedTitle = firstMessage.substring(0, 50).trim();
          if (generatedTitle) {
            chatTitles[row.conversation_id] = generatedTitle;
          }
        });
      } catch (msgError) {
        console.log('Error fetching message counts/titles:', msgError);
      }
    }

    return NextResponse.json({
      data: result.rows.map(chat => {
        const chatId = chat.id;
        // Use title from conversations table, or generated from first message, or default
        const title = chat.title || chatTitles[chatId] || 'Untitled Chat';
        // user_id is UUID, convert to string for lookup (handle both UUID object and string)
        let userIdStr: string;
        if (typeof chat.user_id === 'string') {
          userIdStr = chat.user_id;
        } else if (chat.user_id && typeof chat.user_id.toString === 'function') {
          userIdStr = chat.user_id.toString();
        } else {
          userIdStr = String(chat.user_id || '');
        }
        const userDisplay = userMap[userIdStr] || 'Unknown';
        
        return {
          id: chatId,
          userId: chat.user_id,
          user: userDisplay,
          title: title,
          date: chat.created_at,
          messagesCount: messageCounts[chatId] || 0,
          model: 'gemini-2.5-flash', // Default model since conversations table doesn't have model column
        };
      }),
      total,
      page,
      limit,
      hasMore: offset + limit < total,
    });
  } catch (error) {
    console.error("Get chats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chats" },
      { status: 500 }
    );
  }
}