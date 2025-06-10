import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Forgot Your Password?
          </h1>
          <p className="mt-2 text-muted-foreground">
            No worries! Enter your email address below and we'll send you a link to reset your password.
          </p>
        </div>
        <ForgotPasswordForm />
        <div className="text-center text-sm">
          <Link href="/login" className="font-medium text-primary hover:underline">
            Remembered your password? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
