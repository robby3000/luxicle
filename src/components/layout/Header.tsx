"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import { User } from "@supabase/supabase-js";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { Menu, X, Home, List, Award, PlusCircle, LogOut, Settings, User as UserIcon } from "lucide-react";
import { colors } from "@/constants/design";
import ThemeToggle from "@/components/ui/ThemeToggle";

interface HeaderProps {
  user?: User | null;
}

export function Header({ user }: HeaderProps) {
  const pathname = usePathname();

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Explore", href: "/luxicles", icon: List },
    { name: "Challenges", href: "/challenges", icon: Award },
  ];

  const userNavigation = [
    { name: "Profile", href: "/profile", icon: UserIcon },
    { name: "Settings", href: "/settings", icon: Settings },
    { name: "Sign out", href: "/api/auth/signout", icon: LogOut },
  ];

  // Get current username from user metadata if available
  const username = user?.user_metadata?.username || user?.user_metadata?.full_name || "User";
  const hasUser = !!user;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">Luxicle</span>
          </Link>
        </div>

        {/* Navigation (visible on all screen sizes) */}
        <div className="flex-1 flex items-center justify-end space-x-4">
          {/* Navigation links */}
          <nav className="flex items-center space-x-2 sm:space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center text-sm font-medium transition-colors hover:text-primary",
                    pathname === item.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4 mr-1" />
                  {item.name}
                </Link>
              );
            })}
            
            {/* New Luxicle button for logged in users */}
            {hasUser && (
              <Link 
                href="/luxicles/create"
                className="flex items-center text-sm font-medium transition-colors hover:text-primary text-muted-foreground"
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                New Luxicle
              </Link>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            {/* Theme toggle */}
            <ThemeToggle />
            
            {/* User menu or auth buttons */}
            {hasUser ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0" aria-label="User menu">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.user_metadata?.avatar_url || ""} alt={username} />
                      <AvatarFallback>{username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{username}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userNavigation.map((item) => (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link href={item.href} className="flex items-center">
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.name}</span>
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
