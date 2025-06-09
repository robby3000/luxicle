import { PrismaAdapter } from "@auth/prisma-adapter"
import { NextAuthOptions } from "next-auth"
import { prisma } from "./db"
import GitHubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { createClient } from '@supabase/supabase-js';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        console.log('[Auth][CredentialsProvider] Authorize attempt for:', credentials?.email);
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
          console.error('[Auth][CredentialsProvider] Supabase URL or Anon Key not configured in .env');
          throw new Error('Server configuration error for authentication.');
        }
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth][CredentialsProvider] Missing email or password.');
          throw new Error('Missing email or password');
        }

        // Create a temporary Supabase client for auth
        // Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are in your .env
        const supabaseAdmin = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { data: supabaseAuthData, error: supabaseError } = await supabaseAdmin.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });

        if (supabaseError || !supabaseAuthData?.user) {
          console.error('[Auth][CredentialsProvider] Supabase auth.signInWithPassword error for', credentials.email, ':', supabaseError?.message, supabaseError);
          // Throw an error or return null to indicate failed authentication
          // Returning null is standard for authorize if creds are invalid
          return null;
        }

        // If Supabase auth is successful, find the user in Prisma database
        // NextAuth.js with PrismaAdapter expects to manage users in Prisma
        console.log('[Auth][CredentialsProvider] Supabase auth successful for:', credentials.email, 'User ID:', supabaseAuthData.user.id);
        const dbUser = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (dbUser) {
          console.log('[Auth][CredentialsProvider] Prisma user found for:', dbUser.email, 'ID:', dbUser.id);
          // Return the user object that NextAuth.js expects
          return {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            image: dbUser.image,
            // Add any other properties NextAuth.js needs for the session/token
          };
        } else {
          // Handle case where user is in Supabase auth but not in Prisma DB
          // This might mean creating the user in Prisma here, or throwing an error
          // For now, we'll treat it as a failed login if not in Prisma, as PrismaAdapter is primary user store
          console.error('[Auth][CredentialsProvider] User authenticated with Supabase but NOT found in Prisma DB for email:', credentials.email);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name
        session.user.email = token.email
        session.user.image = token.picture
      }
      return session
    },
    async jwt({ token, user }) {
      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email,
        },
      })

      if (!dbUser) {
        if (user) {
          token.id = user.id
        }
        return token
      }

      return {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
