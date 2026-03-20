import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, LayoutDashboard, FolderKanban, Settings,
  LayoutGrid, Hash, ArrowRight, BarChart2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { useProjects } from '@/hooks/useProjects';
import { useWorkspaceStore } from '@/stores/workspace';

interface PaletteItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  group: string;
  action: () => void;
  keywords?: string;
}

export function CommandPalette() {
  const { open, setOpen } = useCommandPalette();
  const navigate = useNavigate();
  const workspaceId = useWorkspaceStore((s) => s.currentWorkspaceId);
  const { data: projects } = useProjects(workspaceId);

  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  const go = (path: string) => { navigate(path); setOpen(false); };

  const allItems = useMemo<PaletteItem[]>(() => {
    const nav: PaletteItem[] = [
      { id: 'dash',      label: 'Dashboard',  icon: <LayoutDashboard className="h-3.5 w-3.5" />, group: 'Navigate', action: () => go('/') },
      { id: 'projects',  label: 'Projects',   icon: <FolderKanban    className="h-3.5 w-3.5" />, group: 'Navigate', action: () => go('/projects') },
      { id: 'analytics', label: 'Analytics',  icon: <BarChart2       className="h-3.5 w-3.5" />, group: 'Navigate', action: () => go('/analytics') },
      { id: 'settings',  label: 'Settings',   icon: <Settings        className="h-3.5 w-3.5" />, group: 'Navigate', action: () => go('/settings') },
    ];

    const projectItems: PaletteItem[] = (projects ?? []).map((p) => ({
      id: `proj-${p.id}`,
      label: p.name,
      description: `${p._count.tasks} tasks · ${p.status}`,
      icon: <Hash className="h-3.5 w-3.5 text-primary" />,
      group: 'Projects',
      keywords: p.name.toLowerCase(),
      action: () => go(`/projects/${p.id}`),
    }));

    const whiteboardItems: PaletteItem[] = (projects ?? []).map((p) => ({
      id: `wb-${p.id}`,
      label: `${p.name} — Whiteboard`,
      icon: <LayoutGrid className="h-3.5 w-3.5 text-violet-400" />,
      group: 'Whiteboards',
      keywords: `${p.name.toLowerCase()} whiteboard`,
      action: () => go(`/projects/${p.id}/whiteboard`),
    }));

    return [...nav, ...projectItems, ...whiteboardItems];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects]);

  const filtered = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q) ||
        item.keywords?.includes(q),
    );
  }, [allItems, query]);

  // Regroup
  const groups = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    for (const item of filtered) {
      if (!map.has(item.group)) map.set(item.group, []);
      map.get(item.group)!.push(item);
    }
    return map;
  }, [filtered]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setCursor((c) => Math.min(c + 1, filtered.length - 1));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setCursor((c) => Math.max(c - 1, 0));
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        filtered[cursor]?.action();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, filtered, cursor]);

  // Scroll selected item into view
  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>('[data-selected="true"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  let globalIdx = -1;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[520px] mx-4 bg-surface border border-border-strong rounded-xl shadow-2xl shadow-black/40 overflow-hidden"
          >
            {/* Search input */}
            <div className="flex items-center gap-2.5 px-4 h-13 border-b border-border">
              <Search className="h-4 w-4 text-text-muted shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => { setQuery(e.target.value); setCursor(0); }}
                placeholder="Search or jump to…"
                className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-muted outline-none py-3.5"
              />
              <kbd className="text-[10px] text-text-muted border border-border-strong rounded px-1.5 py-0.5 font-mono">ESC</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[360px] overflow-y-auto py-1.5">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-text-muted">
                  <Search className="h-5 w-5 mb-2 opacity-40" />
                  <p className="text-[13px]">No results for &ldquo;{query}&rdquo;</p>
                </div>
              ) : (
                Array.from(groups.entries()).map(([group, items]) => (
                  <div key={group}>
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                      {group}
                    </div>
                    {items.map((item) => {
                      globalIdx++;
                      const idx = globalIdx;
                      const isSelected = cursor === idx;
                      return (
                        <button
                          key={item.id}
                          data-selected={isSelected}
                          onClick={item.action}
                          onMouseEnter={() => setCursor(idx)}
                          className={cn(
                            'flex items-center gap-3 w-full h-10 px-3 text-left transition-colors',
                            isSelected ? 'bg-primary/10' : 'hover:bg-surface-hover',
                          )}
                        >
                          <span className={cn('shrink-0', isSelected ? 'text-primary' : 'text-text-muted')}>
                            {item.icon}
                          </span>
                          <span className="flex-1 min-w-0">
                            <span className={cn('text-[13px] font-medium', isSelected ? 'text-primary' : 'text-text-primary')}>
                              {item.label}
                            </span>
                            {item.description && (
                              <span className="ml-2 text-[11px] text-text-muted">{item.description}</span>
                            )}
                          </span>
                          {isSelected && <ArrowRight className="h-3.5 w-3.5 text-primary shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>

            {/* Footer hint */}
            <div className="flex items-center gap-3 px-4 h-9 border-t border-border text-[10px] text-text-muted">
              <span><kbd className="font-mono">↑↓</kbd> navigate</span>
              <span><kbd className="font-mono">↵</kbd> select</span>
              <span><kbd className="font-mono">Esc</kbd> close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
