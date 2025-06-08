import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <h1 className="text-5xl font-bold mb-6">Welcome to <span className="text-primary">Luxicle</span></h1>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        A privacy-first social platform for creative monthly challenges. Showcase your work, get inspired, and connect with creators.
      </p>
      <div className="flex gap-4">
        <Link 
          href="/register" 
          className="bg-primary text-primary-foreground px-6 py-3 rounded-md text-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Get Started
        </Link>
        <Link 
          href="/challenges" 
          className="border border-input bg-background hover:bg-accent hover:text-accent-foreground px-6 py-3 rounded-md text-lg font-medium transition-colors"
        >
          Explore Challenges
        </Link>
      </div>
      
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <div className="p-6 border rounded-lg">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
          <p className="text-muted-foreground">Your data belongs to you. We don't sell your information to third parties.</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M12 2v4"></path>
              <path d="m16.2 7.8 2.9-2.9"></path>
              <path d="M18 12h4"></path>
              <path d="m16.2 16.2 2.9 2.9"></path>
              <path d="M12 18v4"></path>
              <path d="m7.8 16.2-2.9 2.9"></path>
              <path d="M2 12h4"></path>
              <path d="m7.8 7.8-2.9-2.9"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Monthly Challenges</h3>
          <p className="text-muted-foreground">Participate in creative challenges and push your boundaries.</p>
        </div>
        
        <div className="p-6 border rounded-lg">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Community</h3>
          <p className="text-muted-foreground">Connect with like-minded creators and grow together.</p>
        </div>
      </div>
    </div>
  );
}
