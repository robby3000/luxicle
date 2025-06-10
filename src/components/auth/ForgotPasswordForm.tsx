'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/toast';

// Import validation schema and type
import { forgotPasswordSchema, ForgotPasswordFormData } from '@/lib/validations/auth';

export function ForgotPasswordForm() {
  const router = useRouter();
  const { sendPasswordResetEmail, isLoading: authIsLoading, error: authError } = useAuth();
  const { toast } = useToast();
  const [formIsLoading, setFormIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setFormIsLoading(true);
    // TODO: Consider making RESET_PASSWORD_REDIRECT_URL an environment variable
    const RESET_PASSWORD_REDIRECT_URL = `${window.location.origin}/auth/reset-password`;
    
    console.log('[ForgotPasswordForm] Attempting to send password reset email for:', data.email);
    try {
      await sendPasswordResetEmail(data.email, RESET_PASSWORD_REDIRECT_URL);
      console.log('[ForgotPasswordForm] sendPasswordResetEmail successful.');
      toast({
        title: 'Check Your Email',
        description: 'If an account exists with that email, a password reset link has been sent.',
        type: 'success',
      });
      // Optionally redirect or clear form, or reset the form
      // router.push('/login'); 
    } catch (error: any) {
      console.error('[ForgotPasswordForm] Error in onSubmit:', error);
      setFormError('root', { type: 'manual', message: (error as Error).message });
      toast({
        title: 'Error Sending Reset Link',
        description: error.message || 'An unexpected error occurred.',
        type: 'error',
      });
    } finally {
      setFormIsLoading(false);
    }
  };

  const isLoading = authIsLoading || formIsLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          {errors.root.message}
        </div>
      )}
      {authError && !errors.root && (
         <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
           {/* Ensure authError has a message property */}
           {(authError as Error)?.message || 'An unexpected authentication error occurred.'}
         </div>
      )}
      <div>
        <Label htmlFor="email" className="mb-1">
          Email address
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="name@example.com"
          disabled={isLoading}
          {...register('email')}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send Reset Link'}
      </Button>
    </form>
  );
}
