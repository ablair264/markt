import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar';
import { AnimatePresence, motion } from 'motion/react';
import { Mail, MessageCircle, PhoneCall } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface Avatar02User {
  name: string;
  image?: string;
  role?: string;
  email?: string;
  phone?: string;
}

export interface Avatar02Props {
  users: Avatar02User[];
  maxVisible?: number;
  size?: 'default' | 'sm' | 'lg';
  className?: string;
  showHoverCard?: boolean;
  showOverflowCount?: boolean;
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function Avatar02({
  users,
  maxVisible = 3,
  size = 'sm',
  className,
  showHoverCard = true,
  showOverflowCount = true,
}: Avatar02Props) {
  const [activeUser, setActiveUser] = useState<string | null>(null);
  const closeTimer = useRef<number | null>(null);
  const visibleUsers = users.slice(0, maxVisible);
  const overflow = Math.max(users.length - maxVisible, 0);

  const clearCloseTimer = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const openCard = (name: string) => {
    clearCloseTimer();
    setActiveUser(name);
  };

  const closeCardWithDelay = (name: string, delayMs: number = 220) => {
    clearCloseTimer();
    closeTimer.current = window.setTimeout(() => {
      setActiveUser((current) => (current === name ? null : current));
    }, delayMs);
  };

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  return (
    <AvatarGroup className={className}>
      {visibleUsers.map((user) => {
        const email =
          user.email ??
          `${user.name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
        const phone = user.phone ?? '+1-555-0100';

        return (
        <motion.div
          key={user.name}
          className="relative"
          whileHover={showHoverCard ? { y: -2, scale: 1.06 } : undefined}
          transition={{ type: 'spring', stiffness: 360, damping: 18 }}
          onMouseEnter={() => openCard(user.name)}
          onMouseLeave={() => closeCardWithDelay(user.name)}
          onFocus={() => openCard(user.name)}
          onBlur={() => closeCardWithDelay(user.name)}
          tabIndex={0}
        >
          <Avatar size={size}>
            {user.image && <AvatarImage src={user.image} alt={user.name} />}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>

          <AnimatePresence>
            {showHoverCard && activeUser === user.name && (
              <motion.div
                initial={{ opacity: 0, y: 14, scale: 0.92 }}
                animate={{
                  opacity: 1,
                  y: -10,
                  scale: 1,
                  transition: { type: 'spring', stiffness: 420, damping: 24 },
                }}
                exit={{ opacity: 0, y: 6, scale: 0.96, transition: { duration: 0.16 } }}
                className="pointer-events-auto absolute bottom-full left-1/2 z-50 mb-1.5 w-[180px] -translate-x-1/2 rounded-xl border border-border/80 bg-card/95 p-2.5 shadow-xl backdrop-blur-sm"
                onMouseEnter={() => openCard(user.name)}
                onMouseLeave={() => closeCardWithDelay(user.name, 260)}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar size="default" className="size-10">
                    {user.image && <AvatarImage src={user.image} alt={user.name} />}
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold leading-none text-foreground">
                      {user.name}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {user.role ?? 'Team Member'}
                    </p>
                    <div className="mt-1.5 inline-flex items-center gap-2 text-muted-foreground/90">
                      <button
                        type="button"
                        aria-label={`Message ${user.name}`}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </button>
                      <a
                        href={`mailto:${email}`}
                        aria-label={`Email ${user.name}`}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="h-3.5 w-3.5" />
                      </a>
                      <a
                        href={`tel:${phone}`}
                        aria-label={`Call ${user.name}`}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PhoneCall className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        );
      })}
      {showOverflowCount && overflow > 0 && <AvatarGroupCount>+{overflow}</AvatarGroupCount>}
    </AvatarGroup>
  );
}

const demoUsers: Avatar02User[] = [
  { name: 'Casey North', image: 'https://images.shadcnspace.com/assets/profiles/user-1.jpg' },
  { name: 'Lara Reed', image: 'https://images.shadcnspace.com/assets/profiles/user-2.jpg' },
  { name: 'Evan Ross', image: 'https://images.shadcnspace.com/assets/profiles/user-3.jpg' },
  { name: 'Nia Holt' },
];

const GroupAvatarDemo = () => (
  <div className="flex items-center justify-center px-4">
    <Avatar02 users={demoUsers} />
  </div>
);

export default GroupAvatarDemo;
