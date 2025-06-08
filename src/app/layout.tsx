import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
// import { getServerSession } from 'next-auth/next'; // Replaced by Supabase
// import { authOptions } from '@/lib/auth'; // Replaced by Supabase
import { Providers } from '@/providers';
import Link from 'next/link';
import AuthStatus from '@/components/auth/AuthStatus'; // Added AuthStatus import
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Luxicle - Creative Challenges for Makers',
  description: 'A privacy-first social platform for creators to participate in monthly creative challenges',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#0f172a' },
  ],
};

export default function RootLayout({ // Changed to non-async as getServerSession is removed
  children,
}: {
  children: React.ReactNode;
}) {
  // const session = await getServerSession(authOptions); // Replaced by AuthStatus component

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background`}>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="border-b">
              <div className="container flex h-16 items-center justify-between py-4">
                <Link href="/" className="text-2xl font-bold">Luxicle</Link>
                <nav>
                  <ul className="flex space-x-6">
                    <li><Link href="/challenges" className="hover:underline">Challenges</Link></li>
                    <li><Link href="/explore" className="hover:underline">Explore</Link></li>
                  </ul>
                </nav>
                <div className="flex items-center space-x-4">
                  <AuthStatus />
                </div>
              </div>
            </header>
            <main className="flex-1">
              {children}
            </main>
            <footer className="border-t py-6">
              <div className="container">
                <p className="text-center text-sm text-muted-foreground">
                  &copy; {new Date().getFullYear()} Luxicle. All rights reserved.
                </p>
                <div className="flex gap-4">
                  <a href="/privacy" className="text-sm text-muted-foreground hover:underline">Privacy</a>
                  <a href="/terms" className="text-sm text-muted-foreground hover:underline">Terms</a>
                  <a href="/contact" className="text-sm text-muted-foreground hover:underline">Contact</a>
                </div>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
