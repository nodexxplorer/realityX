// app/api/notifications/chat/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Mock data - replace with your actual database query
    const notifications = [
      {
        id: '1',
        type: 'urgent',
        title: 'Chat marked as urgent',
        message: 'Your support chat has been marked as urgent by an admin',
        chatId: 'chat-123',
        timestamp: new Date(Date.now() - 300000), // 5 min ago
        isRead: false
      },
      {
        id: '2',
        type: 'assistance',
        title: 'Users need assistance',
        message: 'A support agent has joined your chat',
        chatId: 'chat-124',
        timestamp: new Date(Date.now() - 900000), // 15 min ago
        isRead: false
      },
      {
        id: '3',
        type: 'new_message',
        title: 'New messages in chats',
        message: 'You have 3 new messages in your support chat',
        chatId: 'chat-125',
        timestamp: new Date(Date.now() - 1800000), // 30 min ago
        isRead: true
      }
    ];

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}