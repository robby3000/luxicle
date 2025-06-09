"use client";

import { useMemo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Define a minimal User type based on the project's actual database schema
type User = {
  username?: string | null;
  avatar_url?: string | null;
  display_name?: string | null;
};

interface UserAvatarProps {
  user: Pick<User, "username" | "avatar_url" | "display_name"> | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  fallbackClassName?: string;
  onClick?: () => void;
  showStatus?: boolean;
  status?: "online" | "offline" | "away";
}

export function UserAvatar({
  user,
  size = "md",
  className,
  fallbackClassName,
  onClick,
  showStatus = false,
  status = "offline"
}: UserAvatarProps) {
  const sizeClasses = {
    xs: "h-6 w-6 text-xs",
    sm: "h-8 w-8 text-sm",
    md: "h-10 w-10 text-base",
    lg: "h-14 w-14 text-lg",
    xl: "h-20 w-20 text-xl"
  };

  const statusClasses = {
    online: "bg-green-500",
    offline: "bg-gray-400",
    away: "bg-yellow-500"
  };

  const initials = useMemo(() => {
    if (!user) return "?";
    
    if (user.display_name) {
      return user.display_name
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
    }

    return user.username?.substring(0, 2).toUpperCase() || "?";
  }, [user]);

  return (
    <div className="relative">
      <Avatar 
        className={cn(sizeClasses[size], className)} 
        onClick={onClick}
      >
        <AvatarImage 
          src={user?.avatar_url || ""} 
          alt={user?.display_name || user?.username || "User"}
          className="object-cover"
        />
        <AvatarFallback className={cn("bg-muted", fallbackClassName)}>
          {initials}
        </AvatarFallback>
      </Avatar>

      {showStatus && (
        <span 
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-background",
            sizeClasses[size].includes("h-6") ? "h-2 w-2" : 
            sizeClasses[size].includes("h-8") ? "h-2.5 w-2.5" : 
            sizeClasses[size].includes("h-10") ? "h-3 w-3" : "h-3.5 w-3.5",
            statusClasses[status]
          )}
        />
      )}
    </div>
  );
}

export default UserAvatar;
