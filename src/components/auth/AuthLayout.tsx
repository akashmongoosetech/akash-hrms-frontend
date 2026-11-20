import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Clock3, Lock, ShieldCheck, Users, Wallet, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  badge?: string;
  children: ReactNode;
  footer: ReactNode;
  /** `lg` is used by sign up because it carries more fields. */
  width?: 'md' | 'lg';
}

const FEATURES = [
  {
    icon: Users,
    title: 'Employee management',
    text: 'Profiles, roles and org structure in one place.',
  },
  {
    icon: Clock3,
    title: 'Attendance tracking',
    text: 'Live punch-in with selfie and geo verification.',
  },
  {
    icon: Wallet,
    title: 'Payroll & expenses',
    text: 'Accurate working hours, salaries and reimbursements.',
  },
  {
    icon: ShieldCheck,
    title: 'Secure HR operations',
    text: 'Role-based access with enterprise-grade security.',
  },
];

/**
 * Shared split-screen shell for the Login and Sign Up pages.
 *
 * The brand panel is desktop-only. On tablets and phones the form becomes a
 * single centred column so there is never any horizontal scrolling.
 */
export default function AuthLayout({
  title,
  subtitle,
  badge,
  children,
  footer,
  width = 'md',
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-slate-50 antialiased">
      {/* Brand panel */}
      <aside className="relative hidden w-[46%] shrink-0 overflow-hidden bg-slate-950 text-white lg:flex xl:w-1/2">
        <div className="absolute inset-0 bg-gradient-to-br from-[#070d1d] via-[#0f2350] to-[#1d4ed8]" />

        {/* Subtle grid */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />

        {/* Soft glows */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-28 -top-24 h-80 w-80 rounded-full bg-sky-400/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-indigo-500/30 blur-3xl"
        />

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
          className="relative z-10 flex w-full flex-col justify-between px-10 py-10 xl:px-14 xl:py-12"
        >
          <div>
            <img
              src="/logo/logo.png"
              alt="Sosapient HRMS"
              className="h-10 w-auto max-w-[220px] rounded-xl bg-white px-3 py-2 object-contain shadow-xl shadow-black/25 xl:h-11"
            />
          </div>

          <div className="my-10 max-w-lg">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-sky-100 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              One workspace for your people
            </span>

            <h2 className="mt-5 text-3xl font-semibold leading-tight tracking-tight text-white xl:text-[2.6rem]">
              Simplify Your
              <br />
              Workforce Management
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300/90 xl:text-[15px]">
              Bring employee records, attendance, payroll and everyday HR
              operations together in a single, secure platform built for modern
              teams.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              {FEATURES.map(({ icon: Icon, title: featureTitle, text }) => (
                <div
                  key={featureTitle}
                  className="rounded-xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm transition-colors duration-200 hover:border-white/20 hover:bg-white/[0.09]"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-sky-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="mt-2.5 text-[13px] font-semibold text-white">
                    {featureTitle}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-snug text-slate-300/80">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11.5px] text-slate-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" />
              Role-based access
            </span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="inline-flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-sky-300" />
              Encrypted sessions
            </span>
          </div>
        </motion.div>
      </aside>

      {/* Form panel */}
      <main className="relative flex min-h-screen w-full flex-col lg:w-[54%] xl:w-1/2">
        <div className="flex items-center justify-between px-5 pt-6 sm:px-8 lg:justify-end lg:px-10">
          <img
            src="/logo/logo.png"
            alt="Sosapient HRMS"
            className="h-9 w-auto max-w-[190px] object-contain lg:hidden"
          />
          <span className="hidden text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400 lg:inline">
            Sosapient HRMS
          </span>
        </div>

        <div className="flex flex-1 items-start justify-center px-4 py-8 sm:items-center sm:px-6 sm:py-10">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.05 }}
            className={width === 'lg' ? 'w-full max-w-xl' : 'w-full max-w-[420px]'}
          >
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_60px_-20px_rgba(15,23,42,0.22)] sm:p-8">
              {badge && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-blue-700">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {badge}
                </span>
              )}

              <h1 className={`${badge ? 'mt-4' : ''} text-2xl font-semibold tracking-tight text-slate-900 sm:text-[1.75rem]`}>
                {title}
              </h1>
              <p className="mt-1.5 text-sm leading-relaxed text-slate-500">
                {subtitle}
              </p>

              <div className="mt-6">{children}</div>
            </div>

            <div className="mt-6 pb-2 text-center text-sm text-slate-500">
              {footer}
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
