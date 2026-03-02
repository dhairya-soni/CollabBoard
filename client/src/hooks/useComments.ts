import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Comment, ApiResponse } from '@/types/api';
import { taskKeys } from './useTasks';

/* ── Keys ── */
export const commentKeys = {
  byTask: (taskId: string) => ['comments', taskId] as const,
};

/* ── List comments for a task ── */
export function useComments(taskId: string | null) {
  return useQuery({
    queryKey: commentKeys.byTask(taskId!),
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Comment[]>>(`/tasks/${taskId}/comments`);
      return data.data;
    },
    enabled: !!taskId,
  });
}

/* ── Create comment ── */
export function useCreateComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { content: string; taskId: string }) => {
      const { data } = await api.post<ApiResponse<Comment>>('/comments', body);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: commentKeys.byTask(variables.taskId) });
      qc.invalidateQueries({ queryKey: taskKeys.detail(variables.taskId) });
      // Also invalidate task list to update comment counts
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}

/* ── Delete comment ── */
export function useDeleteComment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, taskId }: { id: string; taskId: string }) => {
      await api.delete(`/comments/${id}`);
      return { taskId };
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: commentKeys.byTask(variables.taskId) });
      qc.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
