'use client';

import Link from 'next/link';
import { MailCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/authStore';
import { useToast } from '@/components/ui/toast';
import { useState } from 'react';

export function ConfirmEmailMessage() {
  const user = useAuthStore((state) => state.user);
  const { resendConfirmationEmail, isLoading: authIsLoading } = useAuth();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  return (
    <div className="flex flex-col items-center text-center">
      <MailCheck className="w-16 h-16 text-green-500 mb-6" />
      <h2 className="text-2xl font-semibold text-foreground mb-2">
        Almost there! Check your email
      </h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        We've sent a confirmation link to your email address. Please click the link to activate your account. If you don't see it, be sure to check your spam folder.
      </p>
      <Button asChild className="w-full max-w-xs">
        <Link href="/login">Back to Login</Link>
      </Button>

      {user?.email && (
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground mb-2">
            Didn't receive the email or it expired?
          </p>
          <Button
            variant="link"
            onClick={handleResendEmail}
            disabled={authIsLoading || isResending}
            className="text-primary hover:underline px-0"
          >
            {isResending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
            ) : (
              'Resend confirmation link'
            )}
          </Button>
        </div>
      )}
    </div>
  );

  async function handleResendEmail() {
    if (!user?.email) {
      toast({
        title: 'Error',
        description: 'Could not find user email to resend confirmation.',
        type: 'error',
      });
      return;
    }

    setIsResending(true);
    try {
      await resendConfirmationEmail(user.email);
      toast({
        title: 'Confirmation Sent',
        description: 'A new confirmation link has been sent to your email address.',
        type: 'success',
      });
    } catch (error: any) {
      toast({
        title: 'Error Resending Link',
        description: error.message || 'An unexpected error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setIsResending(false);
    }
  }
}
