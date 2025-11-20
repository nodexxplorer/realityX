// app/api/rate-limit/check.ts

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { NextRequest, NextResponse } from 'next/server';

const tierAliasMap: Record<string, string> = {
  premuim: 'premium',
  tier1: 'pro',
  tier_1: 'pro',
  tier2: 'premium',
  tier_2: 'premium',
};

const tierLimitMap: Record<string, number> = {
  free: 5,
  pro: 10,
  premium: 20,
};

const normalizeTier = (tier?: string) => {
  if (!tier) return 'free';
  const normalized = tier.toLowerCase();
  return tierAliasMap[normalized] || normalized;
};

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call backend API to get rate limit info
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${backendUrl}/rate-limit/check`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.user.email}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch rate limit from backend');
    }

    const data = await response.json();
    const tier = normalizeTier(data.tier);
    const currentCount = data.messages?.used ?? 0;
    const tierLimit = tierLimitMap[tier as keyof typeof tierLimitMap] ?? tierLimitMap.free;
    const limit = data.messages?.limit ?? tierLimit;
    const remaining = data.messages?.remaining ?? Math.max(limit - currentCount, 0);
    
    // Transform backend response to match frontend interface
    return NextResponse.json({
      user_id: session.user.email,
      tier,
      current_count: currentCount,
      limit,
      remaining,
      reset_time: data.reset_at || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      allowed: remaining > 0,
    });
  } catch (error) {
    console.error('Rate limit check error:', error);
    // Return default values on error
    return NextResponse.json({
      user_id: '',
      tier: 'free',
      current_count: 0,
      limit: 5,
      remaining: 5,
      reset_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      allowed: true,
    });
  }
}
