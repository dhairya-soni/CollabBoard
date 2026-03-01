import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  createdAt: string;
  _count: { projects: number; members: number };
  owner: { id: string; name: string; avatar: string | null };
}

interface WorkspaceState {
  currentWorkspaceId: string | null;
  setCurrentWorkspace: (id: string) => void;
  clearWorkspace: () => void;
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      currentWorkspaceId: null,
      setCurrentWorkspace: (id) => set({ currentWorkspaceId: id }),
      clearWorkspace: () => set({ currentWorkspaceId: null }),
    }),
    {
      name: 'collabboard-workspace',
    },
  ),
);
