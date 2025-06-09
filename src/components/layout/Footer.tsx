"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  const footerLinks = [
    { name: "About", href: "/about" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
    { name: "Help", href: "/help" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <footer className="border-t bg-background">
      <div className="container py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div className="mb-6 md:mb-0">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Luxicle</span>
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              Privacy-First Social Platform for Monthly Challenges
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-6">
            <div>
              <h3 className="text-sm font-semibold mb-2">Resources</h3>
              <ul className="text-sm space-y-2">
                <li>
                  <Link href="/challenges" className="text-muted-foreground hover:text-foreground transition-colors">
                    Challenges
                  </Link>
                </li>
                <li>
                  <Link href="/luxicles" className="text-muted-foreground hover:text-foreground transition-colors">
                    Explore
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Follow Us</h3>
              <ul className="text-sm space-y-2">
                <li>
                  <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                    Instagram
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-2">Legal</h3>
              <ul className="text-sm space-y-2">
                <li>
                  <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center md:flex md:items-center md:justify-between">
          <div className="flex justify-center space-x-6 md:order-2">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="mt-4 md:mt-0 md:order-1 text-sm text-muted-foreground">
            © {currentYear} Luxicle. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
