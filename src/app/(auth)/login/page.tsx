'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// TODO: Uncomment and ensure these components exist in your project
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { toast } from '@/components/ui/use-toast';

// Temporary components - replace with your actual UI components
const Button = ({ children, className = '', type = 'button', disabled = false, onClick, variant = 'default' }: any) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`px-4 py-2 rounded-md font-medium ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${
      variant === 'outline' 
        ? 'border border-input bg-background hover:bg-accent hover:text-accent-foreground' 
        : 'bg-primary text-primary-foreground hover:bg-primary/90'
    } ${className}`}
  >
    {children}
  </button>
);

const Input = ({ className = '', ...props }: any) => (
  <input
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

// Temporary toast implementation
const toast = ({ title, description, variant = 'default' }: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
  console.log(`[${variant === 'destructive' ? 'ERROR' : 'INFO'}] ${title}: ${description}`);
};

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log('[LoginPage] onSubmit triggered with data:', data);
    setIsLoading(true);
    let signInError: string | null = null;

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
        // callbackUrl, // Passing callbackUrl here can sometimes interfere with error handling
      });

      console.log('[LoginPage] signIn result:', result);

      if (result?.ok) {
        // Successful sign-in
        console.log('[LoginPage] signIn successful. Redirecting to:', callbackUrl);
        router.push(callbackUrl); // Use the callbackUrl determined earlier
        router.refresh(); // Important for server components to re-fetch session
        // No need to setIsLoading(false) here if navigating away, but good practice if navigation could fail client-side
        return; // Exit early on success
      }

      // If not ok, there should be an error
      if (result?.error) {
        console.warn('[LoginPage] signIn error:', result.error);
        if (result.error === 'CredentialsSignin') {
          signInError = 'Invalid email or password. Please check your credentials and try again.';
        } else if (result.error === 'Callback') {
          // This can happen if there's an issue in the authorize function (e.g., throwing an error)
          // or if the user object returned from authorize is invalid.
          signInError = 'Login failed. There might be an issue with your account or server configuration.';
        } else {
          signInError = `Login attempt failed: ${result.error}`;
        }
      } else {
        // No error, but not ok. This is an unexpected state.
        console.error('[LoginPage] signIn returned !ok without an error.');
        signInError = 'An unexpected issue occurred during login. Please try again.';
      }
    } catch (error: any) { // Catch errors from the await signIn call itself (e.g., network issues)
      console.error('[LoginPage] Exception during signIn call:', error);
      signInError = error.message || 'A network or unexpected error occurred. Please try again.';
    }
          // If we reached here, login failed or an error occurred
    if (signInError) {
      setError('root', { type: 'manual', message: signInError });
      toast({
        title: 'Login Failed',
        description: signInError,
        variant: 'destructive',
      });
    }
    setIsLoading(false); // Ensure loading is set to false on any failure path
  };


  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') {
        setIsGoogleLoading(true);
      } else {
        setIsGithubLoading(true);
      }

      await signIn(provider, { callbackUrl });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'An error occurred while signing in',
        variant: 'destructive',
      });
    } finally {
      setIsGoogleLoading(false);
      setIsGithubLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-lg">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          {errors.root && (
            <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive">
              {errors.root.message}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-muted-foreground mb-1">
                Email address
              </label>
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
                <label htmlFor="password" className="block text-sm font-medium text-muted-foreground mb-1">
                  Password
                </label>
                <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
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
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign in
            </Button>
          </div>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isGoogleLoading || isLoading}
            className="w-full justify-center"
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
                  <path
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60999L5.27028 9.70496C6.21525 6.86096 8.87028 4.75 12.0003 4.75Z"
                    fill="#EA4335"
                  />
                  <path
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M5.265 14.2949C5.025 13.5699 4.885 12.7999 4.885 11.9999C4.885 11.1999 5.025 10.4299 5.265 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.265 14.2949Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21538 17.135 5.26538 14.29L1.36539 17.38C3.33539 21.3 7.3804 24.0001 12.0004 24.0001Z"
                    fill="#34A853"
                  />
                </svg>
                Google
              </>
            )}
          </Button>
          <Button
            variant="outline"
            type="button"
            onClick={() => handleOAuthSignIn('github')}
            disabled={isGithubLoading || isLoading}
            className="w-full justify-center"
          >
            {isGithubLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.386-1.332-1.755-1.332-1.755-1.087-.744.084-.729.084-.729 1.205.085 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.627-5.373-12-12-12z" />
                </svg>
                GitHub
              </>
            )}
          </Button>

        </div>
      </div>
    </div>
  );
}

