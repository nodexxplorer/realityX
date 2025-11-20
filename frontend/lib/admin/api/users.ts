// (lib/admin/api/users.ts)

import { apiClient } from './client';
import { User, PaginatedResponse } from './types';

interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

export const userApi = {
  getUsers: async (params: GetUsersParams) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params }),

  getUserById: async (userId: string) =>
    apiClient.get<User>(`/users/${userId}`),

  banUser: async (userId: string, reason?: string) =>
    apiClient.post(`/users/${userId}/ban`, { reason }),

  unbanUser: async (userId: string) =>
    apiClient.post(`/users/${userId}/unban`, {}),

  promoteUser: async (userId: string) =>
    apiClient.post(`/users/${userId}/promote`, {}),

  deleteUser: async (userId: string) =>
    apiClient.delete(`/users/${userId}`),

  updateUser: async (userId: string, data: Partial<User>) =>
    apiClient.put(`/users/${userId}`, data),
};