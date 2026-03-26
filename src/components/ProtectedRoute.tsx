import { type ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';
import Loader from './Loader';

interface ProtectedRouteProps {
  children: ReactNode;
  redirectTo?: string;
}

/**
 * Wraps a route so only authenticated users can access it.
 * Unauthenticated users are redirected to /login.
 * Shows a spinner while the session check is in progress.
 */
export default function ProtectedRoute({ children, redirectTo = '/login' }: ProtectedRouteProps) {
  const [session, setSession] = useState<Session | null | 'loading'>('loading');

  useEffect(() => {
    // Get the initial session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === 'loading') {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-8">
        <Loader />
        <span className="text-xs font-bold tracking-[0.2em] text-indigo-600/60 uppercase">Verifying Session...</span>
      </div>
    );
  }

  if (!session) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}
