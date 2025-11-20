// app/api/help-requests/unread/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function GET() {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Replace with your actual database query
    // This is a mock example
    const helpRequests = [
      {
        id: '1',
        title: 'New help request submitted',
        priority: 'high',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        isNew: true
      },
      {
        id: '2',
        title: 'Help request requires attention',
        priority: 'medium',
        timestamp: new Date(Date.now() - 600000), // 10 minutes ago
        isNew: true
      },
      {
        id: '3',
        title: 'High priority request waiting',
        priority: 'high',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        isNew: false
      }
    ];

    return NextResponse.json(helpRequests);
  } catch (error) {
    console.error('Error fetching help requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch help requests' },
      { status: 500 }
    );
  }
}