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

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/luxicle.git
   cd luxicle
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

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
