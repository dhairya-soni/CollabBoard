import { create } from 'zustand';
import type { TaskStatus, TaskPriority } from '@/types/api';

export interface FilterState {
  status: TaskStatus | null;
  priority: TaskPriority | null;
  search: string;
  setStatus: (status: TaskStatus | null) => void;
  setPriority: (priority: TaskPriority | null) => void;
  setSearch: (search: string) => void;
  clearFilters: () => void;
  hasActiveFilters: () => boolean;
}

export const useFilterStore = create<FilterState>()((set, get) => ({
  status: null,
  priority: null,
  search: '',
  setStatus: (status) => set({ status }),
  setPriority: (priority) => set({ priority }),
  setSearch: (search) => set({ search }),
  clearFilters: () => set({ status: null, priority: null, search: '' }),
  hasActiveFilters: () => {
    const s = get();
    return s.status !== null || s.priority !== null || s.search.length > 0;
  },
}));
