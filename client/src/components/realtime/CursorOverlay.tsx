import { AnimatePresence, motion } from 'framer-motion';
import type { CursorPosition } from '@/types/socket';

interface CursorOverlayProps {
  cursors: CursorPosition[];
  containerRef: React.RefObject<HTMLElement | null>;
}

/**
 * Renders remote user cursors as colored pointers positioned relative to
 * the board container using the 0-1 x/y coordinates from the socket.
 */
export function CursorOverlay({ cursors, containerRef }: CursorOverlayProps) {
  if (cursors.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-30">
      <AnimatePresence>
        {cursors.map((cursor) => {
          const rect = containerRef.current?.getBoundingClientRect();
          if (!rect) return null;

          const x = cursor.x * rect.width;
          const y = cursor.y * rect.height;

          return (
            <motion.div
              key={cursor.userId}
              className="absolute"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, x, y }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 500, damping: 40, mass: 0.3 }}
              style={{ left: 0, top: 0 }}
            >
              {/* Cursor arrow */}
              <svg
                width="16"
                height="20"
                viewBox="0 0 16 20"
                fill="none"
                className="drop-shadow-md"
              >
                <path
                  d="M0 0L0 16L4.5 12L7.5 19L9.5 18L6.5 11L12 11L0 0Z"
                  fill={cursor.color}
                />
              </svg>

              {/* Name label */}
              <div
                className="absolute top-4 left-3 whitespace-nowrap rounded px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm"
                style={{ backgroundColor: cursor.color }}
              >
                {cursor.name}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
