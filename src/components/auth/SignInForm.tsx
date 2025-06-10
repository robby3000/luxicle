// src/components/auth/SignInForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Github, ChromeIcon } from 'lucide-react'; // Added Github and ChromeIcon
import { useAuth } from '@/hooks/useAuth';

// Shadcn/ui component imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

// Import validation schema and type
import { loginSchema, LoginFormData } from '@/lib/validations/auth';

interface SignInFormProps {
  callbackUrl?: string;
}

export function SignInForm({ callbackUrl = '/' }: SignInFormProps) {
  const router = useRouter();
  const { signInWithEmail, signInWithOAuth, isLoading: authIsLoading, error: authError } = useAuth();
  const { toast } = useToast(); // Shadcn/ui toast
  
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    const result = await signInWithEmail({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      const errorMessage = result.error.message.includes('Invalid login credentials')
        ? 'Invalid email or password. Please check your credentials and try again.'
        : `Login attempt failed: ${result.error.message}`;
      
      setFormError('root', { type: 'manual', message: errorMessage });
      toast({
        title: 'Login Failed',
        description: errorMessage,
        type: 'error',
      });
    } else if (result.session) {
      toast({
        title: 'Login Successful',
        description: 'Redirecting...',
        type: 'default', // Explicitly set type
      });
      router.push(callbackUrl);
      router.refresh();
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    if (provider === 'google') setIsGoogleLoading(true);
    if (provider === 'github') setIsGithubLoading(true);

    const { error } = await signInWithOAuth(provider);

    if (error) {
      toast({
        title: 'OAuth Error',
        description: error.message || `An error occurred while signing in with ${provider}.`,
        type: 'error',
      });
      setIsGoogleLoading(false);
      setIsGithubLoading(false);
    }
  };

  const isLoading = authIsLoading || isGoogleLoading || isGithubLoading;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {errors.root && (
        <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
          {errors.root.message}
        </div>
      )}
      {authError && !errors.root && (
         <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
           {authError.message}
         </div>
      )}
      <div className="space-y-4">
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
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="mb-1">
              Password
            </Label>
            <Link href="/forgot-password" tabIndex={-1} className="text-sm font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            disabled={isLoading}
            {...register('password')}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-destructive">
              {errors.password.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {(authIsLoading && !isGoogleLoading && !isGithubLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign in'}
        </Button>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          variant="outline"
          type="button"
          onClick={() => handleOAuthSignIn('google')}
          disabled={isLoading}
        >
          {isGoogleLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChromeIcon className="mr-2 h-4 w-4" />}
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={() => handleOAuthSignIn('github')}
          disabled={isLoading}
        >
          {isGithubLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Github className="mr-2 h-4 w-4" />}
          GitHub
        </Button>
      </div>
    </form>
  );
}
