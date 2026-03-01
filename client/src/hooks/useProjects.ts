import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Project, ApiResponse } from '@/types/api';

/* ── Keys ── */
export const projectKeys = {
  byWorkspace: (wsId: string) => ['projects', { workspaceId: wsId }] as const,
  detail: (id: string) => ['projects', id] as const,
};

/* ── List projects in a workspace ── */
export function useProjects(workspaceId: string | null) {
  return useQuery({
    queryKey: projectKeys.byWorkspace(workspaceId!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project[]>>(
        `/workspaces/${workspaceId}/projects`,
      );
      return data.data;
    },
    enabled: !!workspaceId,
  });
}

/* ── Single project ── */
export function useProject(id: string | null) {
  return useQuery({
    queryKey: projectKeys.detail(id!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/* ── Create project ── */
export function useCreateProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { name: string; description?: string; workspaceId: string }) => {
      const { data } = await api.post<ApiResponse<Project>>('/projects', body);
      return data.data;
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: projectKeys.byWorkspace(vars.workspaceId) });
    },
  });
}

/* ── Delete project ── */
export function useDeleteProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/projects/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
