// src/components/auth/SignUpForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Loader2, Github, ChromeIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

// Shadcn/ui component imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";

// Import validation schema and type
import { registerSchema, RegisterFormData } from '@/lib/validations/auth';

interface SignUpFormProps {
  callbackUrl?: string;
}

export function SignUpForm({ callbackUrl = '/' }: SignUpFormProps) {
  const router = useRouter();
  const { signUpWithEmail, signInWithOAuth, isLoading: authIsLoading, error: authError } = useAuth();
  const { toast } = useToast();

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    }
  });

  const onSubmit = async (data: RegisterFormData) => {
    const result = await signUpWithEmail({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        },
      },
    });

    if (result.error) {
      setFormError('root', { type: 'manual', message: result.error.message });
      toast({
        title: 'Registration Failed',
        description: result.error.message,
        type: 'error',
      });
    } else if (result.user) {
      if (result.session) {
        toast({
          title: 'Registration Successful!',
          description: 'Redirecting...',
        });
        router.push(callbackUrl);
        router.refresh();
      } else {
        toast({
          title: 'Registration Almost Complete!',
          description: 'Please check your email to confirm your account.',
        });
        router.push('/confirm-email'); 
      }
    } else {
        const unexpectedError = 'Registration attempt finished with an unexpected state.';
        setFormError('root', { type: 'manual', message: unexpectedError });
        toast({
            title: 'Registration Issue',
            description: unexpectedError,
            type: 'error',
        });
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
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName" className="mb-1">First name</Label>
          <Input id="firstName" {...register('firstName')} disabled={isLoading} placeholder="John" />
          {errors.firstName && <p className="mt-1 text-sm text-destructive">{errors.firstName.message}</p>}
        </div>
        <div>
          <Label htmlFor="lastName" className="mb-1">Last name</Label>
          <Input id="lastName" {...register('lastName')} disabled={isLoading} placeholder="Doe" />
          {errors.lastName && <p className="mt-1 text-sm text-destructive">{errors.lastName.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="email" className="mb-1">Email address</Label>
        <Input id="email" type="email" autoComplete="email" {...register('email')} disabled={isLoading} placeholder="name@example.com" />
        {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>}
      </div>
      <div>
        <Label htmlFor="password" className="mb-1">Password</Label>
        <Input id="password" type="password" autoComplete="new-password" {...register('password')} disabled={isLoading} placeholder="••••••••" />
        {errors.password ? (
            <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
        ) : (
            <p className="mt-1 text-xs text-muted-foreground">Min. 8 chars, incl. uppercase, lowercase, number & special char.</p>
        )}
      </div>
      <div>
        <Label htmlFor="confirmPassword" className="mb-1">Confirm Password</Label>
        <Input id="confirmPassword" type="password" autoComplete="new-password" {...register('confirmPassword')} disabled={isLoading} placeholder="••••••••" />
        {errors.confirmPassword && <p className="mt-1 text-sm text-destructive">{errors.confirmPassword.message}</p>}
      </div>

      <div className="items-top flex space-x-2">
        <Checkbox id="terms" {...register('terms')} disabled={isLoading} />
        <div className="grid gap-1.5 leading-none">
            <Label
            htmlFor="terms"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
            I agree to the{' '}
            <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
            </Link>
            </Label>
            {errors.terms && <p className="text-sm text-destructive">{errors.terms.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {(authIsLoading && !isGoogleLoading && !isGithubLoading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
        Create account
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Or sign up with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button
          variant="outline"
          type="button"
          onClick={() => handleOAuthSignIn('google')}
          disabled={isLoading}
          className="w-full"
        >
          {isGoogleLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ChromeIcon className="mr-2 h-4 w-4" />
          )}
          Google
        </Button>
        <Button
          variant="outline"
          type="button"
          onClick={() => handleOAuthSignIn('github')}
          disabled={isLoading}
          className="w-full"
        >
          {isGithubLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Github className="mr-2 h-4 w-4" />
          )}
          GitHub
        </Button>
      </div>
    </form>
  );
}
