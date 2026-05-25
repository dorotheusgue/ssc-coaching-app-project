"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
 LineChart,
 Line,
 XAxis,
 YAxis,
 CartesianGrid,
 Tooltip,
 ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/Card";
import { Activity, Calendar, Clock, TrendingUp, Trash2 } from "lucide-react";
import {
 deleteAssignedSessionAction,
 deleteAssignedSessionsAction,
} from "@/app/coach/calendar/actions";
import { Button } from "@/components/ui/Button";

interface Session {
 id: number;
 label: string;
 date: string;
 status: "completed" | "scheduled" | "skipped" | "in_progress";
 completedAt: Date | null;
 notes: string | null;
}

interface ReadinessEntry {
 id: number;
 date: string;
 sleepQuality: number;
 fatigue: number;
 soreness: number;
 stress: number;
 mood: number;
}

interface ActiveAssignment {
 programName: string;
 startDate: string;
 status: string;
}

interface NextSession {
 id: number;
 label: string;
 date: string;
 status: string;
}

interface AthleteDetailClientProps {
 activeAssignment: ActiveAssignment | undefined;
 nextSession: NextSession | undefined;
 recentSessions: Session[];
 recentReadiness: ReadinessEntry[];
 allSessions: Session[];
}

const tabs = ["Overview", "Sessions", "Readiness", "Progress"] as const;
type Tab = (typeof tabs)[number];

