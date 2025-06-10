'use client'; // This page needs to be a client component to use hooks like useAuth or check session

import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore'; // Import useAuthStore

export default function ResetPasswordPage() {
  const { session, isLoading, error } = useAuth(); // from useAuth hook
  const store = useAuthStore(); // direct access to store for re-check
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !session && !error) {
      const timer = setTimeout(() => {
        // Re-check session directly from store after a delay, as useAuth might not update immediately
        // on initial load with a recovery token.
        if (!store.session) { 
          // console.log('No session for reset password after delay, showing message.');
          // The component will render the !session block below naturally.
        }
      }, 1200); // Increased delay slightly
      return () => clearTimeout(timer);
    }
  }, [isLoading, session, error, router, store.session]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Verifying reset link...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Error Verifying Link</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          There was an error processing your password reset link: <span className="font-medium">{error.message}</span>. <br />
          It might be invalid, expired, or already used.
        </p>
        <Link href="/forgot-password" className="text-primary hover:underline">
          Request a new password reset link
        </Link>
      </div>
    );
  }
  
  if (!session) {
     return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-12 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Invalid or Expired Link</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          Your password reset link appears to be invalid, expired, or you don't have an active reset session. <br />
          Please ensure you've clicked the link from your email correctly or request a new one.
        </p>
        <Link href="/forgot-password" className="text-primary hover:underline">
          Request a new password reset link
        </Link>
      </div>
    );
  }

  // If session exists, render the form
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-12">
      <ResetPasswordForm />
    </div>
  );
}
