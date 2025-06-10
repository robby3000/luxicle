'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, ResetPasswordFormData } from '@/lib/validations/auth';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function ResetPasswordForm() {
  const router = useRouter();
  const { resetUserPassword, isLoading: authIsLoading, session, signOut } = useAuth();
  const { toast } = useToast();
  const [formIsLoading, setFormIsLoading] = useState(false);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const { register, handleSubmit, formState: { errors }, setError: setFormError } = form;

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!session) {
      toast({
        title: 'Invalid Session',
        description: 'Your password reset session is invalid or has expired. Please request a new password reset link.',
        type: 'error',
      });
      router.push('/forgot-password');
      return;
    }

    setFormIsLoading(true);
    try {
      const { error } = await resetUserPassword(data.password);
      if (error) throw error;

      toast({
        title: 'Password Reset Successful',
        description: 'Your password has been updated. Please log in with your new password.',
        type: 'success',
      });
      // Sign out to clear the recovery session and force re-login with new password
      await signOut(); 
      router.push('/login');
    } catch (error: any) {
      setFormError('root', { type: 'manual', message: error.message || 'An unexpected error occurred.' });
      toast({
        title: 'Password Reset Failed',
        description: error.message || 'An unexpected error occurred. Please try again.',
        type: 'error',
      });
    } finally {
      setFormIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Set New Password</CardTitle>
        <CardDescription>
          Please enter your new password below. Make sure it's strong and memorable.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <Input
              id="password"
              type="password"
              {...register('password')}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              placeholder="••••••••"
              autoComplete="new-password"
            />
            {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
          </div>
          {errors.root && <p className="text-sm text-destructive">{errors.root.message}</p>}
          <Button type="submit" className="w-full" disabled={authIsLoading || formIsLoading}>
            {authIsLoading || formIsLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Reset Password'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
