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
import { ChevronLeft, ChevronRight, Plus, Calendar as CalIcon, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
 assignProgramAction,
 rescheduleSessionAction,
 deleteAssignedSessionAction,
 deleteAssignedSessionsAction,
 deleteAssignmentAction,
} from "./actions";

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
 const [selectedDaySessions, setSelectedDaySessions] = useState<Set<number>>(
 new Set()
 );
 const [assignLoading, setAssignLoading] = useState(false);
 const [assignError, setAssignError] = useState("");
 const [colorBy, setColorBy] = useState<"status" | "athlete">("status");
 const [draggingSessionId, setDraggingSessionId] = useState<number | null>(null);
 const [dragOverDate, setDragOverDate] = useState<string | null>(null);

 async function handleDropOnDate(sessionId: number, newDate: string) {
 const current = sessions.find((s) => s.id === sessionId);
 if (!current || current.date === newDate) return;
 await rescheduleSessionAction(sessionId, newDate);
 router.refresh();
 }

 // Stable monochrome tints, hashed off athleteId.
 const ATHLETE_TINTS = [
 "bg-ink/10 text-ink",
 "bg-ink/20 text-ink",
 "bg-ink/30 text-ink",
 "bg-ink/40 text-ink",
 "bg-ink/55 text-bg",
 "bg-ink/70 text-bg",
 "bg-ink/85 text-bg",
 ];
 function tintForAthlete(id: number) {
 return ATHLETE_TINTS[Math.abs(id) % ATHLETE_TINTS.length];
 }

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

 async function handleDeleteSession(s: Session) {
 if (
 !confirm(
 `Remove session "${s.label}" for ${s.athleteName}? Any logged sets will be lost.`
 )
 ) {
 return;
 }
 await deleteAssignedSessionAction(s.id);
 router.refresh();
 }

 function toggleDaySession(id: number) {
 setSelectedDaySessions((prev) => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 return next;
 });
 }

 function toggleAllDaySessions() {
 const allIds = daySessions.map((s) => s.id);
 const allSelected = allIds.every((id) => selectedDaySessions.has(id));
 setSelectedDaySessions(allSelected ? new Set() : new Set(allIds));
 }

 async function handleBulkDeleteDay() {
 const ids = Array.from(selectedDaySessions);
 if (ids.length === 0) return;
 if (
 !confirm(
 `Remove ${ids.length} session${ids.length === 1 ? "" : "s"}? Any logged sets will be lost.`
 )
 ) {
 return;
 }
 await deleteAssignedSessionsAction(ids);
 setSelectedDaySessions(new Set());
 router.refresh();
 }

 async function handleDeleteAssignment(a: Assignment) {
 if (
 !confirm(
 `Unassign program "${a.programName}" from ${a.athleteName}? This removes all of its scheduled sessions.`
 )
 ) {
 return;
 }
 await deleteAssignmentAction(a.id);
 router.refresh();
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
 <div className="flex items-center gap-2">
 <div className="flex border border-line bg-surface">
 {(["status", "athlete"] as const).map((m) => (
 <button
 key={m}
 onClick={() => setColorBy(m)}
 className={`px-2.5 h-9 text-xs capitalize cursor-pointer transition-colors ${
 colorBy === m
 ? "bg-ink text-bg"
 : "text-mute hover:text-ink"
 }`}
 title={`Color sessions by ${m}`}
 >
 {m}
 </button>
 ))}
 </div>
 <Button onClick={() => setShowAssign(true)}>
 <Plus className="w-4 h-4 mr-2" />
 Assign Program
 </Button>
 </div>
 </div>

 <div className="flex items-center justify-between">
 <a
 href={`/coach/calendar?month=${prevMonth.month}&year=${prevMonth.year}`}
 className="p-2 hover:bg-hover text-mute hover:text-ink transition-colors"
 >
 <ChevronLeft className="w-5 h-5" />
 </a>
 <h2 className="text-xl font-semibold text-ink">
 {format(currentMonth, "MMMM yyyy")}
 </h2>
 <a
 href={`/coach/calendar?month=${nextMonth.month}&year=${nextMonth.year}`}
 className="p-2 hover:bg-hover text-mute hover:text-ink transition-colors"
 >
 <ChevronRight className="w-5 h-5" />
 </a>
 </div>

 <div className="bg-surface border border-line overflow-hidden">
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
 const isDropTarget = dragOverDate === dateStr;
 return (
 <div
 key={dateStr}
 onClick={() => {
 setSelectedDay(dateStr);
 setSelectedDaySessions(new Set());
 }}
 onDragOver={(e) => {
 if (draggingSessionId !== null) {
 e.preventDefault();
 e.dataTransfer.dropEffect = "move";
 if (dragOverDate !== dateStr) setDragOverDate(dateStr);
 }
 }}
 onDragLeave={() => {
 if (dragOverDate === dateStr) setDragOverDate(null);
 }}
 onDrop={(e) => {
 e.preventDefault();
 const id = draggingSessionId;
 setDragOverDate(null);
 setDraggingSessionId(null);
 if (id !== null) {
 void handleDropOnDate(id, dateStr);
 }
 }}
 className={`min-h-28 p-2 border-r border-b border-line cursor-pointer hover:bg-hover transition-colors ${
 today ? "bg-surface ring-1 ring-ink/30" : ""
 } ${selectedDay === dateStr ? "bg-surface" : ""} ${
 isDropTarget ? "ring-2 ring-ink bg-ink/5" : ""
 }`}
 >
 <div
 className={`text-sm font-medium mb-1 ${
 today ? "text-ink" : "text-ink"
 }`}
 >
 {format(day, "d")}
 </div>
 <div className="space-y-1">
 {daySessions.slice(0, 3).map((s) => {
 const tint =
 colorBy === "athlete"
 ? tintForAthlete(s.athleteId)
 : s.status === "completed"
 ? "bg-ink/30 text-ink"
 : s.status === "in_progress"
 ? "bg-ink/15 text-ink"
 : "bg-surface text-ink";
 const dragging = draggingSessionId === s.id;
 return (
 <div
 key={s.id}
 draggable
 onDragStart={(e) => {
 e.stopPropagation();
 setDraggingSessionId(s.id);
 e.dataTransfer.effectAllowed = "move";
 e.dataTransfer.setData("text/plain", String(s.id));
 }}
 onDragEnd={() => {
 setDraggingSessionId(null);
 setDragOverDate(null);
 }}
 onClick={(e) => {
 e.stopPropagation();
 setSelectedDay(dateStr);
 setSelectedDaySessions(new Set());
 }}
 className={`text-xs px-1.5 py-0.5 truncate cursor-grab active:cursor-grabbing ${tint} ${
 dragging ? "opacity-40" : ""
 }`}
 title="Drag to reschedule"
 >
 {s.athleteName.split(" ")[0]}: {s.label}
 </div>
 );
 })}
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
 <div className="bg-surface border border-line p-6">
 <div className="flex items-center justify-between mb-4">
 <h3 className="text-lg font-semibold text-ink">
 Sessions on {format(new Date(selectedDay + "T12:00:00"), "MMMM d, yyyy")}
 </h3>
 <button
 onClick={() => {
 setSelectedDay(null);
 setSelectedDaySessions(new Set());
 }}
 className="text-mute hover:text-ink"
 >
 <X className="w-5 h-5" />
 </button>
 </div>
 <div className="space-y-3">
 <div className="flex items-center justify-between gap-3 px-1">
 <label className="flex items-center gap-2 text-sm text-mute cursor-pointer">
 <input
 type="checkbox"
 checked={
 daySessions.length > 0 &&
 daySessions.every((s) =>
 selectedDaySessions.has(s.id)
 )
 }
 onChange={toggleAllDaySessions}
 className="accent-ink cursor-pointer"
 aria-label="Select all sessions on this day"
 />
 Select all
 </label>
 {selectedDaySessions.size > 0 && (
 <div className="flex items-center gap-2">
 <span className="text-sm text-ink">
 {selectedDaySessions.size} selected
 </span>
 <Button
 size="sm"
 variant="danger"
 onClick={handleBulkDeleteDay}
 >
 <Trash2 className="w-4 h-4 mr-1.5" />
 Delete
 </Button>
 </div>
 )}
 </div>
 {daySessions.map((s) => {
 const isSelected = selectedDaySessions.has(s.id);
 return (
 <div
 key={s.id}
 className={`flex items-center justify-between p-3 bg-surface ${
 isSelected ? "ring-1 ring-ink/30" : ""
 }`}
 >
 <div className="flex items-center gap-3 min-w-0">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={() => toggleDaySession(s.id)}
 className="accent-ink cursor-pointer"
 aria-label={`Select ${s.label} for ${s.athleteName}`}
 />
 <div className="min-w-0">
 <div className="text-ink font-medium truncate">
 {s.athleteName}
 </div>
 <div className="text-mute text-sm truncate">
 {s.label}
 </div>
 </div>
 </div>
 <div className="flex items-center gap-2 shrink-0">
 <Badge color={statusColor(s.status) as "emerald" | "yellow" | "red" | "neutral"}>
 {s.status}
 </Badge>
 <button
 onClick={() => handleDeleteSession(s)}
 className="p-1.5 text-mute hover:text-red-400 hover:bg-hover transition-colors cursor-pointer"
 title="Remove session"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 )}

 <div className="bg-surface border border-line p-6">
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
 className="flex items-center justify-between p-3 bg-surface "
 >
 <div>
 <div className="text-ink font-medium">{a.programName}</div>
 <div className="text-mute text-sm">
 {a.athleteName} &middot; Started {a.startDate}
 </div>
 </div>
 <div className="flex items-center gap-2">
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
 <button
 onClick={() => handleDeleteAssignment(a)}
 className="p-1.5 text-mute hover:text-red-400 hover:bg-hover transition-colors cursor-pointer"
 title="Unassign program"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </div>
 </div>
 ))
 )}
 </div>
 </div>

 <Modal open={showAssign} onClose={() => setShowAssign(false)} title="Assign Program">
 <form action={handleAssign} className="space-y-4">
 {assignError && (
 <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
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
 className="w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
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
 className="w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
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
 className="w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
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
