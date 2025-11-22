// app/api/rate-limit/check/route.ts

import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import { NextRequest, NextResponse } from 'next/server';

const tierAliasMap: Record<string, string> = {
  premuim: 'elite',
  premium: 'elite',
  tier1: 'pro',
  tier_1: 'pro',
  tier2: 'elite',
  tier_2: 'elite',
};

const tierLimitMap: Record<string, number> = {
  free: 5,
  pro: 10,
  elite: 20,
  // premium: 20, // Legacy support
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
    
    // Backend is the source of truth - use its values directly
    // Normalize tier for display purposes only
    const tier = normalizeTier(data.tier);
    const currentCount = data.messages?.used ?? 0;
    const limit = data.messages?.limit ?? tierLimitMap[tier as keyof typeof tierLimitMap] ?? tierLimitMap.free;
    const remaining = data.messages?.remaining ?? Math.max(limit - currentCount, 0);
    
    // Log for debugging (remove in production if needed)
    console.log('Rate limit data from backend:', {
      tier: data.tier,
      normalizedTier: tier,
      messages: data.messages,
      limit,
      remaining
    });
    
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


