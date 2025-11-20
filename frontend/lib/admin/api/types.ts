// 3. API TYPES (lib/api/types.ts)

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Moderator';
  is_premium: boolean;
  status: 'active' | 'banned' | 'deleted';
  lastActive: string;
  createdAt: string;
}

export interface Chat {
  id: string;
  userId: string;
  user: string;
  title: string;
  date: string;
  messagesCount: number;
  model: string;
}

export interface Messages {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface AnalyticsData {
  date: string;
  usage: number;
  tokens: number;
  errors: number;
  users: number;
}

export interface Log {
  id: string;
  timestamp: string;
  type: 'error' | 'warning' | 'admin' | 'info';
  message: string;
  userId?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface HelpRequest {
  id: string;
  userId: string;
  type: 'help' | 'suggestion' | 'bug' | 'feedback';
  subject: string;
  message: string;
  status: 'open' | 'in-progress' | 'resolved' | 'closed';
  response?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HelpRequestPaginated {
  data: HelpRequest[];
  total: number;
  page: number;
  limit: number;
}