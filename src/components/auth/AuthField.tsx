import { useId, useState, type InputHTMLAttributes } from 'react';
import {
  AlertCircle,
  Eye,
  EyeOff,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface AuthFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className'> {
  label: string;
  icon: LucideIcon;
  error?: string;
  hint?: string;
  /** Required even though a single field renders two labels visually. */
  id?: string;
}

/**
 * Labelled input with an inline icon and an optional show/hide toggle for
 * passwords. Errors are announced to assistive tech through aria attributes.
 */
export function AuthField({
  label,
  icon: Icon,
  error,
  hint,
  id,
  type = 'text',
  required,
  ...props
}: AuthFieldProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;
  const [visible, setVisible] = useState(false);

  const isPassword = type === 'password';
  const resolvedType = isPassword && visible ? 'text' : type;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-1.5 block text-[13px] font-medium text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      <div className="relative">
        <Icon
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 transition-colors',
            error ? 'text-rose-400' : 'text-slate-400'
          )}
        />

        <input
          id={inputId}
          type={resolvedType}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={cn(error && errorId, hint && hintId) || undefined}
          className={cn(
            'h-11 w-full rounded-xl border bg-white pl-10 pr-3.5 text-sm text-slate-900 shadow-sm outline-none transition-all duration-150 placeholder:text-slate-400',
            'focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            isPassword && 'pr-11',
            error
              ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-500/10'
              : 'border-slate-200 hover:border-slate-300'
          )}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((value) => !value)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          >
            {visible ? (
              <EyeOff className="h-[17px] w-[17px]" />
            ) : (
              <Eye className="h-[17px] w-[17px]" />
            )}
          </button>
        )}
      </div>

      {error ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1.5 flex items-start gap-1.5 text-[12.5px] font-medium text-rose-600"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </p>
      ) : hint ? (
        <p id={hintId} className="mt-1.5 text-[12px] text-slate-400">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export interface PasswordStrengthResult {
  /** 0 = empty, 1 = weak … 4 = strong */
  score: number;
  label: string;
  barClass: string;
  textClass: string;
}

export function getPasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      label: 'Enter a password',
      barClass: 'bg-slate-200',
      textClass: 'text-slate-400',
    };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;
  if (password.length >= 12) score = Math.min(4, score + 1);

  // A short password can never look stronger than "weak".
  if (password.length < 8) score = Math.min(score, 1);
  score = Math.max(1, Math.min(4, score));

  const map: Record<number, Omit<PasswordStrengthResult, 'score'>> = {
    1: { label: 'Weak', barClass: 'bg-rose-500', textClass: 'text-rose-600' },
    2: { label: 'Fair', barClass: 'bg-amber-500', textClass: 'text-amber-600' },
    3: { label: 'Good', barClass: 'bg-sky-500', textClass: 'text-sky-600' },
    4: { label: 'Strong', barClass: 'bg-emerald-500', textClass: 'text-emerald-600' },
  };

  return { score, ...map[score] };
}

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, barClass, textClass } = getPasswordStrength(password);

  return (
    <div className="mt-2" aria-live="polite">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 gap-1">
          {[1, 2, 3, 4].map((segment) => (
            <span
              key={segment}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors duration-300',
                segment <= score ? barClass : 'bg-slate-200'
              )}
            />
          ))}
        </div>
        <span className={cn('text-[11.5px] font-semibold', textClass)}>
          {label}
        </span>
      </div>
    </div>
  );
}
