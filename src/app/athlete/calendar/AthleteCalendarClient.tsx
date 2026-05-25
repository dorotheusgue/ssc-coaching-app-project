"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  isToday,
  parseISO,
  isAfter,
  startOfDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  X,
  CalendarDays,
  List,
  SkipForward,
  CalendarCog,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  getSessionPreviewAction,
  skipSessionAction,
  rescheduleOwnSessionAction,
} from "./actions";

type Session = {
  id: number;
  date: string;
  label: string;
  status: string;
};

type PreviewBlock = {
  id: number;
  blockType: string;
  label: string | null;
  exercises: Array<{
    id: number;
    name: string;
    sets: number | null;
    reps: string | null;
    load: string | null;
    distance: number | null;
    time: number | null;
    restSeconds: number | null;
    rpeTarget: number | null;
    notes: string | null;
  }>;
};

const blockTypeColors: Record<string, string> = {
  warmup: "bg-cyan-500/10 border-cyan-500/30 text-cyan-300",
  sprint: "bg-blue-500/10 border-blue-500/30 text-blue-300",
  strength: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
  accessory: "bg-amber-500/10 border-amber-500/30 text-amber-300",
  notes: "bg-neutral-700/40 border-neutral-600 text-neutral-300",
};

function statusIcon(status: string) {
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
}

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
  const router = useRouter();
  const [view, setView] = useState<"month" | "list">("month");
  const [selectedSessionId, setSelectedSessionId] = useState<number | null>(
    null
  );
  const [preview, setPreview] = useState<{
    session: Session;
    blocks: PreviewBlock[];
  } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [reschedule, setReschedule] = useState<string>("");
  const [isPending, startTransition] = useTransition();

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

  const todayStart = startOfDay(new Date());
  const upcomingSessions = [...sessions]
    .filter((s) => !isAfter(todayStart, parseISO(s.date)))
    .sort((a, b) => a.date.localeCompare(b.date));
  const pastSessions = [...sessions]
    .filter((s) => isAfter(todayStart, parseISO(s.date)))
    .sort((a, b) => b.date.localeCompare(a.date));

  const completedCount = sessions.filter((s) => s.status === "completed")
    .length;
  const totalSessions = sessions.length;

  async function openSession(id: number) {
    setSelectedSessionId(id);
    setPreview(null);
    setReschedule("");
    setPreviewLoading(true);
    const res = await getSessionPreviewAction(id);
    setPreviewLoading(false);
    if (res.ok) {
      setPreview({
        session: {
          id: res.session.id,
          date: res.session.date,
          label: res.session.label,
          status: res.session.status,
        },
        blocks: res.blocks,
      });
      setReschedule(res.session.date);
    }
  }

  function closeSession() {
    setSelectedSessionId(null);
    setPreview(null);
    setReschedule("");
  }

  function handleSkip() {
    if (!preview) return;
    startTransition(async () => {
      const res = await skipSessionAction(preview.session.id);
      if (res.ok) {
        closeSession();
        router.refresh();
      }
    });
  }

  function handleReschedule() {
    if (!preview || !reschedule || reschedule === preview.session.date) return;
    startTransition(async () => {
      const res = await rescheduleOwnSessionAction(
        preview.session.id,
        reschedule
      );
      if (res.ok) {
        closeSession();
        router.refresh();
      }
    });
  }

  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-neutral-400 text-sm mt-1">
            {completedCount}/{totalSessions} sessions completed this month
          </p>
        </div>
        <div className="flex gap-1 bg-neutral-800 border border-neutral-700 rounded-lg p-1">
          <button
            onClick={() => setView("month")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              view === "month"
                ? "bg-neutral-700 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            Month
          </button>
          <button
            onClick={() => setView("list")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
              view === "list"
                ? "bg-neutral-700 text-white"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            List
          </button>
        </div>
      </div>

      {view === "month" && (
        <>
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
                        <button
                          key={s.id}
                          onClick={() => openSession(s.id)}
                          className="w-full flex items-center gap-1 text-xs text-left hover:bg-neutral-700/50 rounded px-1 py-0.5 -mx-1 transition-colors cursor-pointer"
                        >
                          {statusIcon(s.status)}
                          <span className="text-neutral-300 truncate">
                            {s.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {view === "list" && (
        <div className="space-y-5">
          {upcomingSessions.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Upcoming
              </h2>
              <div className="space-y-2">
                {upcomingSessions.map((s) => (
                  <SessionRow key={s.id} session={s} onOpen={openSession} />
                ))}
              </div>
            </div>
          )}
          {pastSessions.length > 0 && (
            <div>
              <h2 className="text-sm font-medium text-neutral-400 mb-2 uppercase tracking-wider">
                Past
              </h2>
              <div className="space-y-2">
                {pastSessions.map((s) => (
                  <SessionRow key={s.id} session={s} onOpen={openSession} />
                ))}
              </div>
            </div>
          )}
          {sessions.length === 0 && (
            <p className="text-neutral-400 text-sm text-center py-8">
              No sessions this month.
            </p>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400">
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

      <Modal
        open={selectedSessionId !== null}
        onClose={closeSession}
        title={preview?.session.label ?? "Session"}
      >
        {previewLoading && (
          <div className="text-neutral-400 text-sm py-6 text-center">
            Loading…
          </div>
        )}
        {!previewLoading && preview && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              {statusIcon(preview.session.status)}
              <span>
                {format(parseISO(preview.session.date), "EEEE, MMMM d, yyyy")}
              </span>
              <span className="capitalize">· {preview.session.status}</span>
            </div>

            {preview.blocks.length === 0 ? (
              <p className="text-sm text-neutral-400">
                No exercises in this session.
              </p>
            ) : (
              <div className="space-y-3 max-h-[40vh] overflow-y-auto">
                {preview.blocks.map((b) => (
                  <div
                    key={b.id}
                    className={`border rounded-lg p-3 ${blockTypeColors[b.blockType] ?? "bg-neutral-700/30 border-neutral-600 text-neutral-300"}`}
                  >
                    <div className="text-xs font-semibold uppercase tracking-wider mb-2">
                      {b.label ?? b.blockType}
                    </div>
                    <ul className="space-y-1">
                      {b.exercises.map((ex) => (
                        <li
                          key={ex.id}
                          className="text-sm text-neutral-200"
                        >
                          <span className="font-medium">{ex.name}</span>
                          <span className="text-neutral-400 ml-2 text-xs">
                            {ex.sets && `${ex.sets}×`}
                            {ex.reps ?? ""}
                            {ex.load && ` @ ${ex.load}`}
                            {ex.distance && ` ${ex.distance}m`}
                            {ex.time && ` ${ex.time}s`}
                            {ex.rpeTarget !== null &&
                              ex.rpeTarget !== undefined &&
                              ` · RPE ${ex.rpeTarget}`}
                            {ex.restSeconds && ` · ${ex.restSeconds}s rest`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {preview.session.status !== "completed" && (
              <div className="pt-3 border-t border-neutral-700 space-y-3">
                <div className="flex items-center gap-2">
                  <CalendarCog className="w-4 h-4 text-neutral-400" />
                  <input
                    type="date"
                    value={reschedule}
                    onChange={(e) => setReschedule(e.target.value)}
                    className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleReschedule}
                    disabled={
                      isPending || reschedule === preview.session.date
                    }
                  >
                    Move
                  </Button>
                </div>
                <Button
                  variant="danger"
                  onClick={handleSkip}
                  disabled={isPending}
                  className="w-full"
                >
                  <SkipForward className="w-4 h-4 mr-2" />
                  Skip this session
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function SessionRow({
  session,
  onOpen,
}: {
  session: Session;
  onOpen: (id: number) => void;
}) {
  return (
    <button
      onClick={() => onOpen(session.id)}
      className="w-full flex items-center gap-3 p-3 bg-neutral-800 border border-neutral-700 rounded-lg hover:border-neutral-600 hover:bg-neutral-750 transition-colors text-left cursor-pointer"
    >
      <div className="shrink-0">{statusIcon(session.status)}</div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white truncate">
          {session.label}
        </div>
        <div className="text-xs text-neutral-400">
          {format(parseISO(session.date), "EEE, MMM d")}
        </div>
      </div>
      <span className="text-xs text-neutral-500 capitalize">
        {session.status}
      </span>
    </button>
  );
}
