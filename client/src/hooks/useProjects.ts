import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Project, ProjectMember, ApiResponse } from '@/types/api';

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

/* ── Toggle project privacy ── */
export function useUpdateProject(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { isPrivate?: boolean; name?: string; description?: string; status?: string }) => {
      const { data } = await api.patch<ApiResponse<Project>>(`/projects/${projectId}`, body);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/* ── Add project member by email ── */
export function useAddProjectMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { email: string; role?: 'ADMIN' | 'MEMBER' | 'VIEWER' }) => {
      const { data } = await api.post<ApiResponse<ProjectMember>>(`/projects/${projectId}/members`, body);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/* ── Change project member role ── */
export function useChangeProjectMemberRole(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'ADMIN' | 'MEMBER' | 'VIEWER' }) => {
      const { data } = await api.patch<ApiResponse<ProjectMember>>(
        `/projects/${projectId}/members/${userId}`,
        { role },
      );
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

/* ── Remove project member ── */
export function useRemoveProjectMember(projectId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(`/projects/${projectId}/members/${userId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
      qc.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}
