"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/lib/theme/ThemeToggle";

interface HeaderProps {
 user?: {
 name?: string | null;
 email?: string | null;
 image?: string | null;
 };
}

function Header({ user }: HeaderProps) {
 return (
 <header className="sticky top-0 z-30 bg-bg/80 backdrop-blur-md border-b border-rule">
 <div className="flex items-center justify-between px-4 sm:px-6 py-3">
 <h1 className="text-lg font-bold text-ink tracking-tight">SSC</h1>
 <div className="flex items-center gap-3">
 {user && (
 <div className="hidden sm:flex flex-col items-end">
 <span className="text-sm font-medium text-ink">
 {user.name}
 </span>
 <span className="text-xs text-mute">{user.email}</span>
 </div>
 )}
 <ThemeToggle />
 <Button
 variant="ghost"
 size="sm"
 onClick={() => signOut({ callbackUrl: "/login" })}
 >
 <LogOut className="h-4 w-4 mr-1.5" />
 Sign Out
 </Button>
 </div>
 </div>
 </header>
 );
}

export { Header };
export type { HeaderProps };
