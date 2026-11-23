import * as React from 'react';
import { AlertCircle, CheckCircle, Clock, MapPin, PowerOff, XCircle } from 'lucide-react';

export interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const statusVariants = {
  online: {
    bg: 'var(--primary)',
    fg: 'var(--primary-foreground)',
    Icon: MapPin,
  },
  offline: {
    bg: 'var(--muted)',
    fg: 'var(--muted-foreground)',
    Icon: PowerOff,
  },
  away: {
    bg: 'var(--accent)',
    fg: 'var(--accent-foreground)',
    Icon: Clock,
  },
  busy: {
    bg: 'var(--destructive)',
    fg: 'var(--destructive-foreground)',
    Icon: AlertCircle,
  },
  pending: {
    bg: 'var(--accent)',
    fg: 'var(--accent-foreground)',
    Icon: Clock,
  },
  approved: {
    bg: 'var(--primary)',
    fg: 'var(--primary-foreground)',
    Icon: CheckCircle,
  },
  rejected: {
    bg: 'var(--destructive)',
    fg: 'var(--destructive-foreground)',
    Icon: XCircle,
  },
  pending_approval: {
    bg: 'var(--secondary)',
    fg: 'var(--secondary-foreground)',
    Icon: Clock,
  },
};

export const StatusBadge = ({
  status,
  size = 'md',
  className,
}: StatusBadgeProps) => {
  const variant = statusVariants[status] || statusVariants.offline;
  const Icon = variant.Icon;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: size === 'sm' ? '0.25rem 0.5rem' : size === 'lg' ? '0.5rem 1rem' : '0.35rem 0.75rem',
        borderRadius: 'var(--radius)',
        fontSize: size === 'sm' ? '0.65rem' : size === 'lg' ? '0.85rem' : '0.7rem',
        fontWeight: 500,
        backgroundColor: variant.bg,
        color: variant.fg,
      }}
    >
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

StatusBadge.displayName = 'StatusBadge';
