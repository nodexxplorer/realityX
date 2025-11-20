// // lib/admin/api/session.ts
// // Server-side session management for admin API
// // Handles getting the JWT token from NextAuth session

// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// /**
//  * Get JWT token from NextAuth session (server-side only)
//  * This is called from server components or API routes
//  */
// export async function getAdminToken(): Promise<string | null> {
//   if (typeof window !== 'undefined') {
//     // Client-side: Use sessionStorage fallback or make API call
//     return null;
//   }

//   try {
//     const session = await getServerSession(authOptions);
    
//     if (!session?.user?.id) {
//       console.warn('No session found');
//       return null;
//     }

//     // Return user email as token (matches backend auth middleware)
//     // Backend will verify this is a valid user via get_user_by_email()
//     return session.user.email || null;
//   } catch (err) {
//     console.error('Failed to get admin token:', err);
//     return null;
//   }
// }

// /**
//  * Get token in browser context (for client components)
//  * Makes a request to a server action or API route
//  */
// export async function getClientToken(): Promise<string | null> {
//   if (typeof window === 'undefined') {
//     return getAdminToken();
//   }

//   try {
//     const res = await fetch('/api/admin/token', {
//       method: 'GET',
//       credentials: 'include', // Include cookies
//     });

//     if (!res.ok) return null;

//     const { token } = await res.json();
//     return token || null;
//   } catch (err) {
//     console.error('Failed to fetch client token:', err);
//     return null;
//   }
// }
