import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSocket } from '@/context/SocketContext';
import { useAuthStore } from '@/stores/auth';
import { taskKeys } from './useTasks';
import type {
  TaskMovedPayload,
  TaskUpdatedPayload,
  TaskCreatedPayload,
  TaskDeletedPayload,
  CommentAddedPayload,
} from '@/types/socket';

/**
 * Listens to socket task events and invalidates the TanStack Query cache
 * so the Kanban board reflects changes made by other users in real time.
 */
export function useRealtimeTasks(projectId: string | undefined) {
  const socket = useSocket();
  const queryClient = useQueryClient();
  const currentUserId = useAuthStore((s) => s.user?.id);

  useEffect(() => {
    if (!socket || !projectId) return;

    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    };

    const onTaskMoved = ({ movedBy }: TaskMovedPayload) => {
      if (movedBy === currentUserId) return;
      invalidate();
    };

    const onTaskUpdated = ({ updatedBy }: TaskUpdatedPayload) => {
      if (updatedBy === currentUserId) return;
      invalidate();
    };

    const onTaskCreated = ({ createdBy }: TaskCreatedPayload) => {
      if (createdBy === currentUserId) return;
      invalidate();
    };

    const onTaskDeleted = ({ deletedBy }: TaskDeletedPayload) => {
      if (deletedBy === currentUserId) return;
      invalidate();
    };

    // When someone else adds a comment, refresh the task detail so the
    // comment list updates in the open side panel.
    const onCommentAdded = ({ taskId, addedBy }: CommentAddedPayload) => {
      if (addedBy === currentUserId) return;
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: ['tasks'] }); // update _count
    };

    socket.on('task:moved', onTaskMoved);
    socket.on('task:updated', onTaskUpdated);
    socket.on('task:created', onTaskCreated);
    socket.on('task:deleted', onTaskDeleted);
    socket.on('comment:added', onCommentAdded);

    return () => {
      socket.off('task:moved', onTaskMoved);
      socket.off('task:updated', onTaskUpdated);
      socket.off('task:created', onTaskCreated);
      socket.off('task:deleted', onTaskDeleted);
      socket.off('comment:added', onCommentAdded);
    };
  }, [socket, projectId, queryClient, currentUserId]);
}
