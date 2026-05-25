"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Dumbbell,
  Calendar,
  MessageSquare,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/coach/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/coach/athletes", label: "Athletes", icon: Users },
  { href: "/coach/programs", label: "Programs", icon: ClipboardList },
  { href: "/coach/exercises", label: "Exercises", icon: Dumbbell },
  { href: "/coach/calendar", label: "Calendar", icon: Calendar },
  { href: "/coach/messages", label: "Messages", icon: MessageSquare },
];

export default function Sidebar({
  unreadMessages = 0,
}: {
  unreadMessages?: number;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) => pathname.startsWith(href);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-neutral-700">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <span className="text-lg font-bold text-white">SSC</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          const badge =
            item.href === "/coach/messages" && unreadMessages > 0
              ? unreadMessages
              : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "text-neutral-400 hover:bg-neutral-700 hover:text-white"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              {badge !== null && (
                <span className="min-w-[20px] h-[20px] px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {badge > 9 ? "9+" : badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-neutral-700">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-neutral-800 text-white border border-neutral-700 cursor-pointer"
      >
        <Menu className="w-5 h-5" />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-neutral-900 border-r border-neutral-700">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1 text-neutral-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarContent}
          </div>
        </div>
      )}

      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-neutral-900 border-r border-neutral-700">
        {sidebarContent}
      </aside>
    </>
  );
}
