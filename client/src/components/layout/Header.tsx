import { useState } from 'react';
import { Menu, Bell, Search, SlidersHorizontal, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Filter chip type ── */
interface FilterChip {
  id: string;
  label: string;
  value: string;
}

export interface HeaderProps {
  sidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

function Header({ sidebarCollapsed: _sidebarCollapsed, onMobileMenuToggle }: HeaderProps) {
  void _sidebarCollapsed;
  const [activeView, setActiveView] = useState<'list' | 'board'>('list');
  const [filters, setFilters] = useState<FilterChip[]>([
    { id: '1', label: 'Priority', value: 'Medium' },
  ]);

  const removeFilter = (id: string) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const clearFilters = () => setFilters([]);

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
            <span className="text-[11px] text-text-muted tabular-nums">10</span>
          </div>

          {/* + Filter button */}
          <button className="hidden md:flex items-center gap-1 h-[24px] rounded px-1.5 text-text-muted hover:text-text-tertiary hover:bg-surface-hover transition-colors cursor-pointer border border-dashed border-border-strong/50">
            <SlidersHorizontal className="h-3 w-3" />
            <span className="text-[11px] font-medium">Filter</span>
          </button>
        </div>

        {/* Right: View toggle + Search + Actions */}
        <div className="flex items-center gap-1.5">
          {/* View toggle (List / Board) */}
          <div className="hidden md:flex items-center h-[24px] rounded bg-surface border border-border-strong/50 p-px">
            {(['list', 'board'] as const).map((view) => (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                className={cn(
                  'relative h-[22px] px-2.5 rounded-sm text-[11px] font-medium transition-colors cursor-pointer capitalize',
                  activeView === view
                    ? 'text-text-primary'
                    : 'text-text-muted hover:text-text-tertiary',
                )}
              >
                {activeView === view && (
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

          {/* Search trigger */}
          <button
            className="hidden md:flex items-center gap-2 w-44 h-[24px] bg-surface border border-border-strong/50 rounded px-2 text-[11px] text-text-muted hover:text-text-tertiary hover:border-border-strong transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="h-3 w-3" />
            <span>Find in view…</span>
            <kbd className="ml-auto text-[10px] font-mono text-text-muted">/</kbd>
          </button>

          {/* Mobile search */}
          <button
            className="md:hidden w-7 h-7 rounded flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
            aria-label="Search"
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          {/* Notifications */}
          <button
            className="w-7 h-7 rounded flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors relative cursor-pointer"
            aria-label="Notifications"
          >
            <Bell className="h-3.5 w-3.5" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary" />
          </button>
        </div>
      </div>

      {/* ── Filter Bar (only shows when filters exist) ── */}
      <AnimatePresence>
        {filters.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden border-t border-border"
          >
            <div className="flex items-center gap-1.5 h-[35px] px-3 md:px-4">
              {filters.map((filter) => (
                <motion.div
                  key={filter.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="flex items-center h-[22px] rounded bg-surface-hover border border-border-strong/50 overflow-hidden"
                >
                  <span className="px-1.5 text-[11px] text-text-tertiary flex items-center gap-1">
                    <SlidersHorizontal className="h-2.5 w-2.5" />
                    {filter.label}
                  </span>
                  <span className="text-[11px] text-text-muted px-0.5">is</span>
                  <span className="px-1.5 text-[11px] text-text-secondary font-medium">{filter.value}</span>
                  <button
                    onClick={() => removeFilter(filter.id)}
                    className="h-full px-1 text-text-muted hover:text-text-tertiary hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </motion.div>
              ))}

              {/* Add filter */}
              <button className="h-[22px] px-1.5 rounded text-text-muted hover:text-text-tertiary hover:bg-surface-hover/50 transition-colors cursor-pointer">
                <Plus className="h-3 w-3" />
              </button>

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
