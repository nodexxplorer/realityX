// app/api/admin/token/route.ts
// Returns the current user's session token for API calls

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Return user email as token (backend auth middleware accepts this)
    return NextResponse.json({
      token: session.user.email,
      userId: session.user.id,
    });
  } catch (err) {
    console.error('Token retrieval error:', err);
    return NextResponse.json(
      { error: 'Failed to get token' },
      { status: 500 }
    );
  }
}
