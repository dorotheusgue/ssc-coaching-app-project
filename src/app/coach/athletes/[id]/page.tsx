import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  users,
  athleteProfiles,
  programs,
  assignedSessions,
  readinessEntries,
  programAssignments,
} from "@/db/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { ArrowLeft, User, Clock, Trophy } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { AthleteDetailClient } from "./AthleteDetailClient";

export default async function AthleteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const coachId = Number((session!.user as { id?: string }).id);
  const athleteId = Number(id);

  const [athlete] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      sport: athleteProfiles.sport,
      event: athleteProfiles.event,
      personalBests: athleteProfiles.personalBests,
      height: athleteProfiles.height,
      weight: athleteProfiles.weight,
      dateOfBirth: athleteProfiles.dateOfBirth,
      notes: athleteProfiles.notes,
    })
    .from(athleteProfiles)
    .innerJoin(users, eq(users.id, athleteProfiles.userId))
    .where(
      and(
        eq(athleteProfiles.userId, athleteId),
        eq(athleteProfiles.coachId, coachId)
      )
    );

  if (!athlete) notFound();

  const [activeAssignment] = await db
    .select({
      programName: programs.name,
      startDate: programAssignments.startDate,
      status: programAssignments.status,
    })
    .from(programAssignments)
    .innerJoin(programs, eq(programs.id, programAssignments.programId))
    .where(
      and(
        eq(programAssignments.athleteId, athleteId),
        eq(programAssignments.status, "active")
      )
    )
    .limit(1);

  const [nextSession] = await db
    .select({
      id: assignedSessions.id,
      label: assignedSessions.label,
      date: assignedSessions.date,
      status: assignedSessions.status,
    })
    .from(assignedSessions)
    .where(
      and(
        eq(assignedSessions.athleteId, athleteId),
        eq(assignedSessions.status, "scheduled")
      )
    )
    .orderBy(assignedSessions.date)
    .limit(1);

  const recentSessions = await db
    .select({
      id: assignedSessions.id,
      label: assignedSessions.label,
      date: assignedSessions.date,
      status: assignedSessions.status,
      completedAt: assignedSessions.completedAt,
    })
    .from(assignedSessions)
    .where(eq(assignedSessions.athleteId, athleteId))
    .orderBy(desc(assignedSessions.date))
    .limit(10);

  const recentReadiness = await db
    .select({
      id: readinessEntries.id,
      date: readinessEntries.date,
      sleepQuality: readinessEntries.sleepQuality,
      fatigue: readinessEntries.fatigue,
      soreness: readinessEntries.soreness,
      stress: readinessEntries.stress,
      mood: readinessEntries.mood,
    })
    .from(readinessEntries)
    .where(eq(readinessEntries.athleteId, athleteId))
    .orderBy(desc(readinessEntries.date))
    .limit(14);

  const allSessions = await db
    .select({
      id: assignedSessions.id,
      label: assignedSessions.label,
      date: assignedSessions.date,
      status: assignedSessions.status,
      completedAt: assignedSessions.completedAt,
    })
    .from(assignedSessions)
    .where(eq(assignedSessions.athleteId, athleteId))
    .orderBy(desc(assignedSessions.date));

  const personalBests = (athlete.personalBests as Record<string, unknown>) ?? {};

  return (
    <div className="space-y-6">
      <Link
        href="/coach/athletes"
        className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Athletes
      </Link>

      <Card>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
            <User className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white">{athlete.name}</h1>
            <p className="text-neutral-400 mt-1">{athlete.email}</p>
            <div className="flex flex-wrap gap-4 mt-4">
              {athlete.sport && (
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  <span className="text-neutral-500">Sport:</span>
                  <span className="text-white font-medium">{athlete.sport}</span>
                </div>
              )}
              {athlete.event && (
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  <span className="text-neutral-500">Event:</span>
                  <span className="text-white font-medium">{athlete.event}</span>
                </div>
              )}
              {athlete.height && (
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  <span className="text-neutral-500">Height:</span>
                  <span className="text-white font-medium">{athlete.height} cm</span>
                </div>
              )}
              {athlete.weight && (
                <div className="flex items-center gap-2 text-sm text-neutral-300">
                  <span className="text-neutral-500">Weight:</span>
                  <span className="text-white font-medium">{athlete.weight} kg</span>
                </div>
              )}
            </div>
            {Object.keys(personalBests).length > 0 && (
              <div className="mt-4">
                <div className="flex items-center gap-2 text-sm text-neutral-400 mb-2">
                  <Trophy className="w-4 h-4 text-amber-500" />
                  Personal Bests
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(personalBests).map(([key, value]) => (
                    <span
                      key={key}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20"
                    >
                      {key}: {String(value)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      <AthleteDetailClient
        activeAssignment={activeAssignment}
        nextSession={nextSession}
        recentSessions={recentSessions}
        recentReadiness={recentReadiness}
        allSessions={allSessions}
      />
    </div>
  );
}
