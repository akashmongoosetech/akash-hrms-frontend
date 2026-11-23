import * as React from 'react';

export interface BadgeProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'critical' | 'success' | 'info';
  size?: 'sm' | 'md' | 'lg';
}

const badgeVariants = {
  primary:
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary/10 text-primary',
  secondary:
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-secondary/10 text-secondary',
  critical:
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-destructive/10 text-destructive',
  success:
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-success/10 text-success',
  info:
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-info/10 text-info-foreground',
};

export const Badge = ({
  variant = 'primary',
  size = 'md',
  children,
  className,
}: BadgeProps) => {
  const variantClass = badgeVariants[variant] || badgeVariants.primary;

  return (
    <span
      className={className}
      style={{
        fontSize: size === 'sm' ? '0.65em' : size === 'lg' ? '0.85em' : '0.75em',
      }}
    >
      {children}
    </span>
  );
};

Badge.displayName = 'Badge';