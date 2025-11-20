// app/api/help-requests/[id]/read/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Replace with your actual database update
    // Mark the help request as read
    console.log(`Marking help request ${id} as read`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error marking help request as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark as read' },
      { status: 500 }
    );
  }
}