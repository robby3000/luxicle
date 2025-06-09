"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  LayoutDashboard,
  User,
  Award,
  Settings,
  MessageSquare,
  List,
  Bell,
  PlusCircle
} from "lucide-react";

interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  isCollapsed?: boolean;
}

export function Sidebar({ className, isCollapsed = false }: SidebarNavProps) {
  const pathname = usePathname();

  const navItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Profile",
      href: "/profile",
      icon: User,
    },
    {
      title: "My Luxicles",
      href: "/dashboard/luxicles",
      icon: List,
    },
    {
      title: "Challenges",
      href: "/dashboard/challenges",
      icon: Award,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: MessageSquare,
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
    },
  ];

  return (
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          {!isCollapsed && (
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Dashboard
            </h2>
          )}
          <div className="space-y-1">
            <Button 
              variant="default" 
              size={isCollapsed ? "icon" : "default"}
              className={cn(
                isCollapsed ? "w-9 px-0" : "w-full justify-start",
                "mb-4"
              )}
              asChild
            >
              <Link href="/luxicles/create">
                {!isCollapsed && "Create Luxicle"}
                <PlusCircle className={cn("h-4 w-4", !isCollapsed && "ml-2")} />
              </Link>
            </Button>
            
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? "secondary" : "ghost"}
                  size={isCollapsed ? "icon" : "default"}
                  className={cn(
                    isCollapsed ? "w-9 px-0" : "w-full justify-start",
                    pathname === item.href && "bg-muted"
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
                    {!isCollapsed && item.title}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
        <Separator />
        <div className="px-3 py-2">
          {!isCollapsed && (
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Categories
            </h2>
          )}
          <div className="space-y-1">
            {["Music", "Movies", "Books", "Games", "Food"].map((category) => (
              <Button
                key={category}
                variant="ghost"
                size={isCollapsed ? "icon" : "default"}
                className={cn(
                  isCollapsed ? "w-9 px-0" : "w-full justify-start"
                )}
                asChild
              >
                <Link href={`/category/${category.toLowerCase()}`}>
                  {!isCollapsed && category}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
