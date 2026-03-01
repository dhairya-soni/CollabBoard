import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Task, TaskDetail, TaskStatus, TaskPriority, ApiResponse } from '@/types/api';

/* ── Keys ── */
export const taskKeys = {
  byProject: (projectId: string, filters?: Record<string, string>) =>
    ['tasks', { projectId, ...filters }] as const,
  detail: (id: string) => ['tasks', id] as const,
};

/* ── List tasks in a project ── */
export function useTasks(
  projectId: string | null,
  filters?: { status?: string; priority?: string; assigneeId?: string },
) {
  return useQuery({
    queryKey: taskKeys.byProject(projectId!, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.status) params.set('status', filters.status);
      if (filters?.priority) params.set('priority', filters.priority);
      if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId);

      const qs = params.toString();
      const url = `/projects/${projectId}/tasks${qs ? `?${qs}` : ''}`;
      const { data } = await api.get<ApiResponse<Task[]>>(url);
      return data.data;
    },
    enabled: !!projectId,
  });
}

/* ── Single task detail ── */
export function useTask(id: string | null) {
  return useQuery({
    queryKey: taskKeys.detail(id!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TaskDetail>>(`/tasks/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

/* ── Create task ── */
export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      body: {
        title: string;
        description?: string;
        status?: TaskStatus;
        priority?: TaskPriority;
        projectId: string;
        assigneeId?: string;
        dueDate?: string;
      },
    ) => {
      const { data } = await api.post<ApiResponse<Task>>('/tasks', body);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/* ── Update task ── */
export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: {
      id: string;
      title?: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assigneeId?: string | null;
      dueDate?: string | null;
    }) => {
      const { data } = await api.patch<ApiResponse<Task>>(`/tasks/${id}`, body);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/* ── Delete task ── */
export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/tasks/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
