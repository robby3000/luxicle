// src/app/(auth)/login/page.tsx
'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SignInForm } from '@/components/auth/SignInForm'; // Import the new form component

export default function LoginPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/'; // Pass callbackUrl to the form

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        
        <SignInForm callbackUrl={callbackUrl} />

      </div>
    </div>
  );
}

