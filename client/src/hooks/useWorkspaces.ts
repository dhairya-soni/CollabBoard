import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Workspace,
  WorkspaceDetail,
  ApiResponse,
} from '@/types/api';

/* ── Keys ── */
export const workspaceKeys = {
  all: ['workspaces'] as const,
  detail: (id: string) => ['workspaces', id] as const,
};

/* ── List workspaces for current user ── */
export function useWorkspaces() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Workspace[]>>('/workspaces');
      return data.data;
    },
  });
}

/* ── Single workspace with members ── */
export function useWorkspace(id: string | null) {
  return useQuery({
    queryKey: workspaceKeys.detail(id!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<WorkspaceDetail>>(`/workspaces/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/* ── Create workspace ── */
export function useCreateWorkspace() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; slug: string }) => {
      const { data } = await api.post<ApiResponse<Workspace>>('/workspaces', body);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: workspaceKeys.all }),
  });
}

/* ── Add member by email ── */
export function useAddMember(workspaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { email: string; role?: 'ADMIN' | 'MEMBER' }) => {
      const { data } = await api.post(`/workspaces/${workspaceId}/members`, body);
      return data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId!) }),
  });
}

/* ── Remove member ── */
export function useRemoveMember(workspaceId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/workspaces/${workspaceId}/members/${userId}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: workspaceKeys.detail(workspaceId!) }),
  });
}
