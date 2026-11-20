import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../../utils/api';
import {
  AlertCircle,
  ArrowRight,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { connectSocket } from '../../utils/socket';
import AuthLayout from '../../components/auth/AuthLayout';
import { AuthField } from '../../components/auth/AuthField';

const REMEMBERED_EMAIL_KEY = 'hrms.rememberedEmail';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard', { replace: true });
      return;
    }

    // Remember Me only stores the email on this device. The JWT is still kept
    // in localStorage exactly like before, so authentication is unchanged.
    const remembered = localStorage.getItem(REMEMBERED_EMAIL_KEY);
    if (remembered) {
      setEmail(remembered);
      setRemember(true);
    }
  }, [navigate]);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validatePassword = (value: string) => value.length >= 6;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setEmailError('');
    setPasswordError('');
    setServerError('');

    if (!email.trim()) {
      setEmailError('Email is required');
      return;
    }
    if (!validateEmail(email.trim())) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      return;
    }
    if (!validatePassword(password)) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const res = await API.post('/auth/login', { email: email.trim(), password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.role);
      localStorage.setItem('userId', res.data.userId);
      localStorage.setItem(
        'userName',
        `${res.data.firstName} ${res.data.lastName}`
      );

      if (remember) {
        localStorage.setItem(REMEMBERED_EMAIL_KEY, email.trim());
      } else {
        localStorage.removeItem(REMEMBERED_EMAIL_KEY);
      }

      // Open the authenticated socket connection (the server derives the room
      // from the JWT, so there is no client-side 'join' anymore).
      connectSocket();
      navigate('/dashboard');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Login failed';
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      badge="Secure sign in"
      title="Welcome Back!"
      subtitle="Sign in to access your HRMS workspace."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-blue-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <AuthField
          id="login-email"
          name="email"
          label="Email address"
          icon={Mail}
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          autoFocus
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError('');
            if (serverError) setServerError('');
          }}
          error={emailError}
        />

        <div>
          <AuthField
            id="login-password"
            name="password"
            label="Password"
            icon={Lock}
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordError) setPasswordError('');
              if (serverError) setServerError('');
            }}
            error={passwordError}
          />

          <div className="mt-3 flex items-center justify-between gap-3">
            <label
              htmlFor="remember-me"
              className="inline-flex cursor-pointer select-none items-center gap-2 text-[13px] text-slate-600"
            >
              <input
                id="remember-me"
                name="remember"
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-2 focus:ring-blue-500/30 focus:ring-offset-0"
              />
              Remember me
            </label>

            <Link
              to="/forgot-password"
              className="text-[13px] font-medium text-blue-600 underline-offset-4 transition-colors hover:text-blue-700 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
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
              Signing in…
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
}
