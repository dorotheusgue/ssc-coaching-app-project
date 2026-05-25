"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Calendar,
  MessageSquare,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Today", href: "/athlete", icon: CalendarDays },
  { label: "Calendar", href: "/athlete/calendar", icon: Calendar },
  { label: "Messages", href: "/athlete/messages", icon: MessageSquare },
  { label: "Media", href: "/athlete/media", icon: Video },
];

function AthleteNav({ unreadMessages = 0 }: { unreadMessages?: number }) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-900 border-t border-neutral-800 lg:hidden">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/athlete" && pathname.startsWith(item.href));
          const badge =
            item.href === "/athlete/messages" && unreadMessages > 0
              ? unreadMessages
              : null;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                isActive
                  ? "text-emerald-400"
                  : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <span className="relative">
                <item.icon className="h-5 w-5" />
                {badge !== null && (
                  <span className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {badge > 9 ? "9+" : badge}
                  </span>
                )}
              </span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export { AthleteNav };
