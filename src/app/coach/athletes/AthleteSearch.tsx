"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, User, ChevronRight, CalendarPlus } from "lucide-react";
import { format } from "date-fns";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { assignProgramToManyAction } from "@/app/coach/calendar/actions";

interface Athlete {
 id: number;
 name: string;
 email: string;
 sport: string | null;
 userId: number;
 currentProgram: string | null;
 lastSessionDate: string | null;
}

interface Program {
 id: number;
 name: string;
}

interface AthleteSearchProps {
 athletes: Athlete[];
 programs: Program[];
}

export function AthleteSearch({ athletes, programs }: AthleteSearchProps) {
 const router = useRouter();
 const [query, setQuery] = useState("");
 const [selected, setSelected] = useState<Set<number>>(new Set());
 const [assignOpen, setAssignOpen] = useState(false);
 const [programId, setProgramId] = useState<string>("");
 const [startDate, setStartDate] = useState<string>(
 format(new Date(), "yyyy-MM-dd")
 );
 const [error, setError] = useState("");
 const [isPending, startTransition] = useTransition();

 const filtered = athletes.filter(
 (a) =>
 a.name.toLowerCase().includes(query.toLowerCase()) ||
 a.email.toLowerCase().includes(query.toLowerCase()) ||
 (a.sport ?? "").toLowerCase().includes(query.toLowerCase())
 );

 const allFilteredSelected =
 filtered.length > 0 && filtered.every((a) => selected.has(a.userId));

 function toggleOne(id: number) {
 setSelected((prev) => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id);
 else next.add(id);
 return next;
 });
 }

 function toggleAllVisible() {
 setSelected((prev) => {
 const next = new Set(prev);
 if (allFilteredSelected) {
 filtered.forEach((a) => next.delete(a.userId));
 } else {
 filtered.forEach((a) => next.add(a.userId));
 }
 return next;
 });
 }

 function clear() {
 setSelected(new Set());
 }

 function openAssign() {
 setError("");
 setProgramId(programs[0]?.id?.toString() ?? "");
 setStartDate(format(new Date(), "yyyy-MM-dd"));
 setAssignOpen(true);
 }

 function handleAssign() {
 const ids = Array.from(selected);
 if (ids.length === 0 || !programId || !startDate) {
 setError("Pick a program and a start date.");
 return;
 }
 const formData = new FormData();
 formData.set("programId", programId);
 formData.set("athleteIds", ids.join(","));
 formData.set("startDate", startDate);
 startTransition(async () => {
 const res = await assignProgramToManyAction(formData);
 if (res.error) {
 setError(res.error);
 return;
 }
 setAssignOpen(false);
 clear();
 router.refresh();
 });
 }

 return (
 <div className="space-y-4">
 <div className="relative">
 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-faint" />
 <input
 type="text"
 placeholder="Search athletes by name, email, or sport..."
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 className="w-full pl-10 pr-4 py-2.5 bg-surface border border-line text-ink placeholder:text-faint focus:outline-none focus:ring-2 focus:ring-ink focus:border-transparent text-sm"
 />
 </div>

 {selected.size > 0 && (
 <div className="flex items-center justify-between gap-3 px-4 py-2 bg-ink/5 border border-line">
 <span className="text-sm text-ink">{selected.size} selected</span>
 <div className="flex gap-2">
 <Button size="sm" variant="ghost" onClick={clear}>
 Cancel
 </Button>
 <Button
 size="sm"
 onClick={openAssign}
 disabled={programs.length === 0}
 title={
 programs.length === 0
 ? "Create a program first to bulk assign"
 : undefined
 }
 >
 <CalendarPlus className="w-4 h-4 mr-1.5" />
 Assign program
 </Button>
 </div>
 </div>
 )}

 {filtered.length === 0 ? (
 <Card>
 <div className="text-center py-8">
 <User className="w-10 h-10 text-faint mx-auto mb-3" />
 <p className="text-mute">
 {query ? "No athletes match your search." : "No athletes yet."}
 </p>
 </div>
 </Card>
 ) : (
 <Card>
 <div className="overflow-x-auto">
 <table className="w-full text-sm">
 <thead>
 <tr className="border-b border-line">
 <th className="py-3 px-4 w-10">
 <input
 type="checkbox"
 checked={allFilteredSelected}
 onChange={toggleAllVisible}
 className="accent-ink cursor-pointer"
 aria-label="Select all athletes"
 />
 </th>
 <th className="text-left py-3 px-4 text-mute font-medium">
 Name
 </th>
 <th className="text-left py-3 px-4 text-mute font-medium">
 Email
 </th>
 <th className="text-left py-3 px-4 text-mute font-medium">
 Sport
 </th>
 <th className="text-left py-3 px-4 text-mute font-medium">
 Current Program
 </th>
 <th className="text-left py-3 px-4 text-mute font-medium">
 Last Session
 </th>
 <th className="py-3 px-4" />
 </tr>
 </thead>
 <tbody>
 {filtered.map((athlete) => {
 const isSelected = selected.has(athlete.userId);
 return (
 <tr
 key={athlete.id}
 className={`border-b border-line/50 hover:bg-hover/30 ${
 isSelected ? "bg-ink/5" : ""
 }`}
 >
 <td className="py-3 px-4">
 <input
 type="checkbox"
 checked={isSelected}
 onChange={() => toggleOne(athlete.userId)}
 className="accent-ink cursor-pointer"
 aria-label={`Select ${athlete.name}`}
 />
 </td>
 <td className="py-3 px-4">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 bg-ink/10 flex items-center justify-center">
 <User className="w-4 h-4 text-ink" />
 </div>
 <span className="text-ink font-medium">
 {athlete.name}
 </span>
 </div>
 </td>
 <td className="py-3 px-4 text-ink">{athlete.email}</td>
 <td className="py-3 px-4 text-ink">
 {athlete.sport ?? "—"}
 </td>
 <td className="py-3 px-4">
 {athlete.currentProgram ? (
 <span className="inline-flex items-center px-2.5 py-0.5 text-xs font-medium bg-ink/10 text-ink">
 {athlete.currentProgram}
 </span>
 ) : (
 <span className="text-faint">None</span>
 )}
 </td>
 <td className="py-3 px-4 text-ink">
 {athlete.lastSessionDate ?? "—"}
 </td>
 <td className="py-3 px-4">
 <Link
 href={`/coach/athletes/${athlete.userId}`}
 className="text-ink hover:text-ink inline-flex items-center gap-1 text-sm"
 >
 View
 <ChevronRight className="w-4 h-4" />
 </Link>
 </td>
 </tr>
 );
 })}
 </tbody>
 </table>
 </div>
 </Card>
 )}

 <Modal
 open={assignOpen}
 onClose={() => setAssignOpen(false)}
 title={`Assign program to ${selected.size} athlete${selected.size === 1 ? "" : "s"}`}
 >
 <div className="space-y-4">
 {error && (
 <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
 {error}
 </div>
 )}
 <div>
 <label className="block text-sm text-ink mb-1">Program</label>
 <select
 value={programId}
 onChange={(e) => setProgramId(e.target.value)}
 className="w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 >
 {programs.length === 0 ? (
 <option value="">No programs available</option>
 ) : (
 programs.map((p) => (
 <option key={p.id} value={p.id}>
 {p.name}
 </option>
 ))
 )}
 </select>
 </div>
 <div>
 <label className="block text-sm text-ink mb-1">Start date</label>
 <input
 type="date"
 value={startDate}
 onChange={(e) => setStartDate(e.target.value)}
 className="w-full bg-surface border border-line px-3 py-2 text-ink focus:outline-none focus:ring-2 focus:ring-ink"
 />
 </div>
 <div className="flex justify-end gap-2">
 <Button variant="ghost" onClick={() => setAssignOpen(false)}>
 Cancel
 </Button>
 <Button onClick={handleAssign} disabled={isPending}>
 {isPending ? "Assigning..." : "Assign"}
 </Button>
 </div>
 </div>
 </Modal>
 </div>
 );
}
