// lib/admin/hooks/useUsers.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../api/users';

interface UseUsersOptions {
  page?: number;
  limit?: number;
  role?: string;
  status?: string;
  search?: string;
}

export const useUsers = (options: UseUsersOptions = {}) => {
  // Create a stable query key by spreading individual values
  const queryKey = [
    'users',
    {
      page: options.page ?? 1,
      limit: options.limit ?? 10,
      role: options.role ?? null,
      status: options.status ?? null,
      search: options.search ?? null,
    },
  ];

  return useQuery({
    queryKey,
    queryFn: () => userApi.getUsers(options),
    staleTime: 5 * 60 * 1000,
  });
};

export const useUserById = (userId: string) =>
  useQuery({
    queryKey: ['users', userId],
    queryFn: () => userApi.getUserById(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

export const useBanUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      userApi.banUser(userId, reason),
    onSuccess: () => {
      // Invalidate all users queries to refetch with current filters
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const usePromoteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userApi.promoteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => userApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
};









// // lib/admin/hooks/useUsers.ts)

// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { userApi } from '../api/users';  // ✅ CORRECT RELATIVE PATH

// interface UseUsersOptions {
//   page?: number;
//   limit?: number;
//   role?: string;
//   status?: string;
//   search?: string;
// }

// export const useUsers = (options: UseUsersOptions = {}) =>
//   useQuery({
//     queryKey: ['users', options],
//     queryFn: () => userApi.getUsers(options),
//     staleTime: 5 * 60 * 1000,
//   });

// export const useUserById = (userId: string) =>
//   useQuery({
//     queryKey: ['users', userId],
//     queryFn: () => userApi.getUserById(userId),
//     enabled: !!userId,
//     staleTime: 5 * 60 * 1000,
//   });

// export const useBanUserMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
//       userApi.banUser(userId, reason),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['users'] });
//     },
//   });
// };

// export const usePromoteUserMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (userId: string) => userApi.promoteUser(userId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['users'] });
//     },
//   });
// };

// export const useDeleteUserMutation = () => {
//   const queryClient = useQueryClient();
//   return useMutation({
//     mutationFn: (userId: string) => userApi.deleteUser(userId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['users'] });
//     },
//   });
// };