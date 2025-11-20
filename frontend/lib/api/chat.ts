// frontend/lib/api/chat.ts - FIXED

import { getSession } from 'next-auth/react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Get token from NextAuth session (email-based)
async function getAuthToken() {
  const session = await getSession();
  if (!session?.user?.email) {
    throw new Error('No authenticated user');
  }
  return session.user.email; // Using email as token
}

export async function startNewChat(firstMessage: string) {
  try {
    const token = await getAuthToken();
    
    console.log(`📤 Starting new chat with: ${API_BASE}/chat/new`);
    
    const response = await fetch(`${API_BASE}/chat/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ first_message: firstMessage }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      console.error('❌ Error response:', error);
      throw new Error(error.error || error.message || error.detail || 'Failed to start chat');
    }
    
    const data = await response.json();
    console.log('✅ New chat started:', data);
    return data;
  } catch (error) {
    console.error('❌ startNewChat error:', error);
    throw error;
  }
}

export async function sendMessage(conversationId: number, message: string) {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE}/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ conversation_id: conversationId, message }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || error.message || error.detail || 'Failed to send message');
    }
    
    return response.json();
  } catch (error) {
    console.error('❌ sendMessage error:', error);
    throw error;
  }
}

export async function sendMessageStream(conversationId: number, message: string) {
  try {
    const token = await getAuthToken();
    
    const response = await fetch(`${API_BASE}/chat/send/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ conversation_id: conversationId, message }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send message stream');
    }
    
    return response;
  } catch (error) {
    console.error('❌ sendMessageStream error:', error);
    throw error;
  }
}









// // frontend/lib/api/chat.ts

// const API_BASE = process.env.NEXT_PUBLIC_API_URL;

// // Get token from Supabase
// async function getAuthToken() {
//   const { data } = await supabase.auth.getSession();
//   return data.session?.access_token;
// }

// export async function startNewChat(firstMessage: string) {
//   const token = await getAuthToken();
  
//   const response = await fetch(`${API_BASE}/chat/new`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`,
//     },
//     body: JSON.stringify({ first_message: firstMessage }),
//   });
  
//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error.detail);
//   }
  
//   return response.json();
// }

// export async function sendMessage(conversationId: number, message: string) {
//   const token = await getAuthToken();
  
//   const response = await fetch(`${API_BASE}/chat/send`, {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`,
//     },
//     body: JSON.stringify({ conversation_id: conversationId, message }),
//   });
  
//   if (!response.ok) {
//     const error = await response.json();
//     throw new Error(error.detail);
//   }
  
//   return response.json();
// }