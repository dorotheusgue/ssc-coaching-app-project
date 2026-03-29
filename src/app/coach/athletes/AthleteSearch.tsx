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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search athletes by name, email, or sport..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <div className="text-center py-8">
            <User className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
            <p className="text-neutral-400">
              {query ? "No athletes match your search." : "No athletes yet."}
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                    Email
                  </th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                    Sport
                  </th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                    Current Program
                  </th>
                  <th className="text-left py-3 px-4 text-neutral-400 font-medium">
                    Last Session
                  </th>
                  <th className="py-3 px-4" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((athlete) => (
                  <tr
                    key={athlete.id}
                    className="border-b border-neutral-700/50 hover:bg-neutral-700/30"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                          <User className="w-4 h-4 text-emerald-500" />
                        </div>
                        <span className="text-white font-medium">
                          {athlete.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      {athlete.email}
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      {athlete.sport ?? "—"}
                    </td>
                    <td className="py-3 px-4">
                      {athlete.currentProgram ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500">
                          {athlete.currentProgram}
                        </span>
                      ) : (
                        <span className="text-neutral-500">None</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-neutral-300">
                      {athlete.lastSessionDate ?? "—"}
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/coach/athletes/${athlete.userId}`}
                        className="text-emerald-500 hover:text-emerald-400 inline-flex items-center gap-1 text-sm"
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
