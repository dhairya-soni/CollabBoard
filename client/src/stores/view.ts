import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ViewMode = 'list' | 'board';

interface ViewState {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

export const useViewStore = create<ViewState>()(
  persist(
    (set) => ({
      viewMode: 'list',
      setViewMode: (mode) => set({ viewMode: mode }),
    }),
    { name: 'collabboard-view' },
  ),
);