export function AthleteDetailClient({
 activeAssignment,
 nextSession,
 recentSessions,
 recentReadiness,
 allSessions,
}: AthleteDetailClientProps) {
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<Tab>("Overview");
 const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

 const allSessionIds = allSessions.map((s) => s.id);
 const allSelected =
 allSessionIds.length > 0 &&
 allSessionIds.every((id) => selectedIds.has(id));

 function toggleOne(id: number) {
 setSelectedIds((prev) => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 return next;
 });
 }

 function toggleAll() {
 setSelectedIds(allSelected ? new Set() : new Set(allSessionIds));
 }

 function clearSelection() {
 setSelectedIds(new Set());
 }

 async function handleDeleteSession(s: Session) {
   if (!confirm(`Remove session "${s.label}" on ${s.date}?`)) return;
   await deleteAssignedSessionAction(s.id);
   router.refresh();
 }

 async function handleBulkDelete() {
 const ids = Array.from(selectedIds);
 if (ids.length === 0) return;
 if (
 !confirm(
 `Remove ${ids.length} session${ids.length === 1 ? "" : "s"}? Any logged sets will be lost.`
 )
 ) {
 return;
 }
 await deleteAssignedSessionsAction(ids);
 clearSelection();
 router.refresh();
 }

 const readinessChartData = [...recentReadiness]
 .reverse()
 .map((r) => ({
 date: r.date.slice(5),
 sleep: r.sleepQuality,
 fatigue: r.fatigue,
 soreness: r.soreness,
 stress: r.stress,
 mood: r.mood,
 composite: Number(
 (
 (r.sleepQuality + (6 - r.fatigue) + (6 - r.soreness) + (6 - r.stress) + r.mood) /
 5
 ).toFixed(1)
 ),
 }));

 const completedSessions = allSessions.filter(
 (s) => s.status === "completed"
 );

 const progressData = completedSessions
 .slice()
 .reverse()
 .map((s, i) => ({
 session: `#${i + 1}`,
 date: s.date.slice(5),
 count: i + 1,
 }));

 return (
 <div className="space-y-6">
 <div className="flex gap-1 border-b border-line">
 {tabs.map((tab) => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 cursor-pointer ${
 activeTab === tab
 ? "border-line text-ink"
 : "border-transparent text-mute hover:text-ink"
 }`}
 >
 {tab}
 </button>
 ))}
 </div>

 {activeTab === "Overview" && (
 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 <Card title="Current Program">
 {activeAssignment ? (
 <div className="space-y-3">
 <div className="flex items-center gap-3">
 <div className="p-2 bg-ink/10">
 <Activity className="w-4 h-4 text-ink" />
 </div>
 <div>
 <p className="text-ink font-medium">
 {activeAssignment.programName}
 </p>
 <p className="text-xs text-mute">
 Started {activeAssignment.startDate}
 </p>
 </div>
 </div>
 <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-ink/10 text-ink">
 {activeAssignment.status}
 </span>
 </div>
 ) : (
 <p className="text-mute text-sm">
 No active program assigned.
 </p>
 )}
 </Card>

 <Card title="Next Session">
 {nextSession ? (
 <div className="flex items-center gap-3">
 <div className="p-2 bg-ink/10">
 <Calendar className="w-4 h-4 text-ink" />
 </div>
 <div>
 <p className="text-ink font-medium">{nextSession.label}</p>
 <p className="text-xs text-mute">
 {nextSession.date}
 </p>
 </div>
 </div>
 ) : (
 <p className="text-mute text-sm">
 No upcoming sessions scheduled.
 </p>
 )}
 </Card>

 <Card title="Recent Activity" className="lg:col-span-2">
 {recentSessions.length === 0 ? (
 <p className="text-mute text-sm">No recent activity.</p>
 ) : (
 <div className="space-y-2">
 {recentSessions.map((s) => (
 <div
 key={s.id}
 className="flex items-center justify-between py-2 border-b border-line/50 last:border-0"
 >
 <div className="flex items-center gap-3">
 <div
 className={`w-2 h-2 ${
 s.status === "completed"
 ? "bg-ink"
 : s.status === "scheduled"
 ? "bg-ink"
 : s.status === "skipped"
 ? "bg-red-500"
 : "bg-mute"
 }`}
 />
 <span className="text-sm text-ink">{s.label}</span>
 </div>
 <div className="flex items-center gap-3 text-sm text-mute">
 <span>{s.date}</span>
 <span className="capitalize text-xs px-2 py-0.5 bg-surface">
 {s.status}
 </span>
 </div>
 </div>
 ))}
 </div>
 )}
 </Card>
 </div>
 )}

 {activeTab === "Sessions" && (
 <Card>
 {allSessions.length === 0 ? (
 <p className="text-mute text-sm py-4">No sessions found.</p>
 ) : (
 <div className="space-y-3">
 {selectedIds.size > 0 && (
 <div className="flex items-center justify-between gap-3 px-4 py-2 bg-ink/5 border border-line">
 <span className="text-sm text-ink">
 {selectedIds.size} selected
 </span>
 <div className="flex gap-2">
 <Button size="sm" variant="ghost" onClick={clearSelection}>
 Cancel
 </Button>
 <Button
 size="sm"
 variant="danger"
 onClick={handleBulkDelete}
 >
 <Trash2 className="w-4 h-4 mr-1.5" />
 Delete {selectedIds.size}
 </Button>
 </div>
 </div>
 )}
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-line">
 <th className="py-3 px-4 w-10">
 <input
 type="checkbox"
 checked={allSelected}
 onChange={toggleAll}
 className="accent-ink cursor-pointer"
 aria-label="Select all sessions"
 />
 </th>
 <th className="text-left py-3 px-4 text-mute font-medium">
 Session
 </th>
 <th className="text-left py-3 px-4 text-mute font-medium">
 Date
 </th>
 <th className="text-left py-3 px-4 text-mute font-medium">
 Status
 </th>
 <th className="text-left py-3 px-4 text-mute font-medium">
 Completed
 </th>
 <th className="text-left py-3 px-4 text-mute font-medium">
 Notes
 </th>
 <th />
 </tr>
 </thead>
 <tbody>
 {allSessions.map((s) => {
 const isSelected = selectedIds.has(s.id);
 return (
 <tr
 key={s.id}
 className={`border-b border-line/50 hover:bg-hover/30 ${
 isSelected ? "bg-ink/5" : ""
 }`}
 >
 <td className="py-3 px-4">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={() => toggleOne(s.id)}
 className="accent-ink cursor-pointer"
 aria-label={`Select session ${s.label}`}
 />
 </td>
 <td className="py-3 px-4 text-ink">{s.label}</td>
 <td className="py-3 px-4 text-ink">{s.date}</td>
 <td className="py-3 px-4">
 <span
 className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${
 s.status === "completed"
 ? "bg-ink/10 text-ink"
 : s.status === "scheduled"
 ? "bg-ink/10 text-ink"
 : s.status === "in_progress"
 ? "bg-ink/10 text-ink"
 : "bg-red-500/10 text-red-500"
 }`}
 >
 {s.status}
 </span>
 </td>
 <td className="py-3 px-4 text-ink">
 {s.completedAt
 ? new Date(s.completedAt).toLocaleString()
 : "—"}
 </td>
 <td className="py-3 px-4 text-mute max-w-xs">
 {s.notes ? (
 <span className="line-clamp-2 whitespace-pre-wrap" title={s.notes}>
 {s.notes}
 </span>
 ) : (
 "—"
 )}
 </td>
 <td className="py-3 px-4 text-right">
 <button
 onClick={() => handleDeleteSession(s)}
 className="p-1 text-mute hover:text-red-400 hover:bg-hover transition-colors cursor-pointer"
 title="Remove session"
 >
 <Trash2 className="w-4 h-4" />
 </button>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </Card>
 )}

 {activeTab === "Readiness" && (
 <div className="space-y-6">
 <Card title="Readiness Trends (Last 14 Entries)">
 {readinessChartData.length === 0 ? (
 <p className="text-mute text-sm py-4">
 No readiness data available.
 </p>
 ) : (
 <div className="h-72">
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={readinessChartData}>
 <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
 <XAxis dataKey="date" stroke="#a3a3a3" fontSize={12} />
 <YAxis
 stroke="#a3a3a3"
 fontSize={12}
 domain={[1, 5]}
 ticks={[1, 2, 3, 4, 5]}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: "#262626",
 border: "1px solid #404040",
 borderRadius: "8px",
 color: "#fff",
 }}
 />
 <Line
 type="monotone"
 dataKey="composite"
 stroke="#10b981"
 strokeWidth={2}
 dot={{ r: 3 }}
 name="Composite"
 />
 <Line
 type="monotone"
 dataKey="sleep"
 stroke="#3b82f6"
 strokeWidth={1.5}
 dot={false}
 name="Sleep"
 />
 <Line
 type="monotone"
 dataKey="mood"
 stroke="#f59e0b"
 strokeWidth={1.5}
 dot={false}
 name="Mood"
 />
 </LineChart>
 </ResponsiveContainer>
 </div>
 )}
 </Card>

 <Card title="Readiness History">
 {recentReadiness.length === 0 ? (
 <p className="text-mute text-sm py-4">
 No readiness entries found.
 </p>
 ) : (
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-line">
 <th className="text-left py-3 px-4 text-mute font-medium">
 Date
 </th>
 <th className="text-center py-3 px-4 text-mute font-medium">
 Sleep
 </th>
 <th className="text-center py-3 px-4 text-mute font-medium">
 Fatigue
 </th>
 <th className="text-center py-3 px-4 text-mute font-medium">
 Soreness
 </th>
 <th className="text-center py-3 px-4 text-mute font-medium">
 Stress
 </th>
 <th className="text-center py-3 px-4 text-mute font-medium">
 Mood
 </th>
 </tr>
 </thead>
 <tbody>
 {recentReadiness.map((r) => (
 <tr
 key={r.id}
 className="border-b border-line/50 hover:bg-hover/30"
 >
 <td className="py-3 px-4 text-ink">{r.date}</td>
 <td className="py-3 px-4 text-center text-ink">
 {r.sleepQuality}
 </td>
 <td className="py-3 px-4 text-center text-ink">
 {r.fatigue}
 </td>
 <td className="py-3 px-4 text-center text-red-400">
 {r.soreness}
 </td>
 <td className="py-3 px-4 text-center text-ink">
 {r.stress}
 </td>
 <td className="py-3 px-4 text-center text-ink">
 {r.mood}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 )}
 </Card>
 </div>
 )}

 {activeTab === "Progress" && (
 <Card title="Session Completion Progress">
 {progressData.length === 0 ? (
 <p className="text-mute text-sm py-4">
 No completed sessions to show progress.
 </p>
 ) : (
 <div className="space-y-6">
 <div className="h-64">
 <ResponsiveContainer width="100%" height="100%">
 <LineChart data={progressData}>
 <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
 <XAxis dataKey="date" stroke="#a3a3a3" fontSize={12} />
 <YAxis
 stroke="#a3a3a3"
 fontSize={12}
 allowDecimals={false}
 />
 <Tooltip
 contentStyle={{
 backgroundColor: "#262626",
 border: "1px solid #404040",
 borderRadius: "8px",
 color: "#fff",
 }}
 />
 <Line
 type="monotone"
 dataKey="count"
 stroke="#10b981"
 strokeWidth={2}
 dot={{ r: 3 }}
 name="Total Completed"
 />
 </LineChart>
 </ResponsiveContainer>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-line">
 <th className="text-left py-3 px-4 text-mute font-medium">
 Session
 </th>
 <th className="text-left py-3 px-4 text-mute font-medium">
 Date
 </th>
 <th className="text-left py-3 px-4 text-mute font-medium">
 Cumulative
 </th>
 </tr>
 </thead>
 <tbody>
 {completedSessions.map((s, i) => (
 <tr
 key={s.id}
 className="border-b border-line/50 hover:bg-hover/30"
 >
 <td className="py-3 px-4 text-ink">{s.label}</td>
 <td className="py-3 px-4 text-ink">{s.date}</td>
 <td className="py-3 px-4 text-ink font-medium">
 {completedSessions.length - i}
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}
 </Card>
 )}
 </div>
 );
}
