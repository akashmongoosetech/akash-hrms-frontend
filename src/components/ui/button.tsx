import * as React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export const buttonVariants = {
  primary:
    'inline-flex items-center justify-center rounded-md text-sm font-medium gap-2 bg-primary px-4 py-2.5 text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary active:active:scale-[0.99] transition-colors',
  secondary:
    'inline-flex items-center justify-center rounded-md text-sm font-medium gap-2 bg-secondary px-4 py-2.5 text-secondary-foreground shadow-sm hover:bg-secondary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary active:active:scale-[0.99] transition-colors',
  ghost:
    'inline-flex items-center justify-center rounded-md text-sm font-medium gap-2 bg-transparent px-4 py-2.5 text-primary hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 transition-colors',
  link:
    'inline-flex items-center justify-center rounded-md text-sm font-medium gap-2 text-primary underline-offset-4 hover:underline transition-colors'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'default', loading, children, disabled, ...props }, ref) => {
    const sizeMap: Record<string, string> = {
      default: 'h-10 py-2',
      sm: 'h-9 px-3 text-sm',
      lg: 'h-11 px-6 text-base',
      icon: 'h-10 w-10 p-0'
    };

    const baseClasses = buttonVariants[variant];

    return (
      <button
        ref={ref}
        className={className}
        disabled={disabled || loading}
        {...props}
        style={{ pointerEvents: disabled || loading ? 'none' : undefined }}
      >
        {loading ? (
          <span className="align-middle animate-spin h-4 w-4"></span>
        ) : (
          <span className="align-middle">{children}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';