# Luxicle - Privacy-First Social Platform for Monthly Challenges

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14.0+-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?logo=supabase&logoColor=white)](https://supabase.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

## Overview

Luxicle is a privacy-first social platform designed for creators to participate in and share monthly challenges. The platform enables users to create, discover, and engage with creative challenges across various categories while maintaining control over their data and privacy.

## Features

- **User Profiles**: Customizable profiles with bios, social links, and challenge history
- **Monthly Challenges**: Participate in featured challenges with specific themes and rules
- **Luxicles**: Create and share collections of media (images, videos, links) for challenges
- **Social Features**: Follow creators, like, comment, and send private messages
- **Discovery**: Browse challenges by category, tags, or search
- **Responsive Design**: Fully responsive interface that works on all devices

## Tech Stack

- **Frontend**: 
  - Next.js 14+ (App Router)
  - TypeScript
  - Tailwind CSS
  - shadcn/ui + Radix UI
  - Zustand + React Query
  - React Hook Form + Zod

- **Backend & Database**:
  - Supabase (PostgreSQL)
  - Supabase Auth
  - Supabase Storage
  - Supabase Realtime
  - Edge Functions

- **Hosting & Deployment**:
  - Vercel (Frontend)
  - Supabase (Backend)

## Getting Started

### Prerequisites

- Node.js 18.0.0 or later
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Supabase Configuration

This project uses a **remote Supabase instance** for development and production. Local Supabase setup is not required or recommended.

1. Create a project in the [Supabase Dashboard](https://app.supabase.com/)
2. Copy your project's API URL and keys
3. Setup your environment variables (see below)
4. Run the migration scripts in the Supabase dashboard SQL editor
   - The migration files can be found in `supabase/migrations/`
5. Run the seed script (optional):
   ```bash
   # First set up your .env.local file with your Supabase credentials
   # Then run:
   npm run db:seed
   # or
   yarn db:seed
   ```

### Local Development

1.  Clone the repository:
    ```bash
    git clone https://github.com/robby3000/luxicle.git # Ensure this is your correct repo URL
    cd luxicle
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Set up environment variables:
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    # Add any other necessary environment variables (e.g., for NextAuth)
    ```

4.  Run the development server:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

5.  Linting and Formatting:
    The project is set up with ESLint and Prettier.
    ```bash
    npm run lint          # Check for linting errors
    npm run lint:fix      # Automatically fix linting errors
    npm run format        # Format code with Prettier
    npm run format:check  # Check if code is formatted correctly
    ```

## UI Components

This project uses a custom UI component library built with Radix UI primitives and styled with Tailwind CSS. Components are located in `@/components/ui`.

### Key Components & Usage

**Button:**

```tsx
import { Button } from '@/components/ui/button';

<Button variant="primary" size="lg" onClick={() => console.log('Clicked!')}>
  Primary Button
</Button>
```
Props: `variant`, `size`, `asChild`, standard button props.

**Input:**

```tsx
import { Input } from '@/components/ui/input';

<Input type="email" placeholder="Enter your email" />
```
Props: Standard input props.

**Checkbox:**

```tsx
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms and conditions</Label>
</div>
```
Props: Standard checkbox props.

**Label:**

```tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input'; // Assuming Input is used with Label

<Label htmlFor="username">Username</Label>
<Input id="username" />
```
Props: Standard label props.

**Toast:**

To use toasts, ensure `ToastProvider` is wrapping your application (typically in `providers.tsx`).

```tsx
import { useToast } from '@/components/ui'; // or '@/components/ui/toast'

// In a component:
const { toast } = useToast();

toast({
  title: 'Success!',
  description: 'Your profile has been updated.',
  type: 'success', // 'default', 'success', 'error', 'warning', 'info'
  duration: 5000, // Optional, defaults to 5 seconds
  action: { // Optional
    label: 'Undo',
    onClick: () => console.log('Undo action'),
  },
});
```

## Database Schema

The database schema is designed with scalability and performance in mind. Key tables include:

- `users`: User profiles and authentication
- `challenges`: Monthly challenge details
- `luxicles`: User submissions for challenges
- `categories` & `tags`: For content organization
- `messages`: Private user communications

See the full schema in the [technical specification](./plans%20and%20docs/luxicle-tech-spec-Claude.md).

## Deployment

### Vercel Deployment

1. Push your code to a GitHub/GitLab/Bitbucket repository
2. Import the repository to Vercel
3. Add the same environment variables as in your `.env.local`
4. Deploy!

### Supabase Setup

1. Create a new project in Supabase
2. Run the SQL schema from the technical specification
3. Set up storage buckets for media uploads
4. Configure authentication providers as needed

## Contributing

Contributions are welcome! Please read our [contributing guidelines](CONTRIBUTING.md) before submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

- Built with [Next.js](https://nextjs.org/) and [Supabase](https://supabase.com/)
- UI components powered by [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)
