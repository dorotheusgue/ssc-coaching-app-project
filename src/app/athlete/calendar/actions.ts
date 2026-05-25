"use server";

import { db } from "@/db";
import { auth } from "@/lib/auth";
import {
  assignedSessions,
  sessionBlocks,
  blockExercises,
  exercises,
} from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function authedAthleteId(): Promise<number | null> {
  const session = await auth();
  if (!session?.user) return null;
  const id = parseInt((session.user as { id?: string }).id ?? "0");
  return id || null;
}

export async function getSessionPreviewAction(sessionId: number) {
  const athleteId = await authedAthleteId();
  if (!athleteId) return { ok: false as const, error: "Unauthorized" };

  const assigned = await db
    .select()
    .from(assignedSessions)
    .where(
      and(
        eq(assignedSessions.id, sessionId),
        eq(assignedSessions.athleteId, athleteId)
      )
    )
    .get();
  if (!assigned) return { ok: false as const, error: "Not found" };

  if (!assigned.sessionTemplateId) {
    return {
      ok: true as const,
      session: assigned,
      blocks: [],
    };
  }

  const blocks = await db
    .select()
    .from(sessionBlocks)
    .where(eq(sessionBlocks.sessionTemplateId, assigned.sessionTemplateId))
    .orderBy(asc(sessionBlocks.sortOrder));

  const blocksWithExercises = [] as Array<{
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
  }>;

  for (const block of blocks) {
    const exs = await db
      .select({
        id: blockExercises.id,
        name: exercises.name,
        sets: blockExercises.sets,
        reps: blockExercises.reps,
        load: blockExercises.load,
        distance: blockExercises.distance,
        time: blockExercises.time,
        restSeconds: blockExercises.restSeconds,
        rpeTarget: blockExercises.rpeTarget,
        notes: blockExercises.notes,
      })
      .from(blockExercises)
      .leftJoin(exercises, eq(blockExercises.exerciseId, exercises.id))
      .where(eq(blockExercises.blockId, block.id))
      .orderBy(asc(blockExercises.sortOrder));

    blocksWithExercises.push({
      id: block.id,
      blockType: block.blockType,
      label: block.label,
      exercises: exs.map((e) => ({
        ...e,
        name: e.name ?? "Exercise",
      })),
    });
  }

  return { ok: true as const, session: assigned, blocks: blocksWithExercises };
}

export async function skipSessionAction(sessionId: number) {
  const athleteId = await authedAthleteId();
  if (!athleteId) return { ok: false as const, error: "Unauthorized" };

  await db
    .update(assignedSessions)
    .set({ status: "skipped" })
    .where(
      and(
        eq(assignedSessions.id, sessionId),
        eq(assignedSessions.athleteId, athleteId)
      )
    );

  revalidatePath("/athlete/calendar");
  revalidatePath("/athlete/today");
  return { ok: true as const };
}

export async function rescheduleOwnSessionAction(
  sessionId: number,
  newDate: string
) {
  const athleteId = await authedAthleteId();
  if (!athleteId) return { ok: false as const, error: "Unauthorized" };

  if (!/^\d{4}-\d{2}-\d{2}$/.test(newDate)) {
    return { ok: false as const, error: "Invalid date" };
  }

  await db
    .update(assignedSessions)
    .set({ date: newDate })
    .where(
      and(
        eq(assignedSessions.id, sessionId),
        eq(assignedSessions.athleteId, athleteId)
      )
    );

  revalidatePath("/athlete/calendar");
  revalidatePath("/athlete/today");
  return { ok: true as const };
}
