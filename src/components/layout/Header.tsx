"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface HeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-neutral-900/80 backdrop-blur-md border-b border-neutral-800">
      <div className="flex items-center justify-between px-4 sm:px-6 py-3">
        <h1 className="text-lg font-bold text-emerald-500">SSC</h1>
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-white">
                {user.name}
              </span>
              <span className="text-xs text-neutral-400">{user.email}</span>
            </div>
          )}
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
