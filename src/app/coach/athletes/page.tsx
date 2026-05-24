import { auth } from "@/lib/auth";
import { db } from "@/db";
import {
  users,
  athleteProfiles,
  programs,
  assignedSessions,
  programAssignments,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { AthleteSearch } from "./AthleteSearch";
import { InviteAthleteButton } from "./InviteAthleteButton";

export default async function AthletesPage() {
  const session = await auth();
  const coachId = Number((session!.user as { id?: string }).id);

  const athletes = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      sport: athleteProfiles.sport,
      userId: athleteProfiles.userId,
    })
    .from(athleteProfiles)
    .innerJoin(users, eq(users.id, athleteProfiles.userId))
    .where(eq(athleteProfiles.coachId, coachId))
    .orderBy(users.name);

  const athletesWithMeta = await Promise.all(
    athletes.map(async (a) => {
      const [assignment] = await db
        .select({ programName: programs.name })
        .from(programAssignments)
        .innerJoin(programs, eq(programs.id, programAssignments.programId))
        .where(
          and(
            eq(programAssignments.athleteId, a.userId),
            eq(programAssignments.status, "active")
          )
        )
        .limit(1);

      const [lastSession] = await db
        .select({ date: assignedSessions.date })
        .from(assignedSessions)
        .where(eq(assignedSessions.athleteId, a.userId))
        .orderBy(desc(assignedSessions.date))
        .limit(1);

      return {
        ...a,
        currentProgram: assignment?.programName ?? null,
        lastSessionDate: lastSession?.date ?? null,
      };
    })
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Athletes</h1>
          <p className="text-neutral-400 mt-1">
            {athletes.length} athlete{athletes.length !== 1 ? "s" : ""} in your
            roster
          </p>
        </div>
        <InviteAthleteButton coachId={coachId} />
      </div>

      <AthleteSearch athletes={athletesWithMeta} />
    </div>
  );
}
