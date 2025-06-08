'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      setIsLoading(false);
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Registration failed. Please try again.');
      } else {
        setSuccessMessage(data.message || 'Registration successful! Please check your email to confirm.');
        // Optionally redirect or clear form
        // router.push('/auth/login'); 
        setEmail('');
        setUsername('');
        setPassword('');
      }
    } catch (err) {
      console.error('Registration request failed:', err);
      setError('An unexpected error occurred. Please try again.');
    }

    setIsLoading(false);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-xl dark:bg-gray-800">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-800 dark:text-white">Create your Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</Label>
            <Input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full"
              disabled={isLoading}
            />
          </div>
          <div>
            <Label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full"
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          {successMessage && (
            <p className="text-sm text-green-600 dark:text-green-400">{successMessage}</p>
          )}

          <div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </div>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
