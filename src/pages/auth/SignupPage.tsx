import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import {
  AlertCircle,
  ArrowRight,
  Camera,
  Loader2,
  Lock,
  Mail,
  Phone,
  Trash2,
  UserRound,
} from 'lucide-react';
import toast from 'react-hot-toast';
import AuthLayout from '../../components/auth/AuthLayout';
import {
  AuthField,
  PasswordStrength,
} from '../../components/auth/AuthField';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_REGEX = /^\+?[\d\s()-]{7,18}$/;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

interface SignupForm {
  fullName: string;
  email: string;
  mobile1: string;
  password: string;
  confirmPassword: string;
}

const EMPTY_FORM: SignupForm = {
  fullName: '',
  email: '',
  mobile1: '',
  password: '',
  confirmPassword: '',
};

/**
 * Splits a single "Full Name" input into the firstName / lastName pair the
 * API expects. Validation guarantees there are at least two words.
 */
function splitFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] || '',
    lastName: parts.slice(1).join(' '),
  };
}

export default function SignupPage() {
  const [form, setForm] = useState<SignupForm>(EMPTY_FORM);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Revoke the preview URL when it is replaced or the page unmounts.
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  const handleChange = (field: keyof SignupForm) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      setForm((prev) => ({ ...prev, [field]: value }));
      if (serverError) setServerError('');
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG or PNG).');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error('Photo must be smaller than 5 MB.');
      return;
    }

    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
  };

  const validate = () => {
    const next: Record<string, string> = {};
    const { firstName, lastName } = splitFullName(form.fullName);

    if (!form.fullName.trim()) {
      next.fullName = 'Full name is required';
    } else if (!firstName || !lastName) {
      next.fullName = 'Please enter both your first and last name';
    }

    if (!form.email.trim()) {
      next.email = 'Work email is required';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      next.email = 'Please enter a valid email address';
    }

    if (form.mobile1.trim() && !MOBILE_REGEX.test(form.mobile1.trim())) {
      next.mobile1 = 'Please enter a valid mobile number';
    }

    if (!form.password) {
      next.password = 'Password is required';
    } else if (form.password.length < 6) {
      next.password = 'Password must be at least 6 characters long';
    }

    if (!form.confirmPassword) {
      next.confirmPassword = 'Please confirm your password';
    } else if (form.confirmPassword !== form.password) {
      next.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      next.terms = 'Please accept the Terms & Conditions to continue';
    }

    setErrors(next);
    return { valid: Object.keys(next).length === 0, firstName, lastName };
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (loading) return;

    const { valid, firstName, lastName } = validate();
    if (!valid) return;

    setServerError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('firstName', firstName);
      fd.append('lastName', lastName);
      fd.append('email', form.email.trim());
      if (form.mobile1.trim()) fd.append('mobile1', form.mobile1.trim());
      fd.append('password', form.password);
      fd.append('role', 'Employee');
      if (photo) fd.append('photo', photo);

      await API.post('/auth/signup', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.success('Account created successfully — please sign in.');
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message;

      // A sleeping/unreachable backend (or a Render edge 502) arrives here with
      // no response at all, and the browser reports it as a CORS failure. Say
      // what is actually happening instead of showing a bare "Signup error".
      let message: string;
      if (!err?.response || status === 502 || status === 503 || status === 504) {
        message = 'Cannot reach the server right now. Please try again in a minute.';
      } else if (status >= 500) {
        message =
          serverMessage || 'The server could not create your account. Please try again.';
      } else {
        message = serverMessage || 'Signup error';
      }

      setServerError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      width="lg"
      badge="Employee registration"
      title="Create Your Account"
      subtitle="Get started with your HRMS workspace."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-blue-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {/* Optional profile photo — keeps the existing signup capability. */}
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white sm:h-14 sm:w-14">
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Selected profile photo"
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-6 w-6 text-slate-300" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-medium text-slate-700">
              <span className="sm:hidden">Photo</span>
              <span className="hidden sm:inline">Profile photo</span>{' '}
              <span className="hidden font-normal text-slate-400 sm:inline">(optional)</span>
            </p>
            <p className="mt-0.5 hidden text-[11.5px] text-slate-400 sm:block">
              JPG or PNG, up to 5 MB.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[12px] font-medium text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
            >
              <Camera className="h-3.5 w-3.5" />
              {photoPreview ? 'Change' : 'Upload'}
            </button>
            {photoPreview && (
              <button
                type="button"
                onClick={removePhoto}
                aria-label="Remove selected photo"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500/40"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            className="hidden"
          />
        </div>

        <AuthField
          id="signup-full-name"
          name="fullName"
          label="Full name"
          icon={UserRound}
          type="text"
          placeholder="e.g. Akash Raikwar"
          autoComplete="name"
          autoFocus
          required
          value={form.fullName}
          onChange={handleChange('fullName')}
          error={errors.fullName}
        />

        <AuthField
          id="signup-email"
          name="email"
          label="Work email"
          icon={Mail}
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          required
          value={form.email}
          onChange={handleChange('email')}
          error={errors.email}
        />

        <AuthField
          id="signup-mobile"
          name="mobile1"
          label="Mobile number"
          icon={Phone}
          type="tel"
          inputMode="tel"
          placeholder="+91 98765 43210"
          autoComplete="tel"
          hint="Optional — used by HR for official communication."
          value={form.mobile1}
          onChange={handleChange('mobile1')}
          error={errors.mobile1}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <AuthField
              id="signup-password"
              name="password"
              label="Password"
              icon={Lock}
              type="password"
              placeholder="Create a password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange('password')}
              error={errors.password}
            />
            <PasswordStrength password={form.password} />
          </div>

          <AuthField
            id="signup-confirm-password"
            name="confirmPassword"
            label="Confirm password"
            icon={Lock}
            type="password"
            placeholder="Re-enter password"
            autoComplete="new-password"
            required
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
          />
        </div>

        <div>
          <label
            htmlFor="accept-terms"
            className="flex cursor-pointer select-none items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3 text-[12.5px] leading-relaxed text-slate-600 transition-colors hover:border-slate-300"
          >
            <input
              id="accept-terms"
              name="terms"
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => {
                setAcceptedTerms(e.target.checked);
                if (errors.terms) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.terms;
                    return next;
                  });
                }
              }}
              aria-invalid={errors.terms ? true : undefined}
              aria-describedby={errors.terms ? 'accept-terms-error' : undefined}
              className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0"
            />
            <span>
              I agree to the{' '}
              <span className="font-semibold text-slate-800">Terms &amp; Conditions</span>{' '}
              and{' '}
              <span className="font-semibold text-slate-800">Privacy Policy</span> of
              Sosapient HRMS.
            </span>
          </label>

          {errors.terms && (
            <p
              id="accept-terms-error"
              role="alert"
              className="mt-1.5 flex items-start gap-1.5 text-[12.5px] font-medium text-rose-600"
            >
              <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
              <span>{errors.terms}</span>
            </p>
          )}
        </div>

        {serverError && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-[13px] text-rose-700"
          >
            <AlertCircle className="mt-px h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-600/30 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-500/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account…
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
