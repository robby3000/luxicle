'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

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

const Checkbox = ({ className = '', ...props }: any) => (
  <input
    type="checkbox"
    className={`h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary ${className}`}
    {...props}
  />
);

// Temporary toast implementation
const toast = ({ title, description, variant = 'default' }: { title: string; description: string; variant?: 'default' | 'destructive' }) => {
  console.log(`[${variant === 'destructive' ? 'ERROR' : 'INFO'}] ${title}: ${description}`);
};

// Form validation schema
const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  terms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
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
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Register the user with Supabase Auth
      const supabase = createSupabaseBrowserClient();
      
      // Register the user
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.firstName,
            last_name: data.lastName,
            full_name: `${data.firstName} ${data.lastName}`,
          }
        }
      });

      if (signUpError) {
        throw new Error(signUpError.message);
      }

      // Check if email confirmation is required
      if (!authData.session) {
        toast({
          title: 'Success',
          description: 'Please check your email to confirm your registration',
          variant: 'default',
        });
        router.push('/login'); // Redirect to login page
        return;
      }
      
      // If email confirmation is not required and we got a session, redirect
      router.push(callbackUrl);
      router.refresh();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setError('root', {
        type: 'manual',
        message: errorMessage,
      });
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      if (provider === 'google') {
        setIsGoogleLoading(true);
      } else {
        setIsGithubLoading(true);
      }

      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${callbackUrl}`,
        },
      });

      if (error) {
        throw error;
      }

      // The OAuth flow will redirect the user, no need to do anything else here
    } catch (error: any) {
      console.error(`[RegisterPage] OAuth sign-in error with ${provider}:`, error);
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while signing in',
        variant: 'destructive',
      });
      
      // Reset loading state in case the redirect doesn't happen
      setIsGoogleLoading(false);
      setIsGithubLoading(false);
    }
  };
  
  const Label = ({ htmlFor, children, className = '' }: { htmlFor: string; children: React.ReactNode; className?: string }) => (
    <label htmlFor={htmlFor} className={`block text-sm font-medium text-muted-foreground mb-1 ${className}`}>
      {children}
    </label>
  );
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link 
              href="/login" 
              className="font-medium text-primary hover:underline"
            >
              Sign in
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  type="text"
                  autoComplete="given-name"
                  placeholder="John"
                  disabled={isLoading}
                  {...register('firstName')}
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  type="text"
                  autoComplete="family-name"
                  placeholder="Doe"
                  disabled={isLoading}
                  {...register('lastName')}
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email address</Label>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isLoading}
                {...register('password')}
              />
              {errors.password ? (
                <p className="mt-1 text-sm text-destructive">
                  {errors.password.message}
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Password must be at least 8 characters with uppercase, lowercase, number & special character
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isLoading}
                {...register('confirmPassword')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                {...register('terms')}
                disabled={isLoading}
              />
              <div className="grid gap-1.5 leading-none">
                <label
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
                </label>
                {errors.terms && (
                  <p className="text-sm text-destructive">
                    {errors.terms.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full mt-4" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create account
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or sign up with
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                focusable="false"
                data-prefix="fab"
                data-icon="github"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
                <path d="M1 1h22v22H1z" fill="none" />
              </svg>
            )}
            Google
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
              <svg
                className="mr-2 h-4 w-4"
                aria-hidden="true"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.113 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"
                />
              </svg>
            )}
            GitHub
          </Button>
        </div>
      </div>
    </div>
  );
}
