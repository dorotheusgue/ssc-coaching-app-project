"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isToday,
  isSameMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { assignProgramAction, rescheduleSessionAction } from "./actions";

type Session = {
  id: number;
  date: string;
  label: string;
  status: string;
  athleteId: number;
  athleteName: string;
};

type Athlete = { id: number; name: string; email: string };
type Program = { id: number; name: string };
type Assignment = {
  id: number;
  programName: string;
  athleteName: string;
  startDate: string;
  status: string;
};

export default function CalendarClient({
  sessions,
  athletes,
  programs,
  assignments,
  currentMonth,
  prevMonth,
  nextMonth,
}: {
  sessions: Session[];
  athletes: Athlete[];
  programs: Program[];
  assignments: Assignment[];
  currentMonth: Date;
  prevMonth: { month: string; year: string };
  nextMonth: { month: string; year: string };
}) {
  const router = useRouter();
  const [showAssign, setShowAssign] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignError, setAssignError] = useState("");

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

  const statusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "emerald";
      case "in_progress":
        return "yellow";
      case "skipped":
        return "red";
      default:
        return "neutral";
    }
  };

  const daySessions = selectedDay ? sessionsByDate[selectedDay] ?? [] : [];

  async function handleAssign(formData: FormData) {
    setAssignLoading(true);
    setAssignError("");
    const result = await assignProgramAction(formData);
    setAssignLoading(false);
    if (result.error) {
      setAssignError(result.error);
    } else {
      setShowAssign(false);
      router.refresh();
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Calendar</h1>
          <p className="text-mute text-sm mt-1">
            Schedule and assign training programs
          </p>
        </div>
        <Button onClick={() => setShowAssign(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Assign Program
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <a
          href={`/coach/calendar?month=${prevMonth.month}&year=${prevMonth.year}`}
          className="p-2 rounded-lg hover:bg-hover text-mute hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </a>
        <h2 className="text-xl font-semibold text-ink">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <a
          href={`/coach/calendar?month=${nextMonth.month}&year=${nextMonth.year}`}
          className="p-2 rounded-lg hover:bg-hover text-mute hover:text-ink transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </a>
      </div>

      <div className="bg-surface rounded-xl border border-line overflow-hidden">
        <div className="grid grid-cols-7 border-b border-line">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="p-3 text-center text-sm font-medium text-mute border-r border-line last:border-r-0"
            >
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: startDow }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="min-h-28 p-2 border-r border-b border-line bg-surface"
            />
          ))}
          {days.map((day) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const daySessions = sessionsByDate[dateStr] ?? [];
            const today = isToday(day);
            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDay(dateStr)}
                className={`min-h-28 p-2 border-r border-b border-line cursor-pointer hover:bg-hover transition-colors ${
                  today ? "bg-surface ring-1 ring-emerald-500/30" : ""
                } ${selectedDay === dateStr ? "bg-surface" : ""}`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    today ? "text-emerald-400" : "text-ink"
                  }`}
                >
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {daySessions.slice(0, 3).map((s) => (
                    <div
                      key={s.id}
                      className={`text-xs px-1.5 py-0.5 rounded truncate ${
                        s.status === "completed"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : s.status === "in_progress"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-surface text-ink"
                      }`}
                    >
                      {s.athleteName.split(" ")[0]}: {s.label}
                    </div>
                  ))}
                  {daySessions.length > 3 && (
                    <div className="text-xs text-faint">
                      +{daySessions.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDay && daySessions.length > 0 && (
        <div className="bg-surface rounded-xl border border-line p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-ink">
              Sessions on {format(new Date(selectedDay + "T12:00:00"), "MMMM d, yyyy")}
            </h3>
            <button
              onClick={() => setSelectedDay(null)}
              className="text-mute hover:text-ink"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            {daySessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 bg-surface rounded-lg"
              >
                <div>
                  <div className="text-ink font-medium">{s.athleteName}</div>
                  <div className="text-mute text-sm">{s.label}</div>
                </div>
                <Badge color={statusColor(s.status) as "emerald" | "yellow" | "red" | "neutral"}>
                  {s.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface rounded-xl border border-line p-6">
        <h3 className="text-lg font-semibold text-ink mb-4">
          Recent Assignments
        </h3>
        <div className="space-y-2">
          {assignments.length === 0 ? (
            <p className="text-mute text-sm">No assignments yet.</p>
          ) : (
            assignments.map((a) => (
              <div
                key={a.id}
                className="flex items-center justify-between p-3 bg-surface rounded-lg"
              >
                <div>
                  <div className="text-ink font-medium">{a.programName}</div>
                  <div className="text-mute text-sm">
                    {a.athleteName} &middot; Started {a.startDate}
                  </div>
                </div>
                <Badge
                  color={
                    a.status === "active"
                      ? "emerald"
                      : a.status === "completed"
                        ? "blue"
                        : "neutral"
                  }
                >
                  {a.status}
                </Badge>
              </div>
            ))
          )}
        </div>
      </div>

      <Modal open={showAssign} onClose={() => setShowAssign(false)} title="Assign Program">
        <form action={handleAssign} className="space-y-4">
          {assignError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {assignError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Athlete
            </label>
            <select
              name="athleteId"
              required
              className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select athlete...</option>
              {athletes.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Program
            </label>
            <select
              name="programId"
              required
              className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Select program...</option>
              {programs.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              required
              className="w-full bg-surface border border-line rounded-lg px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="ghost" onClick={() => setShowAssign(false)} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={assignLoading}>
              {assignLoading ? "Assigning..." : "Assign"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
