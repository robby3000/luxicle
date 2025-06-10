'use client';

import Link from 'next/link';
import { SignUpForm } from '@/components/auth/SignUpForm'; // Import the new form component
// import { useSearchParams } from 'next/navigation'; // Uncomment if using callbackUrl

export default function RegisterPage() {
  // const searchParams = useSearchParams(); // Uncomment if using callbackUrl
  // const callbackUrl = searchParams.get('callbackUrl') || '/'; // Uncomment if using callbackUrl

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-lg space-y-8 rounded-lg bg-card p-8 shadow-lg"> {/* max-w-lg for wider form */}
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Create an account</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        
        <SignUpForm /> 
        {/* <SignUpForm callbackUrl={callbackUrl} /> */}{/* If using callbackUrl */}

      </div>
    </div>
  );
}
