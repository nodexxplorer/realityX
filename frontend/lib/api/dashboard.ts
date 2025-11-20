// frontend/lib/api/dashboard.ts - FIXED

import { getSession } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Get token from NextAuth session (email-based)
async function getAuthToken() {
  const session = await getSession();
  if (!session?.user?.email) {
    throw new Error('No authenticated user');
  }
  return session.user.email; // Using email as token (as per your backend)
}

export interface DashboardStats {
  conversations: {
    total: number;
    today: number;
  };
  messages: {
    total: number;
    today: number;
  };
  hours: {
    total: number;
    today: number;
  };
  growth: number;
  cost: {
    total: number;
  };
}

export interface WeeklyActivity {
  date: string;
  conversations: number;
  messages: number;
}

export interface MonthlyBreakdown {
  this_month: {
    conversations: number;
    messages: number;
    tokens: number;
    cost: number;
  };
  last_month: {
    conversations: number;
    messages: number;
    tokens: number;
    cost: number;
  };
}

export interface UsageStatsBackend {
  messagesUsed: number;
  messagesLimit: number;
  tokensUsed: number;
  tokensLimit: number;
  subscriptionType: 'free' | 'premium';
  subscriptionEndsAt: string | null;
  streakDays: number;
  activeDaysThisMonth: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const token = await getAuthToken();
    
    console.log(`🔍 Fetching dashboard stats from: ${API_BASE}/dashboard/stats`);
    console.log(`📧 Using token: ${token}`);
    
    const response = await fetch(`${API_BASE}/dashboard/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      console.error('❌ Error response:', error, response.status);
      throw new Error(error.error || error.message || `HTTP ${response.status}: Failed to fetch dashboard stats`);
    }
    
    const data = await response.json();
    console.log('✅ Dashboard stats loaded:', data);
    return data;
  } catch (error) {
    console.error('❌ getDashboardStats error:', error);
    throw error;
  }
}

export async function getWeeklyActivity(): Promise<WeeklyActivity[]> {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE}/dashboard/activity/weekly`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch weekly activity');
    }
    
    const data = await response.json();
    return data.activity || [];
  } catch (error) {
    console.error('❌ getWeeklyActivity error:', error);
    throw error;
  }
}

export async function getMonthlyBreakdown(): Promise<MonthlyBreakdown> {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE}/dashboard/activity/monthly`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch monthly breakdown');
    }
    
    return response.json();
  } catch (error) {
    console.error('❌ getMonthlyBreakdown error:', error);
    throw error;
  }
}

export async function getUsageStats(): Promise<UsageStatsBackend> {
  try {
    const token = await getAuthToken();

    const response = await fetch(`${API_BASE}/dashboard/usage-stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      console.error('❌ Error response (usage-stats):', error, response.status);
      throw new Error(error.error || error.message || `HTTP ${response.status}: Failed to fetch usage stats`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ getUsageStats error:', error);
    throw error;
  }
}

export async function startSession(): Promise<{ session_id: number }> {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE}/dashboard/session/start`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to start session');
    }
    
    return response.json();
  } catch (error) {
    console.error('❌ startSession error:', error);
    throw error;
  }
}

export async function endSession(sessionId: number): Promise<void> {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE}/dashboard/session/end/${sessionId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      console.warn('Failed to end session, but continuing');
    }
  } catch (error) {
    console.error('⚠️ endSession error (non-critical):', error);
  }
}








// // frontend/lib/api/dashboard.ts

// const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// async function getAuthToken() {
//   const { data } = await supabase.auth.getSession();
//   return data.session?.access_token;
// }

// export interface DashboardStats {
//   conversations: {
//     total: number;
//     today: number;
//   };
//   messages: {
//     total: number;
//     today: number;
//   };
//   hours: {
//     total: number;
//     today: number;
//   };
//   growth: number;
//   cost: {
//     total: number;
//   };
// }

// export interface WeeklyActivity {
//   date: string;
//   conversations: number;
//   messages: number;
// }

// export interface MonthlyBreakdown {
//   this_month: {
//     conversations: number;
//     messages: number;
//     tokens: number;
//     cost: number;
//   };
//   last_month: {
//     conversations: number;
//     messages: number;
//     tokens: number;
//     cost: number;
//   };
// }

// export async function getDashboardStats(): Promise<DashboardStats> {
//   const token = await getAuthToken();
  
//   const response = await fetch(`${API_BASE}/dashboard/stats`, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//     },
//   });
  
//   if (!response.ok) {
//     throw new Error('Failed to fetch dashboard stats');
//   }
  
//   return response.json();
// }

// export async function getWeeklyActivity(): Promise<WeeklyActivity[]> {
//   const token = await getAuthToken();
  
//   const response = await fetch(`${API_BASE}/dashboard/activity/weekly`, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//     },
//   });
  
//   if (!response.ok) {
//     throw new Error('Failed to fetch weekly activity');
//   }
  
//   const data = await response.json();
//   return data.activity;
// }

// export async function getMonthlyBreakdown(): Promise<MonthlyBreakdown> {
//   const token = await getAuthToken();
  
//   const response = await fetch(`${API_BASE}/dashboard/activity/monthly`, {
//     headers: {
//       'Authorization': `Bearer ${token}`,
//     },
//   });
  
//   if (!response.ok) {
//     throw new Error('Failed to fetch monthly breakdown');
//   }
  
//   return response.json();
// }

// export async function startSession(): Promise<{ session_id: number }> {
//   const token = await getAuthToken();
  
//   const response = await fetch(`${API_BASE}/dashboard/session/start`, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${token}`,
//     },
//   });
  
//   if (!response.ok) {
//     throw new Error('Failed to start session');
//   }
  
//   return response.json();
// }

// export async function endSession(sessionId: number): Promise<void> {
//   const token = await getAuthToken();
  
//   await fetch(`${API_BASE}/dashboard/session/end/${sessionId}`, {
//     method: 'POST',
//     headers: {
//       'Authorization': `Bearer ${token}`,
//     },
//   });
// }