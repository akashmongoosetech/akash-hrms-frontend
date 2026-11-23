import * as React from 'react';
import * as primitive from '@radix-ui/react-dialog';

interface DialogHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface DialogFooterProps {
  children: React.ReactNode;
  className?: string;
}

export const Dialog = primitive.Root;
export const DialogTrigger = primitive.Trigger;
export const DialogContent = primitive.Content;
export const DialogHeader = ({ children, className }: DialogHeaderProps) => (
  <div className={className}>{children}</div>
);
export const DialogTitle = primitive.Title;
export const DialogDescription = primitive.Description;
export const DialogFooter = ({ children, className }: DialogFooterProps) => (
  <div className={className}>{children}</div>
);

DialogContent.displayName = 'DialogContent';
DialogHeader.displayName = 'DialogHeader';
DialogTitle.displayName = 'DialogTitle';
DialogDescription.displayName = 'DialogDescription';
DialogFooter.displayName = 'DialogFooter';

/* Dialog styles based on design system */
const dialogVariants = {
  default:
    'bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl max-w-full max-h-[90vh] w-full p-6 text-lg transition-all duration-300',
  sm: 'max-w-sm p-4',
  lg: 'max-w-lg p-6',
  full: 'max-w-full p-8'
};

export const useDialog = (props: {
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [open, setOpen] = React.useState(props.defaultOpen ?? false);

  const onOpenChange = (open: boolean) => {
    setOpen(open);
    props.onOpenChange?.(open);
  };

  return {
    open,
    onOpenChange,
    setOpen,
    ...props
  };
};

/* ==========================================
   Shared Form Components
   ========================================== */

export const FormField = ({
  label,
  children,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & { children: React.ReactNode; label?: string }) => {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">{label}</label>
      {children}
    </div>
  );
};

export const FormInput = ({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { type?: string; placeholder?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="input"
      {...props}
    />
  );
};

export const FormTextarea = ({
  placeholder,
  value,
  onChange,
  disabled,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { placeholder?: string; value?: string; onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) => {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="textarea"
      {...props}
    />
  );
};

/* ==========================================
   Notification/Toast System
   ========================================== */

export const useToast = () => {
  const toast = React.useRef<any>(null);

  const notify = (options: {
    title: string;
    description: string;
    variant?: 'default' | 'destructive' | 'success' | 'warning';
    duration?: number;
  }) => {
    if (toast.current) {
      toast.current(options);
    }
  };

  return { notify };
};

export const Sonner = ({ toasts, onClose }) => {
  return null; // Placeholder - use react-hot-toast instead
};