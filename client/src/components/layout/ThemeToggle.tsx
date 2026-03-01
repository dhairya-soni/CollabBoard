import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

function ThemeToggle({ collapsed = false }: { collapsed?: boolean }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        'flex items-center gap-2.5 h-[28px] rounded px-2 text-[13px] font-medium text-text-muted hover:text-text-tertiary hover:bg-surface-hover/50 transition-all duration-150 cursor-pointer w-full',
        collapsed && 'justify-center px-0 w-8 mx-auto',
      )}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? (
        <Sun className="h-[15px] w-[15px] shrink-0" />
      ) : (
        <Moon className="h-[15px] w-[15px] shrink-0" />
      )}
      {!collapsed && (
        <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
      )}
    </button>
  );
}

export { ThemeToggle };
