import { db } from "@/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  assignedSessions,
  readinessEntries,
  sessionTemplates,
  sessionBlocks,
  blockExercises,
  exercises,
  setEntries,
  sprintEntries,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { format } from "date-fns";
import TodayClient from "./TodayClient";

export default async function TodayPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const athleteId = parseInt((session.user as { id?: string }).id ?? "0");
  const today = format(new Date(), "yyyy-MM-dd");

  const todaySession = await db
    .select()
    .from(assignedSessions)
    .where(
      and(
        eq(assignedSessions.athleteId, athleteId),
        eq(assignedSessions.date, today)
      )
    )
    .get();

  let sessionData = null;
  if (todaySession) {
    const readiness = await db
      .select()
      .from(readinessEntries)
      .where(
        and(
          eq(readinessEntries.athleteId, athleteId),
          eq(readinessEntries.date, today)
        )
      )
      .get();

    let blocks: Array<{
      id: number;
      blockType: string;
      label: string | null;
      sortOrder: number;
      exercises: Array<{
        id: number;
        exerciseId: number | null;
        exerciseName: string;
        exerciseCategory: string;
        trackingType: string;
        sets: number | null;
        reps: string | null;
        load: string | null;
        distance: number | null;
        time: number | null;
        restSeconds: number | null;
        rpeTarget: number | null;
        notes: string | null;
        sortOrder: number;
      }>;
    }> = [];

    if (todaySession.sessionTemplateId) {
      const templateBlocks = await db
        .select()
        .from(sessionBlocks)
        .where(eq(sessionBlocks.sessionTemplateId, todaySession.sessionTemplateId))
        .orderBy(sessionBlocks.sortOrder);

      for (const block of templateBlocks) {
        const blockExs = await db
          .select({
            id: blockExercises.id,
            exerciseId: blockExercises.exerciseId,
            sets: blockExercises.sets,
            reps: blockExercises.reps,
            load: blockExercises.load,
            distance: blockExercises.distance,
            time: blockExercises.time,
            restSeconds: blockExercises.restSeconds,
            rpeTarget: blockExercises.rpeTarget,
            notes: blockExercises.notes,
            sortOrder: blockExercises.sortOrder,
            exerciseName: exercises.name,
            exerciseCategory: exercises.category,
            trackingType: exercises.trackingType,
          })
          .from(blockExercises)
          .leftJoin(exercises, eq(blockExercises.exerciseId, exercises.id))
          .where(eq(blockExercises.blockId, block.id))
          .orderBy(blockExercises.sortOrder);

        blocks.push({
          id: block.id,
          blockType: block.blockType,
          label: block.label,
          sortOrder: block.sortOrder,
          exercises: blockExs.map((e) => ({
            ...e,
            exerciseName: e.exerciseName ?? "Exercise",
            exerciseCategory: e.exerciseCategory ?? "strength",
            trackingType: e.trackingType ?? "reps",
          })),
        });
      }
    }

    const loggedSets = await db
      .select()
      .from(setEntries)
      .where(eq(setEntries.assignedSessionId, todaySession.id));

    const loggedSprints = await db
      .select()
      .from(sprintEntries)
      .where(eq(sprintEntries.assignedSessionId, todaySession.id));

    sessionData = {
      ...todaySession,
      readiness: readiness ?? null,
      blocks,
      loggedSets,
      loggedSprints,
    };
  }

  const userName = session.user.name ?? "Athlete";

  return (
    <TodayClient
      session={sessionData}
      athleteId={athleteId}
      userName={userName}
      today={today}
    />
  );
}
