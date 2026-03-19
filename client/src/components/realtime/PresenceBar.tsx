import type { PresenceUser } from '@/types/socket';

interface PresenceBarProps {
  users: PresenceUser[];
}

/**
 * Shows stacked avatars for users currently viewing this project board.
 */
export function PresenceBar({ users }: PresenceBarProps) {
  if (users.length === 0) return null;

  const visible = users.slice(0, 5);
  const overflow = users.length - visible.length;

  return (
    <div className="flex items-center gap-1.5" title={users.map((u) => u.name).join(', ')}>
      <div className="flex -space-x-1.5">
        {visible.map((user) => (
          <div
            key={user.userId}
            className="h-[22px] w-[22px] rounded-full border-2 border-background flex items-center justify-center text-[8px] font-bold text-white shrink-0 ring-1 ring-white/10"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.substring(0, 2).toUpperCase()}
          </div>
        ))}
        {overflow > 0 && (
          <div className="h-[22px] w-[22px] rounded-full border-2 border-background bg-surface-hover flex items-center justify-center text-[8px] font-bold text-text-muted shrink-0">
            +{overflow}
          </div>
        )}
      </div>
      <span className="text-[11px] text-text-muted hidden sm:block">
        {users.length} online
      </span>
    </div>
  );
}
