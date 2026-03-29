"use server";

import { db } from "@/db";
import {
  readinessEntries,
  setEntries,
  sprintEntries,
  assignedSessions,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function saveReadinessAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const athleteId = parseInt(formData.get("athleteId") as string);
  const assignedSessionId = formData.get("assignedSessionId")
    ? parseInt(formData.get("assignedSessionId") as string)
    : null;
  const date = formData.get("date") as string;
  const sleepQuality = parseInt(formData.get("sleepQuality") as string);
  const fatigue = parseInt(formData.get("fatigue") as string);
  const soreness = parseInt(formData.get("soreness") as string);
  const stress = parseInt(formData.get("stress") as string);
  const mood = parseInt(formData.get("mood") as string);
  const note = (formData.get("note") as string) || null;

  await db.insert(readinessEntries).values({
    athleteId,
    assignedSessionId,
    date,
    sleepQuality,
    fatigue,
    soreness,
    stress,
    mood,
    note,
  });

  revalidatePath("/athlete/today");
  return { success: true };
}

export async function logSetEntryAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const assignedSessionId = parseInt(
    formData.get("assignedSessionId") as string
  );
  const blockExerciseId = formData.get("blockExerciseId")
    ? parseInt(formData.get("blockExerciseId") as string)
    : null;
  const exerciseId = formData.get("exerciseId")
    ? parseInt(formData.get("exerciseId") as string)
    : null;
  const setNumber = parseInt(formData.get("setNumber") as string);
  const reps = formData.get("reps") ? parseInt(formData.get("reps") as string) : null;
  const load = formData.get("load") ? parseFloat(formData.get("load") as string) : null;
  const rpe = formData.get("rpe") ? parseFloat(formData.get("rpe") as string) : null;
  const completed = formData.get("completed") === "true";

  await db.insert(setEntries).values({
    assignedSessionId,
    blockExerciseId,
    exerciseId,
    setNumber,
    reps,
    load,
    rpe,
    completed,
  });

  if (assignedSessionId) {
    await db
      .update(assignedSessions)
      .set({ status: "in_progress" })
      .where(eq(assignedSessions.id, assignedSessionId));
  }

  revalidatePath("/athlete/today");
  return { success: true };
}

export async function logSprintEntryAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const assignedSessionId = parseInt(
    formData.get("assignedSessionId") as string
  );
  const blockExerciseId = formData.get("blockExerciseId")
    ? parseInt(formData.get("blockExerciseId") as string)
    : null;
  const repNumber = parseInt(formData.get("setNumber") as string);
  const distance = formData.get("distance")
    ? parseFloat(formData.get("distance") as string)
    : null;
  const time = formData.get("time")
    ? parseFloat(formData.get("time") as string)
    : null;
  const rpe = formData.get("rpe") ? parseFloat(formData.get("rpe") as string) : null;
  const completed = formData.get("completed") === "true";

  await db.insert(sprintEntries).values({
    assignedSessionId,
    blockExerciseId,
    repNumber,
    distance,
    time,
    rpe,
    completed,
  });

  if (assignedSessionId) {
    await db
      .update(assignedSessions)
      .set({ status: "in_progress" })
      .where(eq(assignedSessions.id, assignedSessionId));
  }

  revalidatePath("/athlete/today");
  return { success: true };
}

export async function completeSessionAction(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const assignedSessionId = parseInt(
    formData.get("assignedSessionId") as string
  );

  await db
    .update(assignedSessions)
    .set({ status: "completed", completedAt: new Date() })
    .where(eq(assignedSessions.id, assignedSessionId));

  revalidatePath("/athlete/today");
  return { success: true };
}
