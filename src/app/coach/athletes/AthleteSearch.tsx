"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, User, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";

interface Athlete {
 id: number;
 name: string;
 email: string;
 sport: string | null;
 userId: number;
 currentProgram: string | null;
 lastSessionDate: string | null;
}

interface AthleteSearchProps {
 athletes: Athlete[];
}

export function AthleteSearch({ athletes }: AthleteSearchProps) {
 const [query, setQuery] = useState("");

 const filtered = athletes.filter(
 (a) =>
 a.name.toLowerCase().includes(query.toLowerCase()) ||
 a.email.toLowerCase().includes(query.toLowerCase()) ||
 (a.sport ?? "").toLowerCase().includes(query.toLowerCase())
 );

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
 {filtered.map((athlete) => (
 <tr
 key={athlete.id}
 className="border-b border-line/50 hover:bg-hover/30"
 >
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
 <td className="py-3 px-4 text-ink">
 {athlete.email}
 </td>
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
 ))}
 </tbody>
 </table>
 </div>
 </Card>
 )}
 </div>
 );
}
