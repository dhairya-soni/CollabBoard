import { useState, useRef, useEffect } from 'react';
import { Menu, Search, SlidersHorizontal, X, Command } from 'lucide-react';
import { NotificationsDropdown } from '@/components/notifications/NotificationsDropdown';
import { useCommandPalette } from '@/context/CommandPaletteContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useViewStore } from '@/stores/view';
import { useFilterStore } from '@/stores/filter';
import {
  statusConfig,
  priorityConfig,
  statusOrder,
  reverseStatusMap,
  type DisplayStatus,
  type DisplayPriority,
} from '@/lib/taskConfig';
import type { TaskPriority } from '@/types/api';

export interface HeaderProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
  taskCount?: number;
}

function Header({ sidebarCollapsed: _sidebarCollapsed, onMobileMenuToggle, taskCount }: HeaderProps) {
  void _sidebarCollapsed;
  const { toggle: openCmdK } = useCommandPalette();
  const { viewMode, setViewMode } = useViewStore();
  const { status, priority, search, setStatus, setPriority, setSearch, clearFilters } = useFilterStore();

  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // "/" keyboard shortcut to open search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === '/' &&
        !e.ctrlKey &&
        !e.metaKey &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setSearchOpen(true);
        setTimeout(() => searchRef.current?.focus(), 50);
      }
      if (e.key === 'Escape' && searchOpen) {
        setSearchOpen(false);
        setSearch('');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [searchOpen, setSearch]);

  // Close filter menu on outside click
  useEffect(() => {
    if (!showFilterMenu) return;
    const handler = () => setShowFilterMenu(false);
    const timer = setTimeout(() => document.addEventListener('click', handler), 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handler);
    };
  }, [showFilterMenu]);

  /* Build active filter chips */
  const chips: { id: string; label: string; value: string; onRemove: () => void }[] = [];
  if (status) {
    const displayKey = Object.entries(reverseStatusMap).find(([, v]) => v === status)?.[0] as
      | DisplayStatus
      | undefined;
    chips.push({
      id: 'status',
      label: 'Status',
      value: displayKey ? statusConfig[displayKey].label : status,
      onRemove: () => setStatus(null),
    });
  }
  if (priority) {
    const displayKey = (['urgent', 'high', 'medium', 'low', 'none'] as DisplayPriority[]).find(
      (k) => k.toUpperCase() === priority,
    );
    chips.push({
      id: 'priority',
      label: 'Priority',
      value: displayKey ? priorityConfig[displayKey].label : priority,
      onRemove: () => setPriority(null),
    });
  }
  if (search) {
    chips.push({
      id: 'search',
      label: 'Search',
      value: search,
      onRemove: () => setSearch(''),
    });
  }

  return (
    <header className="sticky top-0 z-20 bg-background border-b border-border">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between h-[40px] px-3 md:px-4">
        {/* Left: Mobile menu + View title */}
        <div className="flex items-center gap-2">
          <button
            onClick={onMobileMenuToggle}
            className="md:hidden w-7 h-7 rounded flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="h-4 w-4" />
          </button>

          {/* View title */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-text-primary">Active Issues</span>
            {taskCount !== undefined && (
              <span className="text-[11px] text-text-muted tabular-nums">{taskCount}</span>
            )}
          </div>

          {/* + Filter dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowFilterMenu(!showFilterMenu);
              }}
              className="flex items-center gap-1 h-[24px] rounded px-1.5 text-text-muted hover:text-text-tertiary hover:bg-surface-hover transition-colors cursor-pointer border border-dashed border-border-strong/50"
            >
              <SlidersHorizontal className="h-3 w-3" />
              <span className="text-[11px] font-medium">Filter</span>
            </button>

            {/* Filter dropdown menu */}
            <AnimatePresence>
              {showFilterMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 mt-1 w-[200px] bg-surface border border-border-strong rounded-lg shadow-xl shadow-black/20 p-1.5 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Status filter */}
                  <div className="px-2 py-1">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
                      Status
                    </span>
                  </div>
                  {statusOrder.map((s) => {
                    const cfg = statusConfig[s];
                    const Icon = cfg.icon;
                    const apiStatus = reverseStatusMap[s];
                    const isActive = status === apiStatus;
                    return (
                      <button
                        key={s}
                        onClick={() => {
                          setStatus(isActive ? null : apiStatus);
                          setShowFilterMenu(false);
                        }}
                        className={cn(
                          'flex items-center gap-2 w-full h-7 px-2 rounded text-[12px] transition-colors cursor-pointer',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-secondary hover:bg-surface-hover',
                        )}
                      >
                        <Icon className={cn('h-3 w-3', isActive ? 'text-primary' : cfg.color)} />
                        {cfg.label}
                      </button>
                    );
                  })}

                  <div className="border-t border-border my-1" />

                  {/* Priority filter */}
                  <div className="px-2 py-1">
                    <span className="text-[10px] text-text-muted uppercase tracking-wider font-medium">
                      Priority
                    </span>
                  </div>
                  {(['urgent', 'high', 'medium', 'low', 'none'] as DisplayPriority[]).map((p) => {
                    const cfg = priorityConfig[p];
                    const Icon = cfg.icon;
                    const apiPriority = p.toUpperCase() as TaskPriority;
                    const isActive = priority === apiPriority;
                    return (
                      <button
                        key={p}
                        onClick={() => {
                          setPriority(isActive ? null : apiPriority);
                          setShowFilterMenu(false);
                        }}
                        className={cn(
                          'flex items-center gap-2 w-full h-7 px-2 rounded text-[12px] transition-colors cursor-pointer',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-text-secondary hover:bg-surface-hover',
                        )}
                      >
                        <Icon className={cn('h-3 w-3', isActive ? 'text-primary' : cfg.color)} />
                        {cfg.label}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: View toggle + Search + Actions */}
        <div className="flex items-center gap-1.5">
          {/* View toggle (List / Board) */}
          <div className="hidden md:flex items-center h-[24px] rounded bg-surface border border-border-strong/50 p-px">
            {(['list', 'board'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setViewMode(view)}
                className={cn(
                  'relative h-[22px] px-2.5 rounded-sm text-[11px] font-medium transition-colors cursor-pointer capitalize',
                  viewMode === view
                    ? 'text-text-primary'
                    : 'text-text-muted hover:text-text-tertiary',
                )}
              >
                {viewMode === view && (
                  <motion.div
                    layoutId="viewToggle"
                    className="absolute inset-0 bg-surface-hover rounded-sm"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{view}</span>
              </button>
            ))}
          </div>

          {/* Search — expands inline */}
          {searchOpen ? (
            <div className="hidden md:flex items-center gap-1 w-52 h-[24px] bg-surface border border-primary/50 rounded px-2">
              <Search className="h-3 w-3 text-text-muted shrink-0" />
              <input
                ref={searchRef}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tasks…"
                className="flex-1 bg-transparent text-[11px] text-text-primary placeholder:text-text-muted outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setSearchOpen(false);
                    setSearch('');
                  }
                }}
              />
              <button
                onClick={() => {
                  setSearchOpen(false);
                  setSearch('');
                }}
                className="text-text-muted hover:text-text-tertiary cursor-pointer"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setSearchOpen(true);
                setTimeout(() => searchRef.current?.focus(), 50);
              }}
              className="hidden md:flex items-center gap-2 w-44 h-[24px] bg-surface border border-border-strong/50 rounded px-2 text-[11px] text-text-muted hover:text-text-tertiary hover:border-border-strong transition-colors cursor-pointer"
              aria-label="Search"
            >
              <Search className="h-3 w-3" />
              <span>Find in view…</span>
              <kbd className="ml-auto text-[10px] font-mono text-text-muted">/</kbd>
            </button>
          )}

          {/* Mobile search */}
          <button
            className="md:hidden w-7 h-7 rounded flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label="Search"
            onClick={() => {
              setSearchOpen(!searchOpen);
              setTimeout(() => searchRef.current?.focus(), 50);
            }}
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          {/* Cmd+K trigger */}
          <button
            onClick={openCmdK}
            className="hidden md:flex items-center gap-1.5 h-[24px] px-2 bg-surface border border-border-strong/50 rounded text-[11px] text-text-muted hover:text-text-tertiary hover:border-border-strong transition-colors cursor-pointer"
            aria-label="Open command palette"
          >
            <Command className="h-3 w-3" />
            <span>Jump to…</span>
            <kbd className="ml-1 text-[10px] font-mono text-text-muted">⌘K</kbd>
          </button>

          {/* Notifications */}
          <NotificationsDropdown />
        </div>
      </div>

      {/* ── Filter Bar (only shows when filters exist) ── */}
      <AnimatePresence>
        {chips.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="flex items-center gap-1.5 h-[35px] px-3 md:px-4">
              {chips.map((chip) => (
                <motion.div
                  key={chip.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="flex items-center h-[22px] rounded bg-surface-hover border border-border-strong/50 overflow-hidden"
                >
                  <span className="px-1.5 text-[11px] text-text-tertiary flex items-center gap-1">
                    <SlidersHorizontal className="h-2.5 w-2.5" />
                    {chip.label}
                  </span>
                  <span className="text-[11px] text-text-muted px-0.5">is</span>
                  <span className="px-1.5 text-[11px] text-text-secondary font-medium">
                    {chip.value}
                  </span>
                  <button
                    onClick={chip.onRemove}
                    className="h-full px-1 text-text-muted hover:text-text-tertiary hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </motion.div>
              ))}

              {/* Clear all */}
              <button
                onClick={clearFilters}
                className="ml-auto h-[22px] px-2 rounded text-[11px] text-text-muted hover:text-text-tertiary transition-colors cursor-pointer flex items-center gap-1"
              >
                Clear filters
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export { Header };
