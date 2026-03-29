"use client";

import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

type Session = {
  id: number;
  date: string;
  label: string;
  status: string;
};

export default function AthleteCalendarClient({
  sessions,
  currentMonth,
  prevMonth,
  nextMonth,
}: {
  sessions: Session[];
  currentMonth: Date;
  prevMonth: { month: string; year: string };
  nextMonth: { month: string; year: string };
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDow = getDay(monthStart);

  const sessionsByDate = sessions.reduce(
    (acc, s) => {
      if (!acc[s.date]) acc[s.date] = [];
      acc[s.date].push(s);
      return acc;
    },
    {} as Record<string, Session[]>
  );

  const statusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case "skipped":
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Circle className="w-4 h-4 text-neutral-500" />;
    }
  };

  const completedCount = sessions.filter((s) => s.status === "completed").length;
  const totalSessions = sessions.length;

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Calendar</h1>
        <p className="text-neutral-400 text-sm mt-1">
          {completedCount}/{totalSessions} sessions completed this month
        </p>
      </div>

      <div className="flex items-center justify-between">
        <a
          href={`/athlete/calendar?month=${prevMonth.month}&year=${prevMonth.year}`}
          className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </a>
        <h2 className="text-xl font-semibold text-white">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <a
          href={`/athlete/calendar?month=${nextMonth.month}&year=${nextMonth.year}`}
          className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </a>
      </div>

      <div className="bg-neutral-800 rounded-xl border border-neutral-700 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-neutral-700">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="p-2 text-center text-xs font-medium text-neutral-400 border-r border-neutral-700 last:border-r-0"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: startDow }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-20 p-1.5 border-r border-b border-neutral-700 bg-neutral-850"
            />
          ))}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const daySessions = sessionsByDate[dateStr] ?? [];
            const today = isToday(day);
            return (
              <div
                key={dateStr}
                className={`min-h-20 p-1.5 border-r border-b border-neutral-700 ${
                  today ? "bg-neutral-750 ring-1 ring-emerald-500/30" : ""
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    today ? "text-emerald-400" : "text-neutral-300"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {daySessions.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center gap-1 text-xs"
                    >
                      {statusIcon(s.status)}
                      <span className="text-neutral-300 truncate">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs text-neutral-400">
        <div className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Completed
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-yellow-400" /> In Progress
        </div>
        <div className="flex items-center gap-1">
          <Circle className="w-3 h-3 text-neutral-500" /> Scheduled
        </div>
        <div className="flex items-center gap-1">
          <XCircle className="w-3 h-3 text-red-400" /> Skipped
        </div>
      </div>
    </div>
  );
}
