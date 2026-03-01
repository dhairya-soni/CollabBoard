import React from 'react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

export interface DropdownMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

export interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: 'start' | 'center' | 'end';
}

function DropdownMenu({ trigger, items, align = 'end' }: DropdownMenuProps) {
  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild>
        {trigger}
      </DropdownMenuPrimitive.Trigger>

      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          align={align}
          sideOffset={6}
          className={cn(
            'z-50 min-w-[180px] rounded bg-surface border border-border-strong p-1 shadow-[0_2px_8px_rgba(0,0,0,0.2)]',
            'animate-in fade-in-0 zoom-in-95',
          )}
        >
          {items.map((item, index) => (
            <DropdownMenuPrimitive.Item
              key={index}
              onClick={item.onClick}
              className={cn(
                'flex items-center gap-2 rounded px-3 py-1.5 text-sm cursor-pointer outline-none transition-colors',
                item.variant === 'danger'
                  ? 'text-danger hover:bg-danger/10 focus:bg-danger/10'
                  : 'text-text-primary hover:bg-surface-hover focus:bg-surface-hover',
              )}
            >
              {item.icon && <span className="h-4 w-4 shrink-0">{item.icon}</span>}
              {item.label}
            </DropdownMenuPrimitive.Item>
          ))}
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}

export { DropdownMenu };
